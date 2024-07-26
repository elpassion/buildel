import { useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from '@remix-run/react';
import { useReactFlow } from '@xyflow/react';
import { Settings, Trash } from 'lucide-react';

import { IconButton } from '~/components/iconButton';
import { confirm } from '~/components/modal/confirm';
import type { IBlockConfig } from '~/components/pages/pipelines/pipeline.types';
import { useRunPipeline } from '~/components/pages/pipelines/RunPipelineProvider';
import { cn } from '~/utils/cn';
import { routes } from '~/utils/routes.utils';

import {
  CustomNode,
  CustomNodeBody,
  CustomNodeHeader,
} from '../CustomNodes/CustomNode';
import type { CustomNodeProps } from '../CustomNodes/CustomNode';

export function BuilderCustomNode(props: CustomNodeProps) {
  const { status: runStatus } = useRunPipeline();

  return (
    <CustomNode
      {...props}
      className={cn('hover:border-blue-700', { nodrag: runStatus !== 'idle' })}
    >
      <CustomNodeHeader data={props.data}>
        <BuilderNodeHeaderActions data={props.data} disabled={props.disabled} />
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
}
function BuilderNodeHeaderActions({
  data,
  disabled,
}: BuilderNodeHeaderActionsProps) {
  const navigate = useNavigate();
  const { status: runStatus } = useRunPipeline();
  const [searchParams] = useSearchParams();
  const { organizationId, pipelineId } = useParams();
  const { deleteElements } = useReactFlow();

  const handleDelete = useCallback(() => {
    confirm({
      onConfirm: async () => {
        await deleteElements({ nodes: [{ id: data.name }] });
      },
      children: (
        <p className="text-sm">
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
    <div className="flex items-center">
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
        size="xs"
        icon={<Settings />}
        aria-label={`Edit block: ${data.name}`}
        onClick={handleEdit}
        disabled={runStatus !== 'idle'}
        className="text-inherit"
        onlyIcon
      />

      <IconButton
        size="xs"
        aria-label={`Delete block: ${data.name}`}
        icon={<Trash />}
        onClick={handleDelete}
        disabled={runStatus !== 'idle' || disabled}
        className="text-inherit"
        onlyIcon
      />
    </div>
  );
}
