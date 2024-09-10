import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import Mention from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import { EditorContent, ReactRenderer, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Loader, Send } from 'lucide-react';
import { useBoolean } from 'usehooks-ts';

import type { ChatSize } from '~/components/chat/chat.types';
import { ChatMentionList } from '~/components/chat/ChatMentionList';
import { cn } from '~/utils/cn';

const extensions = [
  StarterKit.configure({
    paragraph: { HTMLAttributes: { class: '!my-0' } },
  }),
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  //@ts-ignore
  TextStyle.configure({ types: [ListItem.name] }),
];

interface ChatInputProps {
  onSubmit: (message: string) => void;
  generating?: boolean;
  disabled?: boolean;
  prefix?: React.ReactNode;
  attachments?: React.ReactNode;
  placeholder?: string;
  size?: ChatSize;
  className?: string;
  suggestions?: string[];
}

export function ChatInput({
  onSubmit,
  generating,
  disabled,
  prefix,
  attachments,
  placeholder = 'Ask a question...',
  size = 'default',
  suggestions = [],
  className,
}: ChatInputProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const isMentioning = useRef(false);
  const [value, setValue] = useState('');
  const {
    value: isFocused,
    setTrue: setFocus,
    setFalse: setBlur,
  } = useBoolean(false);

  const onFocus = () => {
    setFocus();
  };

  const onBlur = () => {
    setBlur();
  };

  const onChange = (value: string) => {
    setValue(value);
  };

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      ...extensions,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: {
          render: () => {
            let reactRenderer: ReactRenderer;

            return {
              onStart: (props) => {
                isMentioning.current = true;
                const query = props.query.toLowerCase();
                const filteredItems = suggestions.filter((item) =>
                  item.toLowerCase().includes(query),
                );

                reactRenderer = new ReactRenderer(ChatMentionList, {
                  props: {
                    ...props,
                    items: filteredItems,
                  },
                  editor: props.editor,
                });
              },

              onUpdate(props) {
                const query = props.query.toLowerCase();
                const filteredItems = suggestions.filter((item) =>
                  item.toLowerCase().includes(query),
                );
                reactRenderer?.updateProps({
                  ...props,
                  items: filteredItems,
                });
              },

              onKeyDown(props) {
                if (props.event.key === 'Escape') {
                  reactRenderer?.destroy();
                  isMentioning.current = false;
                  return true;
                }

                return (reactRenderer?.ref as any)?.onKeyDown(props);
              },

              onExit() {
                reactRenderer.destroy();
                isMentioning.current = false;
              },
            };
          },
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: '',
    onBlur: onBlur,
    onFocus: onFocus,
    onUpdate: ({ editor }) => {
      onChange(editor.getText() ?? '');
    },
    editorProps: {
      handleKeyDown: (_, e) => {
        if (e.key === 'Enter' && isMentioning.current) {
          return false;
        }
        if (
          e.key === 'Enter' &&
          (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey)
        ) {
          editor?.commands.setHardBreak();
          return true; // stop further propagation
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          handleOnSubmit();
          return true; // stop further propagation
        }
      },
      attributes: {
        class: cn(
          'min-w-full h-full w-full max-h-[112px] !text-foreground !prose !prose-sm overflow-y-auto lg:prose-base focus:outline-none ',
          {
            'text-sm py-1.5 pl-2 pr-8': size === 'sm',
            'text-base py-3 pl-4 pr-10': size === 'default',
          },
        ),
      },
    },
  });

  const isDisabled = useMemo(() => {
    return disabled || generating || !value.trim();
  }, [value, generating, disabled]);

  useEffect(() => {
    if (!editor) return;

    editor.setEditable(!disabled);
  }, [disabled]);

  const handleOnSubmit = () => {
    if (isDisabled) return;
    onSubmit(value);
    editor?.commands.clearContent();
  };

  const hasNewLine = editor?.getText().includes('\n');

  return (
    <div
      className={cn(
        'relative overflow-hidden border border-input bg-white flex items-center min-h-fit h-auto shrink-0 w-full flex-col',
        {
          'outline-none ring-2 ring-ring ring-offset-2': isFocused,
          'rounded-2xl': size === 'sm' || hasNewLine || !!attachments,
          'rounded-full': size === 'default' && !hasNewLine && !attachments,
        },
        className,
      )}
    >
      {attachments}
      <div className="flex w-full items-center">
        {prefix}
        <form
          className="flex flex-1 w-full"
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            handleOnSubmit();
          }}
        >
          <div
            className={cn('w-full h-full', {
              'min-h-[48px]': size !== 'sm',
            })}
          >
            <EditorContent
              placeholder={placeholder}
              editor={editor}
              className={cn('w-full h-full')}
            />
          </div>

          <SendButton
            disabled={isDisabled}
            generating={generating}
            size={size}
          />
        </form>
      </div>
    </div>
  );
}

interface SendButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  size?: ChatSize;
  generating?: boolean;
  disabled?: boolean;
}

function SendButton({
  size,
  generating,
  disabled,
  className,
  ...rest
}: SendButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'absolute text-white rounded-full bg-primary hover:bg-primary/90 flex justify-center items-center disabled:opacity-30 disabled:pointer-events-none',
        {
          'bottom-[6px] right-1.5 w-6 h-6': size === 'sm',
          'bottom-2 right-2 w-8 h-8': size === 'default',
        },
        className,
      )}
      {...rest}
    >
      {generating ? (
        <Loader
          className={cn('w-4 h-4', {
            'animate-spin': generating,
            'w-4 h-4': size === 'default',
            'w-3 h-3': size === 'sm',
          })}
        />
      ) : (
        <Send
          className={cn('w-4 h-4', {
            'w-4 h-4': size === 'default',
            'w-3 h-3': size === 'sm',
          })}
        />
      )}
    </button>
  );
}
