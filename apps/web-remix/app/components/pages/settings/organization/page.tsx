import { MetaFunction } from "@remix-run/node";
import React from "react";
import { ApiKey } from "./ApiKey";

export function OrganizationSettingsPage() {
  return (
    <>
      <ApiKey />
    </>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Organization settings",
    },
  ];
};
