import React from "react";
import classNames from "classnames";
import { MetaFunction } from "@remix-run/node";
import { Outlet, useLoaderData, useMatch, useNavigate } from "@remix-run/react";
import { ActionSidebar } from "~/components/sidebar/ActionSidebar";
import { routes } from "~/utils/routes.utils";
import { loader } from "./loader.server";

export function KnowledgeBaseCollectionInterface() {
  const { organizationId, collectionName } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const matchSearch = useMatch(
    routes.collectionInterfaceSearch(organizationId, collectionName)
  );
  const isSidebarOpen = !!matchSearch;

  const handleClose = () => {
    navigate(routes.collectionInterface(organizationId, collectionName));
  };

  return (
    <>
      <p>Interface</p>

      <ActionSidebar
        className={classNames("!bg-neutral-950 md:w-[550px]")}
        isOpen={isSidebarOpen}
        onClose={handleClose}
        overlay
      >
        <Outlet />
      </ActionSidebar>
    </>
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${data?.collectionName} Interface`,
    },
  ];
};
