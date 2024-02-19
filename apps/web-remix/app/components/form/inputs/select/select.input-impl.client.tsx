import Select, { SelectProps } from "rc-select";
import { Icon } from "@elpassion/taco";
import "rc-select/assets/index.css";
import "./select.input.css";

export type SelectInputProps = SelectProps;

const SelectInput: React.FC<SelectInputProps> = ({ ...props }) => {
  return <Select showSearch clearIcon={<Icon iconName="x" />} {...props} />;
};

export default SelectInput;
