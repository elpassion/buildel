import React from 'react';

import type { TextInputProps } from '~/components/form/inputs/text.input';
import { TextInput } from '~/components/form/inputs/text.input';

export type SmallFileInputProps = Omit<TextInputProps, 'type'>;

export const SmallFileInput = ({
  ref,
  ...props
}: SmallFileInputProps & {
  ref?: React.RefObject<HTMLInputElement>;
}) => {
  return <TextInput ref={ref} type="file" {...props} />;
};

SmallFileInput.displayName = 'SmallFileInput';
