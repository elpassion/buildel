import React, { useState } from 'react';
import classNames from 'classnames';

import type { CodeMirrorProps } from '~/components/editor/CodeMirror/CodeMirror';
import { Editor } from '~/components/editor/CodeMirror/CodeMirror';

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
      className={classNames(
        'overflow-hidden border border-neutral-200 rounded-lg',
        { 'ring-[3px] ring-primary-700 ring-offset-1': isFocused },
      )}
    >
      <Editor onFocus={handleFocus} onBlur={handleBlur} {...rest} />
    </div>
  );
};
