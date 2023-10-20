import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader";
import { AppNavbar, AppNavbarHeading } from "~/components/navbar/AppNavbar";
import React from "react";
import { PageContentWrapper } from "~/components/layout/PageContentWrapper";

export function SettingsPage() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <>
      <AppNavbar leftContent={<AppNavbarHeading>Settings</AppNavbarHeading>} />
      <PageContentWrapper>
        <p>user: {user.id}</p>
      </PageContentWrapper>
    </>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Settings",
    },
  ];
};
