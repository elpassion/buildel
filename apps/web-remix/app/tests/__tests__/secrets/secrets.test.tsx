import React from "react";
import { test, describe, expect } from "vitest";
import {
  loaderWithSession,
  RoutesProps,
  setupRoutes,
} from "~/tests/setup.tests";
import { render, screen } from "~/tests/render";
import { server } from "~/tests/server.mock";
import { SecretListPage } from "~/components/pages/secrets/list/page";
import { loader as secretsLoader } from "~/components/pages/secrets/list/loader.server";
import { action as secretsAction } from "~/components/pages/secrets/list/action.server";
import { NewSecret } from "~/components/pages/secrets/newSecret/page";
import { loader as newSecretLoader } from "~/components/pages/secrets/newSecret/loader.server";
import { action as newSecretAction } from "~/components/pages/secrets/newSecret/action.server";
import { SecretsHandlers } from "~/tests/handlers/secret.handlers";
import { secretFixture } from "~/tests/fixtures/secrets.fixtures";
import { ListHandle } from "~/tests/handles/List.handle";
import { ButtonHandle } from "~/tests/handles/Button.handle";
import { InputHandle } from "~/tests/handles/Input.handle";

const handlers = () => [
  ...new SecretsHandlers([
    secretFixture(),
    secretFixture({ id: "deepgram", name: "deepgram" }),
  ]).handlers,
];

describe("Secrets", () => {
  const setupServer = server(handlers());

  beforeAll(() => setupServer.listen());
  afterEach(() => setupServer.resetHandlers(...handlers()));
  afterAll(() => setupServer.close());

  test("should render correct amount of secrets", async () => {
    const page = new SecretsObject().render({
      initialEntries: ["/2/secrets"],
    });

    const list = await page.getSecretList();
    expect(list.children).toHaveLength(3);
  });

  test("should render empty list message if secrets empty", async () => {
    new SecretsObject().render({
      initialEntries: ["/2/secrets"],
    });

    await screen.findByText(/There is no Secrets yet/i);
  });

  test("should delete secret", async () => {
    const page = new SecretsObject().render({
      initialEntries: ["/2/secrets"],
    });

    const list = await page.getSecretList();
    expect(list.children).toHaveLength(3);

    const button = await ButtonHandle.fromLabelText(/Delete secret: deepgram/i);
    await button.click();

    await page.confirmAction();

    expect(list.children).toHaveLength(2);
  });

  test("should add secret", async () => {
    const page = new SecretsObject().render({
      initialEntries: ["/2/secrets/new"],
    });

    const name = await InputHandle.fromLabelText(/name/i);
    await name.type("NEW");

    const value = await InputHandle.fromLabelText(/value/i);
    await value.type("NEW");

    const submit = await ButtonHandle.fromRole("Save the Secret");
    await submit.click();

    const list = await page.getSecretList();
    expect(list.children).toHaveLength(4);
  });

  test("should show validation errors", async () => {
    new SecretsObject().render({
      initialEntries: ["/2/secrets/new"],
    });

    const submit = await ButtonHandle.fromRole("Save the Secret");
    await submit.click();

    expect(
      await screen.findAllByText(/String must contain at least 2 /i)
    ).toHaveLength(2);
  });

  test("should change secret value", async () => {
    new SecretsObject().render({
      initialEntries: ["/2/secrets"],
    });

    const editButton = await ButtonHandle.fromLabelText(
      /Edit secret: deepgram/i
    );
    await editButton.click();

    const updateSubmit = await ButtonHandle.fromRole("Update Secret");
    await updateSubmit.click();

    await screen.findByText(/String must contain at least 2 character/i);

    const newValue = await InputHandle.fromLabelText(/value/i);
    await newValue.type("NEW_VALUE");

    await updateSubmit.click();

    await screen.findByText(/01\/01\/2024/i);
  });
});

class SecretsObject {
  render(props?: RoutesProps) {
    const Routes = setupRoutes([
      {
        path: "/:organizationId/secrets",
        Component: SecretListPage,
        loader: loaderWithSession(secretsLoader),
        action: loaderWithSession(secretsAction),
      },
      {
        path: "/:organizationId/secrets/new",
        Component: NewSecret,
        loader: loaderWithSession(newSecretLoader),
        action: loaderWithSession(newSecretAction),
      },
    ]);

    render(<Routes {...props} />);

    return this;
  }

  async confirmAction() {
    const confirmButton = await ButtonHandle.fromRole("Delete Key");

    await confirmButton.click();

    return this;
  }

  async getSecretList() {
    return ListHandle.fromLabelText(/Secret list/i);
  }
}
