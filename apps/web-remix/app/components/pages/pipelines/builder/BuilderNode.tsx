import {
  CustomNode,
  CustomNodeBody,
  CustomNodeHeader,
  CustomNodeHeaderActions,
  CustomNodeProps,
} from "../CustomNodes/CustomNode";

export function BuilderNode(props: CustomNodeProps) {
  return (
    <CustomNode {...props}>
      <CustomNodeHeader data={props.data}>
        <CustomNodeHeaderActions
          data={props.data}
          disabled={props.disabled}
          onDelete={props.onDelete}
          onUpdate={props.onUpdate}
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
