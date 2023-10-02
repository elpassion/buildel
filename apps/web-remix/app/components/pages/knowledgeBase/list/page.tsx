import { MetaFunction } from "@remix-run/node";
import { AppNavbar } from "~/components/navbar/AppNavbar";
import React from "react";
import { KnowledgeBaseList } from "./KnowledgeBaseList";
import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader";

export function KnowledgeBasePage() {
  const { fileList } = useLoaderData<typeof loader>();
  return (
    <div>
      <AppNavbar
        leftContent={
          <h1 className="text-2xl font-medium text-white">Knowledge base</h1>
        }
      />
      <KnowledgeBaseList items={fileList} />
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Knowledge base",
    },
  ];
};
