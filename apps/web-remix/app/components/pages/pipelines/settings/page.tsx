import React, { useCallback } from "react";
import { MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { EditPipelineNameForm } from "./EditPipelineNameForm";
import { IPipeline } from "~/components/pages/pipelines/pipeline.types";
import { routes } from "~/utils/routes.utils";
import { loader } from "./loader";

export function SettingsPage() {
  const { pipeline } = useLoaderData<typeof loader>();
  const updateFetcher = useFetcher<IPipeline>();

  const handleUpdatePipeline = useCallback(
    (pipeline: IPipeline) => {
      updateFetcher.submit(pipeline, {
        method: "PUT",
        encType: "application/json",
        action:
          routes.pipeline(pipeline.organization_id, pipeline.id) + "?index",
      });
    },
    [updateFetcher]
  );

  return (
    <div className="mt-10">
      <div className="bg-neutral-800 rounded-lg p-4 flex justify-between items-center gap-3 max-w-[400px]">
        <h2 className="text-lg text-white">{pipeline.name}</h2>

        <EditPipelineNameForm
          defaultValues={pipeline}
          onSubmit={handleUpdatePipeline}
        />
      </div>
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Settings",
    },
  ];
};
