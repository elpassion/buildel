import { useCallback } from 'react';
import { useNavigate, useSearchParams } from '@remix-run/react';
import { Settings } from 'lucide-react';

import { IconButton } from '~/components/iconButton';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { usePipelineId } from '~/hooks/usePipelineId';
import { usePipelineRunId } from '~/hooks/usePipelineRunId';
import { routes } from '~/utils/routes.utils';

import { CustomNode, CustomNodeBody, CustomNodeHeader } from './CustomNode';
import type { CustomNodeProps } from './CustomNode';

export interface ReadonlyCustomNodeProps extends CustomNodeProps {
  isConnectable?: boolean;
  disabled?: boolean;
}

export function ReadonlyCustomNode(props: ReadonlyCustomNodeProps) {
  const [searchParams] = useSearchParams();
  const organizationId = useOrganizationId();
  const pipelineId = usePipelineId();
  const runId = usePipelineRunId();
  const navigate = useNavigate();

  const seePreview = useCallback(() => {
    navigate(
      routes.pipelineRunBlockConfig(
        organizationId,
        pipelineId,
        runId,
        props.data.name,
        Object.fromEntries(searchParams),
      ),
    );
  }, [searchParams]);

  return (
    <CustomNode {...props}>
      <CustomNodeHeader data={props.data}>
        <IconButton
          size="xs"
          icon={<Settings />}
          aria-label="See block config"
          onClick={seePreview}
          className="text-inherit"
          onlyIcon
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
