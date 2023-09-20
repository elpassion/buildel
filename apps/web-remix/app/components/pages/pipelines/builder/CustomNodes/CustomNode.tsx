import { useCallback, useMemo } from "react";
import startCase from "lodash.startcase";
import { Badge, Icon } from "@elpassion/taco";
import { getBlockFields, getBlockHandles } from "../PipelineFlow.utils";
import { IBlockConfig } from "../../pipeline.types";
import { useRunPipeline, useRunPipelineNode } from "../RunPipelineProvider";
import { InputHandle, OutputHandle } from "./NodeHandles";
import { NodeFieldsForm, NodeFieldsOutput } from "./NodeFields";
import classNames from "classnames";

export interface CustomNodeProps {
  data: IBlockConfig;
  onUpdate?: (block: IBlockConfig) => void;
  onDelete?: (block: IBlockConfig) => void;
}
export function CustomNode({ data, onUpdate, onDelete }: CustomNodeProps) {
  const { status: runStatus } = useRunPipeline();
  const { status, isValid } = useRunPipelineNode(data);

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
    <section
      className={classNames(
        "min-h-[100px] min-w-[250px] max-w-[300px] break-words rounded bg-neutral-800 drop-shadow-sm transition",
        { "scale-110": status }
      )}
    >
      <header
        className={classNames(
          "flex items-center justify-between p-2 rounded-t",
          {
            "bg-neutral-900": isValid,
            "bg-red-800": !isValid,
          }
        )}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-medium capitalize text-neutral-50">
            {startCase(data.type)}
          </h3>
          <Badge size="xs" text={data.name} />
        </div>

        <div className="flex gap-1">
          {isEditable && (
            <button
              onClick={handleEdit}
              disabled={runStatus !== "idle"}
              className="h-6 w-6 p-1 hover:bg-neutral-700 rounded-md"
            >
              <Icon iconName="settings" className="text-neutral-200" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={runStatus !== "idle"}
              className="h-6 w-6 p-1 hover:bg-neutral-700 rounded-md"
            >
              <Icon iconName="trash" className="text-neutral-200" />
            </button>
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
  );
}
