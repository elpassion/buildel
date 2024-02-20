import React from "react";
import { test, describe } from "vitest";
import { RoutesProps, setupRoutes } from "~/tests/setup.tests";
import { ButtonHandle } from "~/tests/handles/Button.handle";
import { InputHandle } from "~/tests/handles/Input.handle";
import { render, screen, waitFor, act } from "~/tests/render";
import { server } from "~/tests/server.mock";
import { LoginPage } from "../page";
import { loader } from "../loader.server";
import { action } from "../action.server";
import { errorHandlers, handlers } from "./login.handlers";

describe(LoginPage.name, () => {
  const setupServer = server(handlers);

  beforeAll(() => setupServer.listen());
  afterEach(() => setupServer.resetHandlers());
  afterAll(() => setupServer.close());

  test("should sign in user correctly", async () => {
    const page = new LoginObject().render({ initialEntries: ["/login"] });
    await page.fillInputs();

    await page.submit();

    await waitFor(() => screen.findByText(/Homepage/i));
  });

  test("should display error if fields not filled in", async () => {
    const page = new LoginObject().render({ initialEntries: ["/login"] });

    await page.submit();

    await waitFor(() => screen.findByText(/Invalid email/i));
    await waitFor(() => screen.findByText(/String must contain at least 2/i));
  });

  test("should display error from BE", async () => {
    setupServer.use(...errorHandlers);

    const page = new LoginObject().render({ initialEntries: ["/login"] });
    await page.fillInputs();

    await page.submit();

    await waitFor(() => screen.findByText(/Invalid username or password/i));
  });

  test("should redirect user at correct url after signing in", async () => {
    const page = new LoginObject().render({
      initialEntries: ["/login?redirectTo=/organization/2"],
    });
    await page.fillInputs();

    await page.submit();

    await waitFor(() => screen.findByText(/Organization/i));
  });
});

class LoginObject {
  render(props?: RoutesProps) {
    const Routes = setupRoutes([
      {
        path: "/login",
        Component: LoginPage,
        action,
        loader,
      },
      {
        path: "/",
        Component: () => <p>Homepage</p>,
      },
      {
        path: "/organization/:organizationId",
        Component: () => <p>Organization</p>,
      },
    ]);

    render(<Routes {...props} />);

    return this;
  }

  async submit() {
    const { button } = await this.getElements();

    await act(() => button.click());

    return this;
  }

  async fillInputs() {
    const { emailInput, passwordInput } = await this.getElements();

    await emailInput.type("test@gmail.com");
    await passwordInput.type("password");

    return this;
  }

  async getElements() {
    const button = await ButtonHandle.fromRole();
    const emailInput = await InputHandle.fromLabelText(/email/i);
    const passwordInput = await InputHandle.fromLabelText(/password/i);

    return { button, emailInput, passwordInput };
  }
}
