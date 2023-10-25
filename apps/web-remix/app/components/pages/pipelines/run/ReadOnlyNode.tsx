import {
  CustomNode,
  CustomNodeBody,
  CustomNodeHeader,
  CustomNodeProps,
} from "../CustomNodes/CustomNode";

export interface ReadOnlyNodeProps extends CustomNodeProps {
  isConnectable?: boolean;
  disabled?: boolean;
}

export function ReadOnlyNode(props: ReadOnlyNodeProps) {
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
