import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  EdgeChange,
  NodeChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow";
import { LinksFunction, V2_MetaFunction } from "@remix-run/node";

import flowStyles from "reactflow/dist/style.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: flowStyles },
];

export function ShowPipelinePage() {
  const { pipeline } = useLoaderData<typeof loader>();

  return (
    <div className="h-screen w-full">
      <ReactFlow
        fitViewOptions={{
          minZoom: 0.5,
          maxZoom: 1,
        }}
        fitView
      >
        <Background variant={BackgroundVariant.Lines} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "Show pipeline",
    },
  ];
};
