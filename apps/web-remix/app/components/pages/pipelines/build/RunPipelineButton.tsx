import React from "react";
import { Button } from "@elpassion/taco";
import { useRunPipeline } from "../RunPipelineProvider";
import { PlayFilled } from "~/icons/PlayFilled";
import { errorToast } from "~/components/toasts/errorToast";

export const RunPipelineButton: React.FC = () => {
  const { status, stopRun, startRun, isValid } = useRunPipeline();

  const handleRun = () => {
    if (status === "idle") {
      if (!isValid) {
        errorToast({
          title: "Invalid workflow",
          description:
            "We couldn’t run the workflow due to errors in some of your blocks. Please check the highlighted blocks.",
        });
      } else {
        startRun();
      }
    } else {
      stopRun();
    }
  };

  const isRunning = status !== "idle";

  return (
    <div className="flex items-center gap-2 pointer-events-auto">
      <Button
        aria-label={isRunning ? "Stop workflow" : "Start workflow"}
        onClick={handleRun}
        size="sm"
        rightIcon={status === "idle" && <PlayFilled />}
      >
        {isRunning ? "Stop" : "Start"}
      </Button>
    </div>
  );
};
