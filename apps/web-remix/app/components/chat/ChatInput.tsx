import React, { useMemo, useRef, useState } from 'react';
import { Icon } from '@elpassion/taco';
import classNames from 'classnames';
import { useBoolean, useIsomorphicLayoutEffect } from 'usehooks-ts';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  generating?: boolean;
  disabled?: boolean;
  prefix?: React.ReactNode;
  attachments?: React.ReactNode;
}

export function ChatInput({
  onSubmit,
  generating,
  disabled,
  prefix,
  attachments,
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

  return (
    <div
      className={classNames(
        'relative w-full overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900 flex items-center max-h-[112px] min-h-fit h-auto shrink-0 w-full flex-col',
        {
          'outline outline-2 outline-offset-1 outline-secondary-500': isFocused,
        },
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
            className="bg-transparent !border-0 !ring-0 w-full text-sm text-neutral-200 py-1.5 pl-2 pr-8 placeholder:text-neutral-600 !outline-0 focus:!border-none resize-none max-h-[112px]"
            placeholder="Ask a question..."
            rows={1}
            value={value}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={onChange}
            onKeyDown={onKeyDown}
          />

          <button
            disabled={isDisabled}
            className="absolute bottom-[4.5px] right-2 text-white w-6 h-6 rounded-full bg-secondary-600 hover:bg-secondary-500 flex justify-center items-center disabled:bg-neutral-800 disabled:text-neutral-300"
          >
            <Icon
              size="none"
              iconName={generating ? 'loader' : 'send'}
              className={classNames('text-sm', { 'animate-spin': generating })}
            />
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
