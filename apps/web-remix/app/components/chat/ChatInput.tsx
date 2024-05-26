import React, { useMemo, useRef, useState } from "react";
import { useBoolean, useIsomorphicLayoutEffect } from "usehooks-ts";
import classNames from "classnames";
import { Icon } from "@elpassion/taco";
import { FileUpload, useFilesUpload } from "../fileUpload/FileUpload";
import { setFiles } from "@testing-library/user-event/dist/cjs/utils/index.js";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  generating?: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, generating, disabled }: ChatInputProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState("");
  const {
    value: isFocused,
    setTrue: setFocus,
    setFalse: setBlur,
  } = useBoolean(false);
  const {
    fileList,
    removeFile,
    uploadFile,
    inputRef,
    clearFiles,
    isUploading,
  } = useFilesUpload({
    organizationId: 6,
    collectionId: 6,
  });

  useAutosizeTextArea(textareaRef.current, value);

  const isDisabled = useMemo(() => {
    return disabled || generating || !value.trim() || isUploading;
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
    const files = fileList
      .map((file) =>
        file.status === "done" ? { id: file.id, name: file.file_name } : null,
      )
      .filter((f) => !!f);
    const filesString = files.length
      ? `
\`\`\`buildel_message_attachments
${JSON.stringify(files)}
\`\`\`\n`
      : "";
    onSubmit(`${filesString}${value}`);
    setValue("");
    clearFiles();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.altKey && !e.ctrlKey) {
      e.preventDefault();
      handleOnSubmit();
    }
    if (e.key === "Enter" && (e.altKey || e.ctrlKey)) {
      setValue((prev) => prev + "\n");
    }
  };

  return (
    <div
      className={classNames(
        "relative w-full overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900 flex items-center max-h-[112px] min-h-fit h-auto shrink-0 flex-col w-full",
        {
          "outline outline-2 outline-offset-1 outline-secondary-500": isFocused,
        },
      )}
    >
      {process.env.NODE_ENV === "development" && (
        <div className="w-full">
          {fileList.map((file) => {
            return (
              <div className="text-white px-1">
                {file.status} {file.file_name}
                <button onClick={() => removeFile(file.id)} className="ml-2">
                  R
                </button>
              </div>
            );
          })}
          <label className="text-white px-1">
            U
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                [...(e.target.files || [])].forEach((file) => {
                  uploadFile(file);
                });
              }}
            />
          </label>
        </div>
      )}
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
          className="bg-transparent !border-0 !ring-0 w-full text-sm text-neutral-200 py-1.5 pl-1 pr-8 placeholder:text-neutral-600 !outline-0 focus:!border-none resize-none max-h-[112px]"
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
            iconName={generating ? "loader" : "send"}
            className={classNames("text-sm", { "animate-spin": generating })}
          />
        </button>
      </form>
    </div>
  );
}

function useAutosizeTextArea(
  textAreaRef: HTMLTextAreaElement | null,
  value: string,
) {
  useIsomorphicLayoutEffect(() => {
    if (textAreaRef) {
      textAreaRef.style.height = "0px";
      const scrollHeight = textAreaRef.scrollHeight;
      textAreaRef.style.height = scrollHeight + "px";
    }
  }, [textAreaRef, value]);
}
