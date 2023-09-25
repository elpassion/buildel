import React from "react";
import { Button, Icon } from "@elpassion/taco";
import { useRunPipeline } from "./RunPipelineProvider";
import { PlayFilled } from "~/icons/PlayFilled";
import { errorToast } from "~/components/toasts/errorToast";

export const RunPipelineButton: React.FC = () => {
  const { status, stopRun, startRun, isValid } = useRunPipeline();

  const handleRun = () => {
    if (!isValid) {
      errorToast({
        title: "Invalid workflow",
        description:
          "We couldn’t run the workflow due to errors in some of your blocks. Please check the highlighted blocks.",
      });
    } else if (status === "idle") {
      startRun();
    } else {
      stopRun();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleRun}
        size="sm"
        rightIcon={
          status === "idle" ? <PlayFilled /> : <Icon iconName="stop-circle" />
        }
      >
        {status === "idle" ? "Run" : "Stop"}
      </Button>
    </div>
  );
};
