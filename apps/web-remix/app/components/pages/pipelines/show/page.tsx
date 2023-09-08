import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader";

export function ShowPipelinePage() {
  const { pipeline } = useLoaderData<typeof loader>();

  return <div>{pipeline.name}</div>;
}
