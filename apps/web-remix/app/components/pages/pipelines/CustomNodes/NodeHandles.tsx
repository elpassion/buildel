import { useMemo } from "react";
import { Handle, Position } from "@xyflow/react";
import classNames from "classnames";
import startCase from "lodash.startcase";
import type { IHandle } from "../pipeline.types";

interface HandleProps {
  handle: IHandle;
  index: number;
  isConnectable?: boolean;
  blockName: string;
}

export function InputHandle({
  handle,
  index,
  isConnectable = true,
  blockName,
}: HandleProps) {
  const handleTypeClassName = useMemo(() => {
    switch (handle.data.type) {
      case "text":
        return "!rounded-[1px] !bg-primary-500";
      case "audio":
      case "file":
        return "!rounded-full !bg-primary-500";
    }
  }, [handle.data.type]);

  return (
    <>
      <span
        className="absolute right-full -translate-y-[15%] -translate-x-[12px] text-[10px] text-white"
        style={{ top: (index + 1) * 25 }}
      >
        {startCase(handle.data.name.replace(/_input/g, " "))}
      </span>
      <Handle
        id={handle.id}
        key={handle.id}
        type={handle.type}
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ top: (index + 1) * 25 }}
        data-testid={`${blockName}-${handle.data.name}-handle`}
        className={classNames(
          "!border-1 !border-primary-500 !w-[10px] !h-[10px] !-translate-x-[50%]",
          handleTypeClassName
        )}
      />
    </>
  );
}

export function OutputHandle({
  handle,
  index,
  isConnectable,
  blockName,
}: HandleProps) {
  const handleTypeClassName = useMemo(() => {
    switch (handle.data.type) {
      case "text":
        return "!rounded-[1px] !bg-secondary-500";
      case "audio":
      case "file":
        return "!rounded-full !bg-secondary-500";
    }
  }, [handle.data.type]);

  return (
    <>
      <div
        className="absolute left-full -translate-y-[15%] translate-x-[12px] text-xxs text-white"
        style={{ top: (index + 1) * 25 }}
      >
        {startCase(handle.data.name.replace(/_output/g, " "))}
      </div>
      <Handle
        key={handle.id}
        type={handle.type}
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ top: (index + 1) * 25 }}
        id={handle.id}
        data-testid={`${blockName}-${handle.data.name}-handle`}
        data-name={handle.data.name}
        className={classNames(
          "!border-1 !border-secondary-500 !w-[10px] !h-[10px] !translate-x-[40%]",
          handleTypeClassName
        )}
      />
    </>
  );
}

export function ToolHandle({
  handle,
  index,
  isConnectable = true,
  blockName,
}: HandleProps) {
  const isWorker = handle.data.type === "worker";
  const handleTypeClassName = useMemo(() => {
    switch (handle.data.type) {
      case "worker":
        return "!rounded-[1px] !bg-secondary-500 !border-secondary-500 -translate-y-[3px]";

      case "controller":
        return "!rounded-[1px] !bg-primary-500 !border-primary-500 translate-y-[3px]";
    }
  }, [handle.data.type]);

  return (
    <>
      <span
        className={classNames(
          "absolute text-[10px] -translate-x-1/2  text-white left-1/2 -translate-x-1/2"
        )}
        style={{
          top: isWorker ? -26 : "auto",
          bottom: !isWorker ? -26 : "auto",
        }}
      >
        I/O
      </span>
      <Handle
        key={handle.id}
        type={handle.type}
        position={isWorker ? Position.Top : Position.Bottom}
        isConnectable={isConnectable}
        id={handle.id}
        data-testid={`${blockName}-${handle.data.name}-handle`}
        className={classNames(
          "!border-1 !w-[10px] !h-[10px] !rotate-45 !-translate-x-1/2",
          handleTypeClassName
        )}
      />
    </>
  );
}
