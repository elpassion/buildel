import React from "react";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { ActionSidebarHeader } from "~/components/sidebar/ActionSidebar";
import { routes } from "~/utils/routes.utils";
import { KnowledgeBaseSearchForm } from "./KnowledgeBaseSearchForm";
import { KnowledgeBaseSearchList } from "./KnowledgeBaseSearchList";
import type { loader } from "./loader.server";
import type { MetaFunction } from "@remix-run/node";

export function KnowledgeBaseSearch() {
  const navigate = useNavigate();
  const { organizationId, collectionName, chunks, metadata, query } =
    useLoaderData<typeof loader>();

  const handleClose = () => {
    navigate(routes.collectionFiles(organizationId, collectionName));
  };

  return (
    <>
      <ActionSidebarHeader
        heading="Ask a question to your knowledge base"
        subheading="Let's ask your knowledge base some questions so you can see how your chatbot will answer and where it'll take it's information from."
        onClose={handleClose}
      />

      <p className="font-bold text-neutral-100 mb-2">
        Total tokens: {metadata.total_tokens}
      </p>

      <KnowledgeBaseSearchForm defaultValue={query ?? ""} />

      <div className="overflow-y-auto mt-4">
        <KnowledgeBaseSearchList items={chunks} query={query} />
      </div>
    </>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Knowledge Base Search",
    },
  ];
};
