import React, { useMemo, useState } from "react";
import { Icon } from "@elpassion/taco";
import { useBoolean } from "usehooks-ts";
import classNames from "classnames";
import { useEl } from "./ELProvider";
import { ELChatMessages } from "./ELChatMessages";

export const ElChat: React.FC = () => {
  const { push, isGenerating, connectionStatus } = useEl();

  const onSubmit = (message: string) => {
    push(message);
  };

  return (
    <div className="max-w-full">
      <div className="w-full border border-neutral-800 rounded-lg px-2 py-3">
        <ELChatMessages />

        <GeneratingAnimation />
      </div>

      <div className="mt-2">
        <ChatInput
          onSubmit={onSubmit}
          disabled={connectionStatus !== "running"}
          status={isGenerating ? "working" : "idle"}
        />
      </div>
    </div>
  );
};

function GeneratingAnimation() {
  const { isGenerating, messages } = useEl();

  const renderMessage = () => {
    if (!messages.length) return;
    const lastMessage = messages[messages.length - 1];

    if (
      lastMessage.type === "user" ||
      (lastMessage.type === "ai" && !lastMessage.message.length)
    ) {
      return "Thinking...";
    }

    return "Generating...";
  };

  if (!isGenerating) return null;
  return (
    <div className="flex gap-0.5 items-center mt-1">
      <span className="text-[10px] text-neutral-400 mr-1">
        {renderMessage()}
      </span>
      <div className="w-1 h-1 rounded-full bg-secondary-400 animate-bounce" />
      <div className="w-1 h-1 rounded-full bg-secondary-800 animate-[bounce_1s_0.5s_ease-in-out_infinite]" />
      <div className="w-1 h-1 rounded-full bg-secondary-600 animate-bounce" />
    </div>
  );
}

interface ChatInputProps {
  onSubmit: (message: string) => void;
  status: "working" | "idle";
  disabled?: boolean;
}

function ChatInput({ onSubmit, status, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const {
    value: isFocused,
    setTrue: setFocus,
    setFalse: setBlur,
  } = useBoolean(false);

  const isWorking = useMemo(() => {
    return status === "working";
  }, [status]);

  const isDisabled = useMemo(() => {
    return disabled || isWorking || !value.trim();
  }, [value, isWorking, disabled]);

  const onFocus = () => {
    setFocus();
  };

  const onBlur = () => {
    setBlur();
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (isDisabled) return;
    e.preventDefault();
    onSubmit(value);
    setValue("");
  };

  return (
    <form
      onSubmit={handleOnSubmit}
      className={classNames(
        "relative w-full overflow-hidden rounded-full border border-neutral-700 bg-neutral-900",
        {
          "outline outline-2 outline-offset-1 outline-secondary-500 ":
            isFocused,
        }
      )}
    >
      <input
        disabled={disabled}
        className="bg-transparent !border-none w-full text-sm text-neutral-200 py-1.5 pl-3 pr-8 placeholder:text-neutral-600"
        placeholder="Ask a question..."
        value={value}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={onChange}
      />

      <button
        disabled={isDisabled}
        className="absolute top-1/2 right-1 -translate-y-1/2 text-white w-6 h-6 rounded-full bg-secondary-600 hover:bg-secondary-500 flex justify-center items-center disabled:bg-neutral-800 disabled:text-neutral-300"
      >
        <Icon
          size="none"
          iconName={isWorking ? "loader" : "send"}
          className={classNames("text-sm", { "animate-spin": isWorking })}
        />
      </button>
    </form>
  );
}
