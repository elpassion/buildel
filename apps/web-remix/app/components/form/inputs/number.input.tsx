import React, { forwardRef } from 'react';

import type { TextInputProps } from '~/components/form/inputs/text.input';
import { TextInput } from '~/components/form/inputs/text.input';

export type NumberInputProps = Omit<TextInputProps, 'type'>;

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (props, ref) => {
    return <TextInput ref={ref} type="number" {...props} />;
  },
);

NumberInput.displayName = 'NumberInput';
