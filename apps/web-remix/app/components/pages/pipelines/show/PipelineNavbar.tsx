import React from "react";
import { Breadcrumbs, Navbar } from "@elpassion/taco";
import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader";

interface PipelineNavbarProps {
  name: string;
}

export const PipelineNavbar = ({ name }: PipelineNavbarProps) => {
  const { organizationId } = useLoaderData<typeof loader>();
  return (
    <Navbar
      leftContent={
        <div className="flex items-center justify-center gap-2 px-1 py-1">
          <Breadcrumbs
            breadcrumbs={[
              {
                label: "Workflows",
                href: `/${organizationId}/pipelines`,
              },
              {
                label: name,
                href: "#",
              },
            ]}
          />
        </div>
      }
    />
  );
};
