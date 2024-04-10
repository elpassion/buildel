import React from "react";
import { test, describe } from "vitest";
import { RoutesProps, setupRoutes } from "~/tests/setup.tests";
import { ButtonHandle } from "~/tests/handles/Button.handle";
import { InputHandle } from "~/tests/handles/Input.handle";
import { render, screen, waitFor, act } from "~/tests/render";
import { server } from "~/tests/server.mock";
import { LoginPage } from "~/components/pages/auth/login/page";
import { loader } from "~/components/pages/auth/login/loader.server";
import { action } from "~/components/pages/auth/login/action.server";
import { errorHandlers, handlers } from "./login.handlers";
import { handlers as registerHandlers } from "./register.handlers";

describe(LoginPage.name, () => {
  const setupServer = server([...handlers, ...registerHandlers]);

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
  });

  test("should display validation errors", async () => {
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

    await button.click();

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
