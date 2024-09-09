import React, { useMemo, useRef, useState } from 'react';
import { Loader, Send } from 'lucide-react';
import { useBoolean, useIsomorphicLayoutEffect } from 'usehooks-ts';

import type { ChatSize } from '~/components/chat/chat.types';
import { cn } from '~/utils/cn';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  generating?: boolean;
  disabled?: boolean;
  prefix?: React.ReactNode;
  attachments?: React.ReactNode;
  placeholder?: string;
  size?: ChatSize;
  className?: string;
}

export function ChatInput({
  onSubmit,
  generating,
  disabled,
  prefix,
  attachments,
  placeholder = 'Ask a question...',
  size = 'default',
  className,
}: ChatInputProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState('');
  const {
    value: isFocused,
    setTrue: setFocus,
    setFalse: setBlur,
  } = useBoolean(false);

  useAutosizeTextArea(textareaRef.current, value);

  const isDisabled = useMemo(() => {
    return disabled || generating || !value.trim();
  }, [value, generating, disabled]);

  const onFocus = () => {
    setFocus();
  };

  const onBlur = () => {
    setBlur();
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleOnSubmit = () => {
    if (isDisabled) return;
    onSubmit(value);
    setValue('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.ctrlKey) {
      e.preventDefault();
      handleOnSubmit();
    }
    if (e.key === 'Enter' && (e.altKey || e.ctrlKey)) {
      setValue((prev) => prev + '\n');
    }
  };

  const hasNewLine = value.includes('\n');

  return (
    <div
      className={cn(
        'relative overflow-hidden border border-input bg-white flex items-center max-h-[112px] min-h-fit h-auto shrink-0 w-full flex-col',
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
          <textarea
            ref={textareaRef}
            disabled={disabled}
            className={cn(
              'bg-transparent !border-0 !ring-0 w-full text-foreground pr-8 placeholder:text-muted-foreground !outline-0 focus:!border-none resize-none max-h-[112px]',
              {
                'text-sm py-1.5 pl-2': size === 'sm',
                'text-base py-3 pl-4': size === 'default',
              },
            )}
            placeholder={placeholder}
            rows={1}
            value={value}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={onChange}
            onKeyDown={onKeyDown}
          />

          <button
            disabled={isDisabled}
            className={cn(
              'absolute text-white  rounded-full bg-primary hover:bg-primary/90 flex justify-center items-center disabled:opacity-30 disabled:pointer-events-none',
              {
                'bottom-[4.5px] right-1.5 w-6 h-6': size === 'sm',
                'bottom-2 right-2 w-8 h-8': size === 'default',
              },
            )}
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
        </form>
      </div>
    </div>
  );
}

function useAutosizeTextArea(
  textAreaRef: HTMLTextAreaElement | null,
  value: string,
) {
  useIsomorphicLayoutEffect(() => {
    if (textAreaRef) {
      textAreaRef.style.height = '0px';
      const scrollHeight = textAreaRef.scrollHeight;
      textAreaRef.style.height = scrollHeight + 'px';
    }
  }, [textAreaRef, value]);
}
