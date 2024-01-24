import React, { useMemo, useState } from "react";
import { IMessage, useEl } from "~/components/pages/pipelines/EL/ELProvider";
import { Icon, Input } from "@elpassion/taco";
import { useBoolean } from "usehooks-ts";
import classNames from "classnames";
import { ItemList } from "~/components/list/ItemList";
import { dayjs } from "~/utils/Dayjs";
interface ElChatProps {}

export const ElChat: React.FC<ElChatProps> = () => {
  const { push } = useEl();

  const onSubmit = (message: string) => {
    push(message);
  };

  return (
    <div className="max-w-full">
      <div className="w-full h-[400px] border border-neutral-800 rounded-lg px-2 py-3">
        <ChatMessages />
      </div>

      <div className="mt-2">
        <ChatInput onSubmit={onSubmit} />
      </div>
    </div>
  );
};

function ChatMessages() {
  const { messages } = useEl();

  const reversed = useMemo(() => {
    return messages.map((_, idx) => messages[messages.length - 1 - idx]);
  }, [messages]);

  return (
    <ItemList
      className="flex flex-col-reverse gap-3 w-full max-h-full overflow-y-auto pr-1"
      itemClassName="w-full"
      items={reversed}
      renderItem={(msg) => (
        <div
          className={classNames("max-w-[70%]", {
            "ml-auto mr-0": msg.type === "user",
          })}
        >
          <ChatMessage data={msg} />
          <span
            className={classNames(
              "block w-fit text-[10px] text-neutral-300 mt-[2px]",
              {
                "ml-auto mr-1": msg.type === "user",
              }
            )}
          >
            {dayjs(msg.created_at).format("HH:mm")}
          </span>
        </div>
      )}
    />
  );
}

interface ChatMessageProps {
  data: IMessage;
}

function ChatMessage({ data }: ChatMessageProps) {
  return (
    <article
      className={classNames(
        "w-full rounded-t-xl border border-neutral-600 px-2 py-1.5 text-neutral-200 text-xs",
        {
          "bg-neutral-800 rounded-br-lg": data.type === "ai",
          "bg-neutral-900 rounded-bl-lg": data.type !== "ai",
        }
      )}
    >
      <p>{data.message}</p>
    </article>
  );
}

interface ChatInputProps {
  onSubmit: (message: string) => void;
}

function ChatInput({ onSubmit }: ChatInputProps) {
  const [value, setValue] = useState("");
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

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(value);
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
        className="bg-transparent !border-none w-full text-sm text-neutral-200 py-1.5 pl-3 pr-8"
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={onChange}
      />

      <button className="absolute top-1/2 right-1 -translate-y-1/2 text-white w-6 h-6 rounded-full bg-secondary-600 hover:bg-secondary-500 flex justify-center items-center">
        <Icon size="none" iconName="send" className="text-sm" />
      </button>
    </form>
  );
}
