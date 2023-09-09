import { useMemo } from "react";
import { startCase } from "lodash";
import { Handle, Position } from "reactflow";
import { IHandle } from "../../list/contracts";

export function InputHandle({
  handle,
  index,
}: {
  handle: IHandle;
  index: number;
}) {
  const handleTypeClassName = useMemo(() => {
    switch (handle.data.type) {
      case "text":
        return "!rounded-none !bg-transparent !border-1 !border-black";
      case "audio":
        return "!rounded-full !bg-transparent !border-1 !border-black";
      case "file":
        return "!rounded-none !bg-transparent !border-1 !border-black rotate-45";
    }
  }, [handle.data.type]);

  return (
    <>
      <div
        className={`absolute right-[102%] translate-y-[-80%] text-xxs`}
        style={{ top: (index + 1) * 30 }}
      >
        {startCase(handle.data.name.replace(/_input/g, " "))}
      </div>
      <Handle
        key={handle.id}
        type={handle.type}
        position={Position.Left}
        style={{ top: (index + 1) * 30 }}
        id={handle.id}
        className={handleTypeClassName}
      />
    </>
  );
}

export function OutputHandle({
  handle,
  index,
}: {
  handle: IHandle;
  index: number;
}) {
  const handleTypeClassName = useMemo(() => {
    switch (handle.data.type) {
      case "text":
        return "!rounded-none !bg-black !border-1 !border-black";
      case "audio":
        return "!rounded-full !bg-black !border-1 !border-black";
      case "file":
        return "!rounded-none !bg-black !border-1 !border-black rotate-45";
    }
  }, [handle.data.type]);

  return (
    <>
      <div
        className="absolute left-[102%] translate-y-[-80%] text-xxs"
        style={{ top: (index + 1) * 30 }}
      >
        {startCase(handle.data.name.replace(/_output/g, " "))}
      </div>
      <Handle
        key={handle.id}
        type={handle.type}
        position={Position.Right}
        style={{ top: (index + 1) * 30 }}
        id={handle.id}
        data-name={handle.data.name}
        className={handleTypeClassName}
      />
    </>
  );
}
