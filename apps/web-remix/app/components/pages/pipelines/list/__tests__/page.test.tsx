import React from "react";
import { PipelinesPage } from "../page";
import { render, screen, waitFor } from "~/test-utils/render";
import { createRemixStub } from "@remix-run/testing";
import { test, describe } from "vitest";

const RemixStub = createRemixStub([
  {
    path: "/",
    Component: PipelinesPage,
    action() {
      return {};
    },
    loader() {
      return { pipelines: { data: [] } as any, organizationId: "1" };
    },
  },
]);

describe(PipelinesPage.name, () => {
  test("should render page", async () => {
    render(<RemixStub />);

    await waitFor(() => screen.findByRole("list"));
  });
});
