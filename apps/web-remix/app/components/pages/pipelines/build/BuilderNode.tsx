import {
  CustomNode,
  CustomNodeBody,
  CustomNodeHeader,
  CustomNodeProps,
} from "../CustomNodes/CustomNode";
import { IBlockConfig } from "~/components/pages/pipelines/pipeline.types";
import { useRunPipeline } from "~/components/pages/pipelines/RunPipelineProvider";
import { useCallback, useMemo } from "react";
import { IconButton } from "~/components/iconButton";
import { Icon } from "@elpassion/taco";
import { useNavigate } from "@remix-run/react";

export function BuilderNode(props: CustomNodeProps) {
  return (
    <CustomNode {...props}>
      <CustomNodeHeader data={props.data}>
        <BuilderNodeHeaderActions
          data={props.data}
          disabled={props.disabled}
          onDelete={props.onDelete}
        />
      </CustomNodeHeader>

      <CustomNodeBody
        data={props.data}
        isConnectable={props.isConnectable}
        disabled={props.disabled}
      />
    </CustomNode>
  );
}

interface BuilderNodeHeaderActionsProps {
  data: IBlockConfig;
  disabled?: boolean;
  onDelete: (block: IBlockConfig) => void;
}
function BuilderNodeHeaderActions({
  data,
  disabled,
  onDelete,
}: BuilderNodeHeaderActionsProps) {
  const navigate = useNavigate();
  const { status: runStatus } = useRunPipeline();

  const handleDelete = useCallback(() => {
    onDelete(data);
  }, []);

  const handleEdit = useCallback(() => {
    navigate(`./blocks/${data.name}`);
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
      {/*<div className="w-4 h-[22px]">*/}
      {/*  <CopyCodeButton*/}
      {/*    value={JSON.stringify({*/}
      {/*      name: data.name,*/}
      {/*      opts: data.opts,*/}
      {/*      type: data.type,*/}
      {/*    })}*/}
      {/*  />*/}
      {/*</div>*/}

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
