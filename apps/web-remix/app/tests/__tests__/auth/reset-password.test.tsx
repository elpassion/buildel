import React from "react";
import { test, describe } from "vitest";
import { RoutesProps, setupRoutes } from "~/tests/setup.tests";
import { render, screen } from "~/tests/render";
import { server } from "~/tests/server.mock";
import { ResetPasswordPage } from "~/components/pages/auth/reset-password/page";
import { action as resetPasswordAction } from "~/components/pages/auth/reset-password/action.server";
import { LoginPage } from "~/components/pages/auth/login/page";
import { loader as loginLoader } from "~/components/pages/auth/login/loader.server";
import { SetPasswordPage } from "~/components/pages/auth/set-password/page";
import { action as setPasswordAction } from "~/components/pages/auth/set-password/action.server";
import { loader as setPasswordLoader } from "~/components/pages/auth/set-password/loader.server";
import { handlers, notMatchHandler } from "./reset-password.handlers";
import { InputHandle } from "~/tests/handles/Input.handle";
import { ButtonHandle } from "~/tests/handles/Button.handle";
import ResetPasswordSent from "~/routes/_auth.reset-password.sent";
import { handlers as registerHandlers } from "./register.handlers";

describe("Reset password flow", () => {
  const setupServer = server([...handlers, ...registerHandlers]);

  beforeAll(() => setupServer.listen());
  afterEach(() => setupServer.resetHandlers());
  afterAll(() => setupServer.close());

  test("should show reset-password validation errors", async () => {
    new ResetPasswordObject().render({
      initialEntries: ["/reset-password"],
    });

    const email = await InputHandle.fromLabelText(/email/i);
    const button = await ButtonHandle.fromRole("Send instructions");

    await email.type("123");
    await button.click();

    await screen.findByText(/Invalid email/i);
  });

  test("should show Sent Instructions page", async () => {
    new ResetPasswordObject().render({
      initialEntries: ["/reset-password"],
    });

    const email = await InputHandle.fromLabelText(/email/i);
    const button = await ButtonHandle.fromRole("Send instructions");

    await email.type("test@gmail.com");
    await button.click();

    await screen.findByText(/Reset password instructions successfully sent!/i);
  });

  test("should redirect to Login if token not exist", async () => {
    new ResetPasswordObject().render({
      initialEntries: ["/set-password"],
    });

    await screen.findByText(/Sign in to account/i);
  });

  test("should show Set-password validation errors", async () => {
    const page = new ResetPasswordObject().render({
      initialEntries: ["/set-password?token=123"],
    });
    const button = await ButtonHandle.fromRole("Reset password");

    await page.setNewPassword("123");
    await page.setNewConfirmPassword("123");

    await button.click();

    await screen.findAllByText(/String must contain at least 12 characte/i);
  });

  test("should show not match error", async () => {
    setupServer.use(notMatchHandler);
    const page = new ResetPasswordObject().render({
      initialEntries: ["/set-password?token=123"],
    });
    const button = await ButtonHandle.fromRole("Reset password");

    await page.setNewPassword("12345678912345622");
    await page.setNewConfirmPassword("123456789123456");

    await button.click();

    await screen.findByText(/does not match/i);
  });

  test("should reset password", async () => {
    const page = new ResetPasswordObject().render({
      initialEntries: ["/set-password?token=123"],
    });
    const button = await ButtonHandle.fromRole("Reset password");

    await page.setNewPassword("123456789123456");
    await page.setNewConfirmPassword("123456789123456");

    await button.click();

    await screen.findByText(/Sign in to account/i);
  });
});

class ResetPasswordObject {
  render(props?: RoutesProps) {
    const Routes = setupRoutes([
      {
        path: "/login",
        Component: LoginPage,
        loader: loginLoader,
      },
      {
        path: "/reset-password",
        Component: ResetPasswordPage,
        action: resetPasswordAction,
      },
      {
        path: "/reset-password/sent",
        Component: ResetPasswordSent,
      },
      {
        path: "/set-password",
        Component: SetPasswordPage,
        action: setPasswordAction,
        loader: setPasswordLoader,
      },
    ]);

    render(<Routes {...props} />);

    return this;
  }

  async setNewPassword(value: string) {
    const password = await InputHandle.fromTestId("new-password");
    await password.type(value);
  }

  async setNewConfirmPassword(value: string) {
    const password = await InputHandle.fromTestId("new-password-confirmation");
    await password.type(value);
  }
}
