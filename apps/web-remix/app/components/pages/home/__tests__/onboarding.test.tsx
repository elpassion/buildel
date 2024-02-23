import React from "react";
import { test, describe } from "vitest";
import {
  actionWithSession,
  loaderWithSession,
  RoutesProps,
  setupRoutes,
} from "~/tests/setup.tests";
import { Outlet } from "@remix-run/react";
import { render, screen } from "~/tests/render";
import { server } from "~/tests/server.mock";
import { PipelinesPage } from "../../pipelines/list/page";
import { loader as pipelinesLoader } from "../../pipelines/list/loader.server";
import { action as pipelinesAction } from "../../pipelines/list/action.server";
import { NewOrganizationPage } from "../../organizations/new/page";
import { loader as newOrganizationLoader } from "../../organizations/new/loader.server";
import { action as newOrganizationAction } from "../../organizations/new/action.server";
import { loader as organizationLoader } from "../../organizations/show/loader.server";
import { loader as homeLoader } from "../loader.server";
import { OrganizationHandlers } from "~/tests/handlers/organization.handlers";
import { PipelineHandlers } from "~/tests/handlers/pipelines.handlers";
import { InputHandle } from "~/tests/handles/Input.handle";
import { ButtonHandle } from "~/tests/handles/Button.handle";
import { organizationFixture } from "~/tests/fixtures/organization.fixtures";

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
});

class OnboardingObject {
  render(props?: RoutesProps, organizationId?: number) {
    const Routes = setupRoutes([
      {
        path: "/",
        Component: () => <Outlet />,
        loader: loaderWithSession(homeLoader, { organizationId }),
      },
      {
        path: "/organizations/new",
        Component: NewOrganizationPage,
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
