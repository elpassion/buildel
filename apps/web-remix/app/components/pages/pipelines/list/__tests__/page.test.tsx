import React from "react";
import { PipelinesPage } from "../page";
import { render, screen, waitFor } from "~/test-utils/render";
import { createRemixStub } from "@remix-run/testing";
import { json } from "@remix-run/node";
import { loader } from "../loader";
import { PipelinesList } from "../PipelinesList";

const RemixStub = createRemixStub([
  {
    path: "/",
    Component: () => <PipelinesList pipelines={[]} />,
    loader(): Awaited<ReturnType<typeof loader>> {
      return json({ pipelines: [] as any, organizationId: "1" });
    },
  },
]);

describe(PipelinesPage.name, () => {
  it("should render page", async () => {
    render(<RemixStub />);

    await waitFor(() => screen.findByRole("list"));
  });
});
