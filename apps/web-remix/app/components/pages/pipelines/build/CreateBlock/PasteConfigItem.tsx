import React from "react";
import { useRunPipeline } from "~/components/pages/pipelines/RunPipelineProvider";
import { usePasteConfig } from "./PasteBlockConfigProvider";

export const PasteConfigItem: React.FC = () => {
  const { show } = usePasteConfig();
  const { status: runStatus } = useRunPipeline();
  return (
    <button
      key="paste-config"
      onClick={show}
      disabled={runStatus !== "idle"}
      title="Paste configuration"
      className="w-[70px] px-1 overflow-hidden line-clamp-1 text-xs text-white bg-neutral-900 h-[40px] border-none! hover:bg-neutral-950"
    >
      <div className="truncate text-center">Paste configuration</div>
    </button>
  );
};
