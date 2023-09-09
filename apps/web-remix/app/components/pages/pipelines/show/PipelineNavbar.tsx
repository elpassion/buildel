import React from "react";
import { Breadcrumbs, Navbar } from "@elpassion/taco";

interface PipelineNavbarProps {
  name: string;
}

export const PipelineNavbar = ({ name }: PipelineNavbarProps) => {
  return (
    <Navbar
      leftContent={
        <div className="flex items-center justify-center gap-2 px-1 py-1">
          <Breadcrumbs
            breadcrumbs={[
              {
                label: "Workflows",
                // TODO (hub33k): get proper org id
                href: "/",
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
