import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader.server";
import { usePipelineRunLogs } from "../usePipelineRunLogs";
import { useEffect, useState } from "react";

export function PipelineRunLogs() {
  const { pipeline, pipelineRun, pipelineRunLogs } = useLoaderData<typeof loader>();
  const [liveLogs, setLiveLogs] = useState<any[]>([])

  const { status, listenToLogs } = usePipelineRunLogs(
    pipeline.organization_id,
    pipeline.id,
    pipelineRun.id,
    () => { },
    payload => {
      setLiveLogs((prev) => [...prev, payload.data])
    },
    error => console.error(error),
  )

  useEffect(() => {
    if (status === "open") {
      listenToLogs({})
    }
  }, [status])


  return (
    <div className="bg-gray-800 text-gray-400 font-mono p-4 h-96 overflow-y-auto">
      {pipelineRunLogs.map((log) => (
        <div key={log.id} className="mb-2">
          <span className="text-cyan-400 mr-2">{log?.created_at}</span>
          <span className="text-purple-500 mr-2">{log?.block_name}</span>
          <span className="text-gray-300 mr-2">{log?.message}</span>
          <span className="text-green-300">{log?.message_types?.join(" -> ")}</span>
        </div>
      ))}
      {liveLogs.map(log => (
        <div key={log.id} className="mb-2">
          <span className="text-cyan-400 mr-2">{log?.created_at}</span>
          <span className="text-purple-500 mr-2">{log?.block_name}</span>
          <span className="text-gray-300 mr-2">{log?.message}</span>
          <span className="text-green-300">{log?.message_types?.join(" -> ")}</span>
        </div>
      ))}

    </div>

  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: `Run logs`,
    },
  ];
};
