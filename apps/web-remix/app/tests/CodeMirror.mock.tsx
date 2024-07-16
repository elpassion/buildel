import React from 'react';
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror';
import { vi } from 'vitest';

vi.mock('@uiw/react-codemirror', () => ({
  default: (props: ReactCodeMirrorProps) => {
    return (
      <textarea
        data-testid={props.id}
        onChange={(e) => props.onChange?.(e.target.value, null as any)}
        value={props.value}
      ></textarea>
    );
  },
  EditorView: vi.fn(),
  ViewPlugin: {
    fromClass: vi.fn(),
  },
}));
