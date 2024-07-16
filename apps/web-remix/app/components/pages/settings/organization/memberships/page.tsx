import React from "react";
import { useLoaderData } from "@remix-run/react";
import { MembershipList } from "./MembershipList";
import type { loader } from "./loader.server";

export function MembershipsPage() {
  const { memberships } = useLoaderData<typeof loader>();

  return <MembershipList memberships={memberships} />;
}
