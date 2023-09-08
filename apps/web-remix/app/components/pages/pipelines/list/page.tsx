import { V2_MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader";

export function PipelinesPage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      {data.pipelines.data.map((pipeline) => (
        <div key={pipeline.id}>{pipeline.name}</div>
      ))}
    </div>
  );
}

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "Pipelines",
    },
  ];
};
