import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader";
import React from "react";
import { PageContentWrapper } from "~/components/layout/PageContentWrapper";

export function ProfileSettingsPage() {
  const { user } = useLoaderData<typeof loader>();
  return <PageContentWrapper>{user.id}</PageContentWrapper>;
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Profile settings",
    },
  ];
};
