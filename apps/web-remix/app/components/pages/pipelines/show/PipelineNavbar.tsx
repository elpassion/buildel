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
      wrapperClassName="md:px-2 md:py-2"
      leftContent={<h1 className="text-2xl font-medium text-white">{name}</h1>}
    />
  );
};
// <Breadcrumbs
//   breadcrumbs={[
//     {
//       label: "Workflows",
//       href: `/${organizationId}/pipelines`,
//     },
//     {
//       label: name,
//       href: "#",
//     },
//   ]}
// />
