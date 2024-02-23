import React from "react";
import { AppNavbar } from "~/components/navbar/AppNavbar";
import { useLoaderData } from "@remix-run/react";
import { loader } from "~/components/pages/pipelines/list/loader.server";

export const PipelinesNavbar = () => {
  return (
    <AppNavbar leftContent={<LeftContent />}>
      <Content />
    </AppNavbar>
  );
};

function LeftContent() {
  const { organizationId } = useLoaderData<typeof loader>();
  return (
    <div className="flex items-center justify-center gap-2">
      <h2
        className="text-2xl font-bold text-white"
        data-testid={`organization-${organizationId}`}
      >
        Workflows
      </h2>
    </div>
  );
}

function Content() {
  return <div className="flex items-center justify-end gap-4"></div>;
}
