import React from "react";
import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { PageContentWrapper } from "~/components/layout/PageContentWrapper";
import { AppNavbar } from "~/components/navbar/AppNavbar";
import { loader } from "./loader";
import { Button } from "@elpassion/taco";

export function KnowledgeBasePage() {
  const { organizationId } = useLoaderData<typeof loader>();

  return (
    <>
      <AppNavbar
        leftContent={
          <h1 className="text-2xl font-medium text-white">Knowledge base</h1>
        }
      />

      <PageContentWrapper>
        <div className="mt-5 mb-6 flex gap-2 justify-between items-center">
          <span>Search</span>

          <Button size="sm" tabIndex={0}>
            New collection
          </Button>
        </div>
        <h2>Collection list</h2>
      </PageContentWrapper>
    </>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Knowledge base",
    },
  ];
};
