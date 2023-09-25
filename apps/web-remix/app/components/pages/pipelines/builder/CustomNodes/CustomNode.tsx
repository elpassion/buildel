import { useCallback, useMemo } from "react";
import startCase from "lodash.startcase";
import { Badge, Icon } from "@elpassion/taco";
import { getBlockFields, getBlockHandles } from "../PipelineFlow.utils";
import { IBlockConfig } from "../../pipeline.types";
import { useRunPipeline, useRunPipelineNode } from "../RunPipelineProvider";
import { InputHandle, OutputHandle } from "./NodeHandles";
import { NodeFieldsForm, NodeFieldsOutput } from "./NodeFields";
import classNames from "classnames";
import { IconButton } from "~/components/iconButton";

export interface CustomNodeProps {
  data: IBlockConfig;
  onUpdate?: (block: IBlockConfig) => void;
  onDelete?: (block: IBlockConfig) => void;
}
export function CustomNode({ data, onUpdate, onDelete }: CustomNodeProps) {
  const { status: runStatus } = useRunPipeline();
  const { status, isValid, errors } = useRunPipelineNode(data);

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

  const handleDelete = useCallback(() => {
    onDelete?.(data);
  }, []);

  const handleEdit = useCallback(() => {
    onUpdate?.(data);
  }, [data]);

  const isEditable = useMemo(() => {
    try {
      const propKeys = Object.keys(
        data.block_type.schema.properties.opts.properties
      );

      return propKeys.length > 0 && !!onUpdate;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, [data]);

  return (
    <>
      <section
        className={classNames(
          "min-h-[100px] min-w-[250px] max-w-[500px] break-words rounded bg-neutral-800 drop-shadow-sm transition border",
          {
            "scale-110": status,
            "border-red-500": !isValid,
            "border-neutral-900": isValid,
          }
        )}
      >
        <header
          className={classNames(
            "flex items-center justify-between p-2 rounded-t bg-neutral-900 gap-2"
          )}
        >
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-medium capitalize text-neutral-50">
              {startCase(data.type)}
            </h3>
            <Badge size="xs" text={data.name} />
          </div>

          <div className="flex gap-2 items-center">
            {isEditable && (
              <IconButton
                onlyIcon
                icon={<Icon iconName="settings" />}
                onClick={handleEdit}
                disabled={runStatus !== "idle"}
              />
            )}

            {onDelete && (
              <IconButton
                onlyIcon
                icon={<Icon iconName="trash" />}
                onClick={handleDelete}
                disabled={runStatus !== "idle"}
              />
            )}
          </div>
        </header>

        <div className="nodrag p-2">
          {inputsFields.length > 0 ? (
            <NodeFieldsForm block={data} fields={inputsFields} />
          ) : null}

          {outputFields.length > 0 ? (
            <NodeFieldsOutput fields={outputFields} block={data} />
          ) : null}

          {inputsHandles.map((handle, index) => (
            <InputHandle key={handle.id} handle={handle} index={index} />
          ))}
          {outputsHandles.map((handle, index) => (
            <OutputHandle key={handle.id} handle={handle} index={index} />
          ))}
        </div>
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
