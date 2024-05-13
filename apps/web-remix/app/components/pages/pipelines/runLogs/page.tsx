import { MetaFunction } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { loader } from "./loader.server";
import { usePipelineRunLogs } from "../usePipelineRunLogs";
import { useEffect, useState } from "react";
import { SelectInput } from "~/components/form/inputs/select.input";
import { ClientOnly } from "remix-utils/client-only";
import { buildUrlWithParams } from "~/utils/url";
import { b } from "vitest/dist/suite-UrZdHRff.js";
import { routes } from "~/utils/routes.utils";

export function PipelineRunLogs() {
  const navigate = useNavigate();
  const { pipeline, pipelineRun, pipelineRunLogs, blockName } = useLoaderData<typeof loader>();
  const [liveLogs, setLiveLogs] = useState<any[]>([])

  const { status, listenToLogs, stopListening } = usePipelineRunLogs(
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
      listenToLogs({
        block_name: blockName
      })
    }
  }, [status])


  return (
    <div>

      <ClientOnly
        fallback={
          <div className="w-full h-[44px] rounded-lg border-[1.5px] border-neutral-200 bg-neutral-800" />
        }
      >
        {() => <SelectInput
          id="block_name"
          isClearable
          options={pipelineRun.config.blocks.map(block => ({
            id: block.name,
            value: block.name,
            label: block.name
          }))}
          label="Filter by block"
          value={blockName ? { id: blockName, value: blockName, label: blockName } : undefined}
          onSelect={(selected: any) => {
            const urlWithParams = buildUrlWithParams(routes.pipelineRunLogs(pipeline.organization_id, pipeline.id, pipelineRun.id), {
              block_name: selected?.value ?? undefined
            });

            stopListening().then(() => listenToLogs({
              block_name: selected?.value ?? undefined
            }))
            setLiveLogs([])

            navigate(urlWithParams);
          }}
        />}
      </ClientOnly>

      <div className="mt-2 bg-gray-800 text-gray-400 font-mono p-4 h-96 overflow-y-auto rounded-lg ">
        {pipelineRunLogs.map((log) => (
          <Log key={log.id} log={log} />
        )).reverse()}
        {liveLogs.map(log => (
          <Log key={log.id} log={log} />
        ))}

      </div>
    </div>

  );
}

const Log = ({ log }: { log: any }) => {
  return (
    <p className="mb-2">
      <span className="text-cyan-400 mr-2">{log?.created_at}</span>
      <span className="text-purple-500 mr-2">{log?.block_name}</span>
      <span className="text-gray-300 mr-2">{log?.message}</span>
      <span className="text-green-300">{log?.message_types?.join(" -> ")}</span>
    </p>
  )
}

export const meta: MetaFunction = () => {
  return [
    {
      title: `Run logs`,
    },
  ];
};
