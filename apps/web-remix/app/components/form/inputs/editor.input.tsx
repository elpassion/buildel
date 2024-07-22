import React, { useState } from 'react';

import type { CodeMirrorProps } from '~/components/editor/CodeMirror/CodeMirror';
import { Editor } from '~/components/editor/CodeMirror/CodeMirror';
import { cn } from '~/utils/cn';

export type EditorInputProps = CodeMirrorProps;

export const EditorInput: React.FC<EditorInputProps> = ({
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    onFocus?.(e);
    setIsFocused(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    onBlur?.(e);
    setIsFocused(false);
  };

  return (
    <div
      className={cn('overflow-hidden border border-input rounded-lg', {
        'outline-none ring-2 ring-ring ring-offset-2': isFocused,
      })}
    >
      <Editor onFocus={handleFocus} onBlur={handleBlur} {...rest} />
    </div>
  );
};
