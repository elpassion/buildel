import React from "react";
import { MetaFunction } from "@remix-run/node";
import { ApiKey } from "./ApiKey";
import { AboutOrganization } from "./AboutOrganization";
import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader";

export function OrganizationSettingsPage() {
  const { apiKey, organization } = useLoaderData<typeof loader>();
  return (
    <div className="flex flex-col gap-9">
      <AboutOrganization organization={organization.data} />
      <ApiKey apiKey={apiKey} />
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Organization settings",
    },
  ];
};
