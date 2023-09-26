import { MetaFunction } from "@remix-run/node";

export function KnowledgeBasePage() {
  return <h1>Knowledge base</h1>;
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Knowledge base",
    },
  ];
};
