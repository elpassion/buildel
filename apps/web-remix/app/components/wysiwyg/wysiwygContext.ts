import React from 'react';
import type { useEditor } from '@tiptap/react';

export const WysiwygContext =
  React.createContext<ReturnType<typeof useEditor>>(null);

export const useWysiwygContext = () => {
  return React.useContext(WysiwygContext);
};
