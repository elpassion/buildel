import { useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from '@remix-run/react';
import { useReactFlow } from '@xyflow/react';
import { Settings, Trash } from 'lucide-react';

import { IconButton } from '~/components/iconButton';
import { confirm } from '~/components/modal/confirm';
import type { IBlockConfig } from '~/components/pages/pipelines/pipeline.types';
import { useRunPipeline } from '~/components/pages/pipelines/RunPipelineProvider';
import { routes } from '~/utils/routes.utils';

interface CustomNodeActionsProps {
  data: IBlockConfig;
  disabled?: boolean;
}
export function CustomNodeActions({ data, disabled }: CustomNodeActionsProps) {
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

      <CustomNodeDeleteAction
        onClick={handleDelete}
        name={data.name}
        disabled={runStatus !== 'idle' || disabled}
      />
    </div>
  );
}

interface CustomNodeDeleteActionProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  name?: string;
}

export function CustomNodeDeleteAction({
  onClick,
  disabled,
  name,
}: CustomNodeDeleteActionProps) {
  return (
    <IconButton
      size="xs"
      aria-label={`Delete block: ${name}`}
      icon={<Trash />}
      onClick={onClick}
      disabled={disabled}
      className="text-inherit"
      onlyIcon
    />
  );
}
