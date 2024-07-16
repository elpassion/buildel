import {
  CustomNode,
  CustomNodeBody,
  CustomNodeHeader,
} from '../CustomNodes/CustomNode';
import type { CustomNodeProps } from '../CustomNodes/CustomNode';

export interface AliasNodeProps extends CustomNodeProps {
  isConnectable?: boolean;
}

export function AliasNode(props: AliasNodeProps) {
  return (
    <CustomNode {...props}>
      <CustomNodeHeader data={props.data} />

      <CustomNodeBody data={props.data} isConnectable={props.isConnectable} />
    </CustomNode>
  );
}
