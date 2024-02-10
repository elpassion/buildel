import React from "react";
import { LoginPage } from "../page";
import { render, screen, waitFor } from "~/test-utils/render";
import { createRemixStub } from "@remix-run/testing";
import { test, describe } from "vitest";
import { loader } from "../loader";
import { action } from "../action";
import { act, fireEvent } from "@testing-library/react";
import { server } from "~/tests/server.mock";
import { handlers } from "~/components/pages/auth/login/__tests__/login.handles";

const RemixStub = createRemixStub([
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
]);
describe(LoginPage.name, () => {
  const setupServer = server(handlers);
  beforeAll(() => setupServer.listen());
  afterEach(() => setupServer.resetHandlers());
  afterAll(() => setupServer.close());

  test("should sign in user correctly", async () => {
    render(<RemixStub initialEntries={["/login"]} />);

    const email = await waitFor(() => screen.findByLabelText(/email/i));
    fireEvent.change(email, { target: { value: "dvdk98@gmail.com" } });

    const password = await waitFor(() => screen.findByLabelText(/password/i));
    fireEvent.change(password, { target: { value: "dvdk98@gmail.com" } });

    const btn = await waitFor(() => screen.findByRole("button"));

    await act(() => fireEvent.submit(btn));

    await waitFor(() => screen.findByText(/Homepage/i));
  });

  test("should redirect user at correct url after signing in", async () => {
    const CustomStub = createRemixStub([
      {
        path: "/login",
        Component: LoginPage,
        action,
        loader,
      },
      {
        path: "/organization/:organizationId",
        Component: () => <p>Organization</p>,
      },
    ]);
    render(
      <CustomStub initialEntries={["/login?redirectTo=/organization/2"]} />
    );

    const email = await waitFor(() => screen.findByLabelText(/email/i));
    fireEvent.change(email, { target: { value: "dvdk98@gmail.com" } });

    const password = await waitFor(() => screen.findByLabelText(/password/i));
    fireEvent.change(password, { target: { value: "dvdk98@gmail.com" } });

    const btn = await waitFor(() => screen.findByRole("button"));

    await act(() => fireEvent.submit(btn));

    await waitFor(() => screen.findByText(/Organization/i));
  });

  test("should display error if fields not filled in", async () => {
    render(<RemixStub initialEntries={["/login"]} />);

    await waitFor(() => screen.findByLabelText(/email/i));

    await waitFor(() => screen.findByLabelText(/password/i));

    const btn = await waitFor(() => screen.findByRole("button"));

    await act(() => fireEvent.submit(btn));

    await waitFor(() => screen.findByText(/Invalid email/i));
    await waitFor(() => screen.findByText(/String must contain at least 2/i));
  });
});
