import React, { useMemo, useState } from "react";
import {
  IMessage,
  MessageStatusType,
  MessageType,
  useEl,
} from "~/components/pages/pipelines/EL/ELProvider";
import { Icon } from "@elpassion/taco";
import { useBoolean } from "usehooks-ts";
import classNames from "classnames";
import { ItemList } from "~/components/list/ItemList";
import { dayjs } from "~/utils/Dayjs";
interface ElChatProps {}

export const ElChat: React.FC<ElChatProps> = () => {
  const { push, isGenerating } = useEl();

  const onSubmit = (message: string) => {
    push(message);
  };

  return (
    <div className="max-w-full">
      <div className="w-full border border-neutral-800 rounded-lg px-2 py-3">
        <ChatMessages />
      </div>

      <div className="mt-2">
        <ChatInput
          onSubmit={onSubmit}
          status={isGenerating ? "working" : "idle"}
        />
      </div>
    </div>
  );
};

const EMPTY_MESSAGES = [
  {
    message:
      "I'm EL, your AI helper here at Buildel. Feel free to ask me anything about creating the perfect workflow for you in the application.",
    type: "ai" as MessageType,
    created_at: new Date(),
    status: "finished" as MessageStatusType,
    id: "2",
  },
  {
    message: "👋 Hi there!",
    type: "ai" as MessageType,
    created_at: new Date(),
    status: "finished" as MessageStatusType,
    id: "1",
  },
];

function ChatMessages() {
  const { messages } = useEl();

  const reversed = useMemo(() => {
    if (!messages.length) return EMPTY_MESSAGES;
    return messages.map((_, idx) => messages[messages.length - 1 - idx]);
  }, [messages]);

  return (
    <ItemList
      className={classNames(
        "flex flex-col-reverse gap-2 w-full h-full overflow-y-auto pr-1",
        { "h-[300px]": !!messages.length, "h-[200px]": !messages.length }
      )}
      itemClassName="w-full"
      items={reversed}
      renderItem={(msg) => (
        <>
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
        </>
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
        "w-full max-w-[70%] min-h-[30px] rounded-t-xl border border-neutral-600 px-2 py-1.5 text-neutral-200 text-xs",
        {
          "bg-neutral-800 rounded-br-xl": data.type === "ai",
          "bg-neutral-900 rounded-bl-xl ml-auto mr-0": data.type !== "ai",
        }
      )}
    >
      <p>{data.message}</p>
    </article>
  );
}

interface ChatInputProps {
  onSubmit: (message: string) => void;
  status: "working" | "idle";
}

function ChatInput({ onSubmit, status }: ChatInputProps) {
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
    return isWorking || !value.trim();
  }, [value, isWorking]);

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
