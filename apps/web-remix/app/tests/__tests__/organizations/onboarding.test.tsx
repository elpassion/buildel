import React from "react";
import { Outlet } from "@remix-run/react";
import { describe, test } from "vitest";
import { RootErrorBoundary } from "~/components/errorBoundaries/RootErrorBoundary";
import { loader as homeLoader } from "~/components/pages/home/loader.server";
import { action as newOrganizationAction } from "~/components/pages/organizations/new/action.server";
import { loader as newOrganizationLoader } from "~/components/pages/organizations/new/loader.server";
import { NewOrganizationPage } from "~/components/pages/organizations/new/page";
import { loader as organizationLoader } from "~/components/pages/organizations/show/loader.server";
import { action as pipelinesAction } from "~/components/pages/pipelines/list/action.server";
import { loader as pipelinesLoader } from "~/components/pages/pipelines/list/loader.server";
import { PipelinesPage } from "~/components/pages/pipelines/list/page";
import { organizationFixture } from "~/tests/fixtures/organization.fixtures";
import { OrganizationHandlers } from "~/tests/handlers/organization.handlers";
import { PipelineHandlers } from "~/tests/handlers/pipelines.handlers";
import { ButtonHandle } from "~/tests/handles/Button.handle";
import { InputHandle } from "~/tests/handles/Input.handle";
import { render, screen } from "~/tests/render";
import { server } from "~/tests/server.mock";
import type {
  RoutesProps} from "~/tests/setup.tests";
import {
  actionWithSession,
  loaderWithSession,
  setupRoutes,
} from "~/tests/setup.tests";

const handlers = () => [
  ...new PipelineHandlers().handlers,
  ...new OrganizationHandlers([
    organizationFixture(),
    organizationFixture({ id: 2, name: "super-organization" }),
    organizationFixture({ id: 3, name: "great-organization" }),
  ]).handlers,
];
describe("Onboarding", () => {
  const setupServer = server(handlers());

  beforeAll(() => setupServer.listen());
  afterEach(() => setupServer.resetHandlers(...handlers()));
  afterAll(() => setupServer.close());

  test("should redirect to newOrganizationPage if organizations empty", async () => {
    setupServer.use(...new OrganizationHandlers().handlers);
    new OnboardingObject().render({
      initialEntries: ["/"],
    });

    await screen.findByText(/Name your organisation/i);
  });

  test("should create new organization", async () => {
    setupServer.use(...new OrganizationHandlers().handlers);
    new OnboardingObject().render({
      initialEntries: ["/organizations/new"],
    });

    const name = await InputHandle.fromLabelText(/organization.name/i);
    await name.type("NEW_NEW_NEW");

    const submit = await ButtonHandle.fromRole("Create organisation");
    await submit.click();

    await screen.findByText(/Pick a starting point for your next AI workflow/i);
  });

  test("should redirect to organization saved in cookie", async () => {
    new OnboardingObject().render(
      {
        initialEntries: ["/"],
      },
      2
    );

    await screen.findByTestId(/organization-2/i);
  });

  test("should redirect to last organization if id not match", async () => {
    new OnboardingObject().render(
      {
        initialEntries: ["/"],
      },
      22
    );

    await screen.findByTestId(/organization-3/i);
  });

  test("should show runtime error message if loader fails", async () => {
    setupServer.use(new OrganizationHandlers().getOrganizationsError());
    new OnboardingObject().render(
      {
        initialEntries: ["/"],
      },
      22
    );

    await screen.findByText(/Internal server error/i);
  });
});

class OnboardingObject {
  render(props?: RoutesProps, organizationId?: number) {
    const Routes = setupRoutes([
      {
        path: "/",
        Component: () => <Outlet />,
        ErrorBoundary: RootErrorBoundary,
        loader: loaderWithSession(homeLoader, { organizationId }),
      },
      {
        path: "/organizations/new",
        Component: NewOrganizationPage,
        ErrorBoundary: RootErrorBoundary,
        loader: loaderWithSession(newOrganizationLoader),
        action: actionWithSession(newOrganizationAction),
      },

      {
        path: "/:organizationId",
        loader: loaderWithSession(organizationLoader),
      },
      {
        path: "/:organizationId/pipelines",
        Component: PipelinesPage,
        loader: loaderWithSession(pipelinesLoader),
        action: actionWithSession(pipelinesAction),
      },
    ]);

    render(<Routes {...props} />);

    return this;
  }
}
