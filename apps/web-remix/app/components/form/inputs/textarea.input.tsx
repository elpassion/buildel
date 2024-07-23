import React from 'react';

import type { TextareaProps } from '~/components/ui/textarea';
import { Textarea } from '~/components/ui/textarea';

export type TextareaInputProps = TextareaProps;
export const TextareaInput: React.FC<TextareaInputProps> = ({
  style,
  ...props
}) => {
  //className do not work right now
  return (
    <Textarea
      {...props}
      style={{
        fontSize: '12px',
        lineHeight: '16px',
        padding: '8px 10px',
        resize: 'none',
        ...style,
      }}
    />
  );
};
