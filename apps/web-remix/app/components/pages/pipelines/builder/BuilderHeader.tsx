import React from "react";
import { Button } from "@elpassion/taco";
import { RunPipelineButton } from "./RunPipelineButton";
import { useRunPipeline } from "~/components/pages/pipelines/builder/RunPipelineProvider";

interface BuilderHeaderProps {
  isUpToDate: boolean;
  onSave?: () => void;
}

export const BuilderHeader: React.FC<BuilderHeaderProps> = ({
  isUpToDate,
  onSave,
}) => {
  const { status: runStatus } = useRunPipeline();

  return (
    <header className="absolute top-8 left-4 right-4 z-10 flex justify-between">
      <RunPipelineButton isUpToDate={isUpToDate} />
      <div className="flex items-center gap-2">
        {isUpToDate ? null : (
          <div className="py-1 px-2 bg-neutral-800 text-neutral-100 rounded text-xs">
            There are unsaved changes
          </div>
        )}

        <Button
          disabled={runStatus !== "idle" || isUpToDate}
          onClick={onSave}
          variant="filled"
          size="sm"
        >
          Save changes
        </Button>
      </div>
    </header>
  );
};
