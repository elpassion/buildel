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
import { useNavigate, useParams, useSearchParams } from "@remix-run/react";
import { confirm } from "~/components/modal/confirm";
import { routes } from "~/utils/routes.utils";

export function BuilderNode(props: CustomNodeProps) {
  return (
    <CustomNode {...props} className="hover:border-primary-700">
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
  const [searchParams] = useSearchParams();
  const { organizationId, pipelineId } = useParams();

  const handleDelete = useCallback(() => {
    confirm({
      onConfirm: async () => onDelete(data),
      children: (
        <p className="text-white">
          You are about to delete the "{data.name}" block from your workflow.
          This action is irreversible.
        </p>
      ),
    });
  }, []);

  const handleEdit = useCallback(() => {
    navigate(
      routes.pipelineEditBlock(
        organizationId ?? "",
        pipelineId ?? "",
        data.name,
        Object.fromEntries(searchParams)
      )
    );
  }, [data, searchParams]);

  const isEditable = useMemo(() => {
    try {
      const propKeys = Object.keys(
        data.block_type?.schema.properties.opts.properties
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
          aria-label={`Edit block: ${data.name}`}
          onClick={handleEdit}
          disabled={runStatus !== "idle"}
        />
      )}

      <IconButton
        onlyIcon
        aria-label={`Delete block: ${data.name}`}
        icon={<Icon iconName="trash" />}
        onClick={handleDelete}
        disabled={runStatus !== "idle" || disabled}
      />
    </div>
  );
}
