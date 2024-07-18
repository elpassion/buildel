import Select from 'rc-select';
import type { SelectProps } from 'rc-select';

import 'rc-select/assets/index.css';
import './select.input.css';

import { X } from 'lucide-react';

export type SelectInputProps = SelectProps;

const SelectInput: React.FC<SelectInputProps> = ({ ...props }) => {
  return <Select showSearch clearIcon={<X className="w-4 h-4" />} {...props} />;
};

export default SelectInput;
