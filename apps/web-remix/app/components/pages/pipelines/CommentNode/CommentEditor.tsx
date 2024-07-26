import type { PropsWithChildren } from 'react';
import React, { useEffect } from 'react';
import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { WysiwygContext } from '~/components/wysiwyg/wysiwygContext';
import { cn } from '~/utils/cn';

export type UpdateProps = {
  color?: string;
  content?: string;
};

const extensions = [
  StarterKit.configure({ paragraph: { HTMLAttributes: { class: '!my-0' } } }),
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  //@ts-ignore
  TextStyle.configure({ types: [ListItem.name] }),
];

interface CommentEditorProps {
  triggerFocus?: boolean;
  onBlur?: (props: UpdateProps) => void;
  content?: string;
}

export const CommentEditor = ({
  triggerFocus,
  onBlur,
  children,
  content,
}: PropsWithChildren<CommentEditorProps>) => {
  const editor = useEditor({
    extensions,
    content: content ?? '',
    onBlur: (props) => onBlur?.({ content: props.editor.getHTML() }),
    editorProps: {
      attributes: {
        class:
          'py-2 px-3 min-w-full h-full w-full text-white !prose !prose-sm overflow-y-auto lg:prose-base focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (triggerFocus) {
      editor?.view.focus();
    }
  }, [triggerFocus]);

  return (
    <WysiwygContext.Provider value={editor}>
      {children}

      <EditorContent editor={editor} className={cn('w-full h-full')} />
    </WysiwygContext.Provider>
  );
};
