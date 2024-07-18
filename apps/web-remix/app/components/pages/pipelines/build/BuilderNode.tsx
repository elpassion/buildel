import { useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from '@remix-run/react';
import { Settings, Trash } from 'lucide-react';

import { IconButton } from '~/components/iconButton';
import { confirm } from '~/components/modal/confirm';
import type { IBlockConfig } from '~/components/pages/pipelines/pipeline.types';
import { useRunPipeline } from '~/components/pages/pipelines/RunPipelineProvider';
import { routes } from '~/utils/routes.utils';

import {
  CustomNode,
  CustomNodeBody,
  CustomNodeHeader,
} from '../CustomNodes/CustomNode';
import type { CustomNodeProps } from '../CustomNodes/CustomNode';

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
        organizationId ?? '',
        pipelineId ?? '',
        data.name,
        Object.fromEntries(searchParams),
      ),
    );
  }, [data, searchParams]);

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

      <IconButton
        size="xxs"
        onlyIcon
        icon={<Settings />}
        aria-label={`Edit block: ${data.name}`}
        onClick={handleEdit}
        disabled={runStatus !== 'idle'}
      />

      <IconButton
        size="xxs"
        onlyIcon
        aria-label={`Delete block: ${data.name}`}
        icon={<Trash />}
        onClick={handleDelete}
        disabled={runStatus !== 'idle' || disabled}
      />
    </div>
  );
}
