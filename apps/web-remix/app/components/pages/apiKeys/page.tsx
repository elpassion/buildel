import { MetaFunction } from "@remix-run/node";
import { AppNavbar, AppNavbarHeading } from "~/components/navbar/AppNavbar";
import React from "react";
import { PageContentWrapper } from "~/components/layout/PageContentWrapper";

export function ApiKeysPage() {
  return (
    <>
      <AppNavbar leftContent={<AppNavbarHeading>API keys</AppNavbarHeading>} />
      <PageContentWrapper>
        <h1>Api keys</h1>
      </PageContentWrapper>
    </>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "API keys",
    },
  ];
};
