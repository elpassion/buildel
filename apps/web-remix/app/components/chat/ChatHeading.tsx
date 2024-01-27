import React, { PropsWithChildren, useMemo } from "react";
import { Icon } from "@elpassion/taco";
import classNames from "classnames";
import { BuildelRunStatus } from "@buildel/buildel";

export const ChatHeading: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <h3 className="flex gap-2 items-center text-white">
      <Icon size="xs" iconName="two-layers" />
      <div className="text-white">Ask EL</div>

      {children}
    </h3>
  );
};

interface ChatStatusProps {
  connectionStatus: BuildelRunStatus;
}
export function ChatStatus({ connectionStatus }: ChatStatusProps) {
  const mappedStatusToText = useMemo(() => {
    switch (connectionStatus) {
      case "starting":
        return "Starting";
      case "running":
        return "Running";
      default:
        return "Not running";
    }
  }, [connectionStatus]);

  return (
    <div
      title={mappedStatusToText}
      className="py-0.5 px-1 bg-neutral-800 rounded flex gap-1 items-center"
    >
      <div
        className={classNames("w-[6px] h-[6px] rounded-full", {
          "bg-red-500": connectionStatus === "idle",
          "bg-green-500": connectionStatus === "running",
          "bg-orange-500": connectionStatus === "starting",
        })}
      />

      <span className="text-xs text-neutral-400">{mappedStatusToText}</span>
    </div>
  );
}
