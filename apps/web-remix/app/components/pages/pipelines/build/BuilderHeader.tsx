import type { PropsWithChildren} from "react";
import React, { useCallback, useEffect } from "react";
import { useDebounce, useIsFirstRender } from "usehooks-ts";
import { Icon } from "@elpassion/taco";
import type { IPipelineConfig } from "~/components/pages/pipelines/pipeline.types";
import { useRunPipeline } from "../RunPipelineProvider";
import { Metadata } from "./Metadata";
import { RunPipelineButton } from "./RunPipelineButton";

export const BuilderHeader: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <header className="absolute top-8 left-4 right-4 z-10 flex justify-between pointer-events-none">
      <div className="flex gap-2 items-center pointer-events-auto">
        <RunPipelineButton />

        <Metadata />
      </div>

      <div className="flex gap-2 items-center pointer-events-auto">
        {children}
      </div>
    </header>
  );
};

interface SaveChangesButtonProps {
  onSave: (config: IPipelineConfig) => void;
  config: IPipelineConfig;
  isSaving?: boolean;
}

export function SaveChangesButton({
  isSaving,
  onSave,
  config,
}: SaveChangesButtonProps) {
  const isFirstRender = useIsFirstRender();
  const { status: runStatus } = useRunPipeline();
  const debounced = useDebounce(JSON.stringify(config), 300);

  const handleSave = useCallback(() => {
    try {
      onSave(JSON.parse(debounced));
    } catch (e) {
      console.error(e);
    }
  }, [debounced]);

  useEffect(() => {
    if (isFirstRender || runStatus !== "idle") return;
    handleSave();
  }, [debounced, isFirstRender, runStatus]);

  return (
    <div className="flex items-center gap-2">
      {isSaving ? (
        <SavingStatusWrapper>
          <span>Saving changes</span>
          <Icon iconName="loader" className="animate-spin" />
        </SavingStatusWrapper>
      ) : (
        <SavingStatusWrapper>
          <span>All changes saved</span>
          <Icon iconName="check-circle" />
        </SavingStatusWrapper>
      )}
    </div>
  );
}

function SavingStatusWrapper({ children }: PropsWithChildren) {
  return (
    <div className="bg-neutral-950 text-neutral-100 px-2 py-1 rounded-lg text-sm flex gap-1 items-center">
      {children}
    </div>
  );
}
