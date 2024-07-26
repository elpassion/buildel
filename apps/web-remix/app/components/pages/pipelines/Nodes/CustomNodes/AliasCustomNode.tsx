import {
  CustomNode,
  CustomNodeBody,
  CustomNodeHeader,
} from '../CustomNodes/CustomNode';
import type { CustomNodeProps } from '../CustomNodes/CustomNode';

export interface AliasCustomNodeProps extends CustomNodeProps {
  isConnectable?: boolean;
}

export function AliasCustomNode(props: AliasCustomNodeProps) {
  return (
    <CustomNode {...props}>
      <CustomNodeHeader data={props.data} />

      <CustomNodeBody data={props.data} isConnectable={props.isConnectable} />
    </CustomNode>
  );
}
