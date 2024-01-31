import React, { PropsWithChildren } from "react";
import { Button } from "@elpassion/taco";
import { RunPipelineButton } from "./RunPipelineButton";
import { useRunPipeline } from "../RunPipelineProvider";

interface BuilderHeaderProps {
  isUpToDate: boolean;
}

export const BuilderHeader: React.FC<PropsWithChildren<BuilderHeaderProps>> = ({
  isUpToDate,
  children,
}) => {
  return (
    <header className="absolute top-8 left-4 right-4 z-10 flex justify-between pointer-events-none">
      <RunPipelineButton isUpToDate={isUpToDate} />

      <div className="flex gap-2 items-center pointer-events-auto">
        {children}
      </div>
    </header>
  );
};

interface SaveChangesButtonProps {
  isUpToDate: boolean;
  onSave?: () => void;
  isSaving?: boolean;
}

export function SaveChangesButton({
  isSaving,
  isUpToDate,
  onSave,
}: SaveChangesButtonProps) {
  const { status: runStatus } = useRunPipeline();
  return (
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
        isLoading={isSaving}
      >
        Save changes
      </Button>
    </div>
  );
}
