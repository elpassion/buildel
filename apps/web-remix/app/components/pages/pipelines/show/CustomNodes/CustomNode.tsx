import { useCallback, useMemo } from "react";
import { startCase } from "lodash";
import { Badge, Icon, IconButton } from "@elpassion/taco";
import { getBlockFields, getBlockHandles } from "../PipelineFlow.utils";
import { IBlockConfig } from "../pipeline.types";
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
        "min-h-[100px] min-w-[250px] max-w-[300px] break-words rounded border border-neutral-800 bg-neutral-700 drop-shadow-sm transition",
        { "scale-110": status }
      )}
    >
      <header
        className={classNames("flex items-center justify-between p-2", {
          "bg-neutral-800": isValid,
          "bg-red-800": !isValid,
        })}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold capitalize text-white">
            {startCase(data.type)}
          </h3>
          <Badge size="xs" text={data.name} />
        </div>

        <div className="flex gap-1">
          {isEditable && (
            <IconButton
              icon={<Icon iconName="settings" />}
              size="xs"
              variant="basic"
              className="!h-6 !w-6 !p-1"
              onClick={handleEdit}
              disabled={runStatus !== "idle"}
            />
          )}

          {onDelete && (
            <IconButton
              icon={<Icon iconName="x" />}
              size="xs"
              variant="basic"
              className="!h-6 !w-6 !p-1"
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
  );
}
