import { PropsWithChildren, useCallback, useMemo } from "react";
import startCase from "lodash.startcase";
import classNames from "classnames";
import { Badge, Icon } from "@elpassion/taco";
import { IconButton } from "~/components/iconButton";
import { useRunPipeline, useRunPipelineNode } from "../RunPipelineProvider";
import { getBlockFields, getBlockHandles } from "../PipelineFlow.utils";
import { IBlockConfig } from "../pipeline.types";
import { InputHandle, OutputHandle } from "./NodeHandles";
import { NodeFieldsForm } from "./NodeFieldsForm";
import { NodeFieldsOutput } from "./NodeFieldsOutput";

export interface CustomNodeProps extends PropsWithChildren {
  data: IBlockConfig;
  selected: boolean;
  onUpdate: (block: IBlockConfig) => void;
  onDelete: (block: IBlockConfig) => void;
  isConnectable?: boolean;
  disabled?: boolean;
}
export function CustomNode({ data, selected, children }: CustomNodeProps) {
  const { status, isValid, errors } = useRunPipelineNode(data);

  const borderStyles = useCallback(() => {
    if (!isValid) return "border-red-500";
    if (selected) return "border-primary-700";
    return "border-neutral-900";
  }, [isValid, selected]);

  return (
    <>
      <section
        className={classNames(
          "min-h-[100px] min-w-[250px] max-w-[500px] break-words rounded bg-neutral-800 drop-shadow-sm transition border nowheel",
          borderStyles(),
          {
            "scale-110": status,
          }
        )}
      >
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

interface CustomNodeHeaderActionsProps {
  data: IBlockConfig;
  disabled?: boolean;
  onUpdate: (block: IBlockConfig) => void;
  onDelete: (block: IBlockConfig) => void;
}
export function CustomNodeHeaderActions({
  data,
  disabled,
  onUpdate,
  onDelete,
}: CustomNodeHeaderActionsProps) {
  const { status: runStatus } = useRunPipeline();

  const handleDelete = useCallback(() => {
    onDelete(data);
  }, []);

  const handleEdit = useCallback(() => {
    onUpdate(data);
  }, [data]);

  const isEditable = useMemo(() => {
    try {
      const propKeys = Object.keys(
        data.block_type.schema.properties.opts.properties
      );

      return propKeys.length > 0;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, [data]);

  return (
    <div className="flex gap-2 items-center">
      {isEditable && (
        <IconButton
          onlyIcon
          icon={<Icon iconName="settings" />}
          aria-label="Edit block"
          onClick={handleEdit}
          disabled={runStatus !== "idle"}
        />
      )}

      <IconButton
        onlyIcon
        aria-label="Delete block"
        icon={<Icon iconName="trash" />}
        onClick={handleDelete}
        disabled={runStatus !== "idle" || disabled}
      />
    </div>
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
    () => handles.filter((h) => h.type === "target"),
    [handles]
  );
  const outputsHandles = useMemo(
    () => handles.filter((h) => h.type === "source"),
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
        />
      ))}
      {outputsHandles.map((handle, index) => (
        <OutputHandle
          key={handle.id}
          handle={handle}
          index={index}
          isConnectable={isConnectable}
        />
      ))}
    </div>
  );
}
