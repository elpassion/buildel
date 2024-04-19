import React from "react";
import { MetaFunction } from "@remix-run/node";
import { ActionSidebarHeader } from "~/components/sidebar/ActionSidebar";
import { routes } from "~/utils/routes.utils";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { loader } from "~/components/pages/knowledgeBase/newCollectionFiles/loader.server";

export function KnowledgeBaseSearch() {
  const navigate = useNavigate();
  const { organizationId, collectionName } = useLoaderData<typeof loader>();

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
