import React from "react";
import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { loader } from "./loader";

export function WebsiteChatbotPage() {
  const { organizationId, pipelineId } = useLoaderData<typeof loader>();
  return <div>Dupa</div>;
}
export const meta: MetaFunction = () => {
  return [
    {
      title: "Website Chatbot",
    },
  ];
};
