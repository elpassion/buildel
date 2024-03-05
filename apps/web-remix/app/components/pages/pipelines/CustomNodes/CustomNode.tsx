import { PropsWithChildren, useCallback, useMemo } from "react";
import startCase from "lodash.startcase";
import classNames from "classnames";
import { Badge, Icon } from "@elpassion/taco";
import { useRunPipelineNode } from "../RunPipelineProvider";
import { getBlockFields, getBlockHandles } from "../PipelineFlow.utils";
import { IBlockConfig } from "../pipeline.types";
import { InputHandle, OutputHandle, ToolHandle } from "./NodeHandles";
import { NodeFieldsForm } from "./NodeFieldsForm";
import { NodeFieldsOutput } from "./NodeFieldsOutput";

export interface CustomNodeProps extends PropsWithChildren {
  data: IBlockConfig;
  selected: boolean;
  onUpdate?: (block: IBlockConfig) => void;
  onDelete: (block: IBlockConfig) => void;
  isConnectable?: boolean;
  disabled?: boolean;
  className?: string;
}
export function CustomNode({
  data,
  selected,
  children,
  className,
}: CustomNodeProps) {
  const { status, isValid, errors } = useRunPipelineNode(data);

  const borderStyles = useCallback(() => {
    if (!isValid) return "border-red-500";
    if (selected) return "border-primary-700";
    return "border-neutral-900";
  }, [isValid, selected]);

  return (
    <>
      <section
        aria-label={`Block: ${data.name}`}
        data-testid="builder-block"
        data-active={status}
        data-valid={isValid}
        className={classNames(
          "min-h-[100px] min-w-[250px] max-w-[500px] break-words rounded bg-neutral-800 drop-shadow-sm transition border nowheel",
          borderStyles(),
          {
            "scale-110": status,
            "border-primary-700": status,
          },
          className
        )}
      >
        <NodeWorkingIcon isWorking={status} />
        {children}
      </section>
      {errors.length === 0 ? null : (
        <p className="text-red-500 flex gap-1 items-center mt-2">
          <Icon iconName="alert-circle" className="text-sm" />
          <span className="text-xs">
            {errors.length === 1
              ? errors[0]
              : "This block contains problems to fix."}
          </span>
        </p>
      )}
    </>
  );
}

export interface CustomNodeHeaderProps extends PropsWithChildren {
  data: IBlockConfig;
}

export function CustomNodeHeader({ data, children }: CustomNodeHeaderProps) {
  return (
    <header
      className={classNames(
        "relative flex items-center justify-between p-2 rounded-t bg-neutral-900 gap-2"
      )}
    >
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-medium capitalize text-neutral-50">
          {startCase(data.type)}
        </h3>
        <Badge size="xs" text={data.name} />
      </div>

      {children}
    </header>
  );
}

interface CustomNodeBodyProps {
  data: IBlockConfig;
  isConnectable?: boolean;
  disabled?: boolean;
}
export function CustomNodeBody({
  data,
  isConnectable,
  disabled,
}: CustomNodeBodyProps) {
  const handles = useMemo(() => getBlockHandles(data), [data]);

  const inputsHandles = useMemo(
    () =>
      handles
        .filter((h) => h.data.type !== "controller" && h.data.type !== "worker")
        .filter((h) => h.type === "target"),
    [handles]
  );
  const outputsHandles = useMemo(
    () =>
      handles
        .filter((h) => h.data.type !== "controller" && h.data.type !== "worker")
        .filter((h) => h.type === "source"),
    [handles]
  );
  const ioHandles = useMemo(
    () =>
      handles.filter(
        (h) => h.data.type === "controller" || h.data.type === "worker"
      ),
    [handles]
  );

  const fields = useMemo(() => getBlockFields(data), [data]);
  const inputsFields = useMemo(
    () => fields.filter((field) => field.type === "input"),
    [fields]
  );
  const outputFields = useMemo(
    () => fields.filter((field) => field.type === "output"),
    [fields]
  );

  return (
    <div className="p-2 nodrag">
      {inputsFields.length > 0 ? (
        <NodeFieldsForm
          block={data}
          fields={inputsFields}
          disabled={disabled}
        />
      ) : null}

      {outputFields.length > 0 ? (
        <NodeFieldsOutput fields={outputFields} block={data} />
      ) : null}

      {inputsHandles.map((handle, index) => (
        <InputHandle
          key={handle.id}
          handle={handle}
          index={index}
          isConnectable={isConnectable}
          blockName={data.name}
        />
      ))}
      {outputsHandles.map((handle, index) => (
        <OutputHandle
          key={handle.id}
          handle={handle}
          index={index}
          isConnectable={isConnectable}
          blockName={data.name}
        />
      ))}

      {ioHandles.map((handle, index) => (
        <ToolHandle
          key={handle.id}
          handle={handle}
          index={index}
          isConnectable={isConnectable}
          blockName={data.name}
        />
      ))}
    </div>
  );
}

function NodeWorkingIcon({ isWorking }: { isWorking: boolean }) {
  return (
    <div
      className={classNames(
        "animate-ping w-2 h-2 rounded-full bg-primary-500 flex justify-center items-center absolute z-10 -top-1 -right-1",
        {
          hidden: !isWorking,
          block: isWorking,
        }
      )}
    />
  );
}
