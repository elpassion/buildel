import { Icon } from '@elpassion/taco';
import Select from 'rc-select';
import type { SelectProps } from 'rc-select';

import 'rc-select/assets/index.css';
import './select.input.css';

export type SelectInputProps = SelectProps;

const SelectInput: React.FC<SelectInputProps> = ({ ...props }) => {
  return <Select showSearch clearIcon={<Icon iconName="x" />} {...props} />;
};

export default SelectInput;
