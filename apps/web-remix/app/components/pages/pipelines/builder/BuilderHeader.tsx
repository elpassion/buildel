import React from "react";
import { Button } from "@elpassion/taco";
import { RunPipelineButton } from "./RunPipelineButton";

interface BuilderHeaderProps {
  updateStatus: "submitting" | "idle" | "loading";
}

export const BuilderHeader: React.FC<BuilderHeaderProps> = ({
  updateStatus,
}) => {
  return (
    <header className="absolute top-8 left-4 right-4 z-10 flex justify-between">
      <RunPipelineButton />
      <Button variant="filled" size="sm" disabled>
        {updateStatus === "submitting" ? "Saving" : "Up-to-date"}
      </Button>
    </header>
  );
};
