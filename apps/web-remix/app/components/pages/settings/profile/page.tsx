import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader";
import React from "react";

export function ProfileSettingsPage() {
  const { user } = useLoaderData<typeof loader>();
  return <>{user.id}</>;
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Profile settings",
    },
  ];
};
