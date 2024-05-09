import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader.server";
import { usePipelineRunLogs } from "../usePipelineRunLogs";
import { useEffect } from "react";

export function PipelineRunLogs() {
  const { pipeline, pipelineRun } = useLoaderData<typeof loader>();

  const { status, listenToLogs, stopListening } = usePipelineRunLogs(
    pipeline.organization_id,
    pipeline.id,
    pipelineRun.id,
    payload => console.log(payload))

  console.log(status)
  useEffect(() => {
    if (status === "open") {
      listenToLogs({})
    }
    // return () => {
    //   console.log('stop')
    //   stopListening()
    // }
  }, [status])

  return (
    <p>LOGI LOGI LOGI</p>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: `Run logs`,
    },
  ];
};
