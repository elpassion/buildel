import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader";
import React from "react";
import { PageContentWrapper } from "~/components/layout/PageContentWrapper";

export function OrganizationSettingsPage() {
  const { user } = useLoaderData<typeof loader>();
  return <PageContentWrapper>Organization</PageContentWrapper>;
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Organization settings",
    },
  ];
};
