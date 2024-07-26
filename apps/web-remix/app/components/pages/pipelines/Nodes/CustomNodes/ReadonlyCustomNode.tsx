import { CustomNode, CustomNodeBody, CustomNodeHeader } from './CustomNode';
import type { CustomNodeProps } from './CustomNode';

export interface ReadonlyCustomNodeProps extends CustomNodeProps {
  isConnectable?: boolean;
  disabled?: boolean;
}

export function ReadonlyCustomNode(props: ReadonlyCustomNodeProps) {
  return (
    <CustomNode {...props}>
      <CustomNodeHeader data={props.data} />

      <CustomNodeBody
        data={props.data}
        isConnectable={props.isConnectable}
        disabled={props.disabled}
      />
    </CustomNode>
  );
}
