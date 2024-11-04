import { useRunPipeline } from '~/components/pages/pipelines/RunPipelineProvider';
import { cn } from '~/utils/cn';

import {
  CustomNode,
  CustomNodeBody,
  CustomNodeHeader,
} from '../CustomNodes/CustomNode';
import type { CustomNodeProps } from '../CustomNodes/CustomNode';
import { CustomNodeActions } from './CustomNodeActions';

export function BuilderCustomNode(props: CustomNodeProps) {
  const { status: runStatus } = useRunPipeline();

  return (
    <CustomNode
      {...props}
      className={cn('hover:border-blue-700', { nodrag: runStatus !== 'idle' })}
    >
      <CustomNodeHeader data={props.data}>
        <CustomNodeActions data={props.data} disabled={props.disabled} />
      </CustomNodeHeader>

      <CustomNodeBody
        data={props.data}
        isConnectable={props.isConnectable}
        disabled={props.disabled}
      />
    </CustomNode>
  );
}
