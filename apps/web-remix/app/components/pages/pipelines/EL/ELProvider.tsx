import React, { PropsWithChildren, useEffect, useState } from "react";
import uniqueid from "lodash.uniqueid";
import { useBoolean } from "usehooks-ts";
import { usePipelineRun } from "~/components/pages/pipelines/usePipelineRun";
interface ELProviderProps {}

type MessageType = "ai" | "user";
export interface IMessage {
  id: string;
  type: MessageType;
  message: string;
  created_at: Date;
}

interface IELContext {
  isShown: boolean;
  show: () => void;
  hide: () => void;
  push: (message: string) => void;
  messages: IMessage[];
}

const ELContext = React.createContext<IELContext>(undefined!);

const dummy_messages = [
  {
    id: uniqueid(),
    message: "pierwsza",
    type: "ai" as MessageType,
    created_at: new Date(),
  },
  {
    id: uniqueid(),
    message: "testd asd asdas da da da",
    type: "user" as MessageType,
    created_at: new Date(),
  },
  {
    id: uniqueid(),
    message: "testd asd asdas da da da",
    type: "ai" as MessageType,
    created_at: new Date(),
  },
  {
    id: uniqueid(),
    message: "testd asd asdas da da da",
    type: "user" as MessageType,
    created_at: new Date(),
  },
  {
    id: uniqueid(),
    message: "testd asd asdas da da da",
    type: "ai" as MessageType,
    created_at: new Date(),
  },
  {
    id: uniqueid(),
    message: "testd asd asdas da da da",
    type: "user" as MessageType,
    created_at: new Date(),
  },
  {
    id: uniqueid(),
    message: "testd asd asdas da da da",
    type: "ai" as MessageType,
    created_at: new Date(),
  },
  {
    id: uniqueid(),
    message: "testd asd asdas da da da",
    type: "user" as MessageType,
    created_at: new Date(),
  },
  {
    id: uniqueid(),
    message: "testd asd asdas da da da d",
    type: "ai" as MessageType,
    created_at: new Date(),
  },
  {
    id: uniqueid(),
    message: "testd asd asdas da da da",
    type: "user" as MessageType,
    created_at: new Date(),
  },
  {
    id: uniqueid(),
    message: "testd asd asdas da da da",
    type: "ai" as MessageType,
    created_at: new Date(),
  },
  {
    id: uniqueid(),
    message: "testd asd asdas da da da",
    type: "ai" as MessageType,
    created_at: new Date(),
  },
  {
    id: uniqueid(),
    message: "testd asd asdas da da da",
    type: "ai" as MessageType,
    created_at: new Date(),
  },
  {
    id: uniqueid(),
    message: "testd asd asdas da da da",
    type: "user" as MessageType,
    created_at: new Date(),
  },
  {
    id: uniqueid(),
    message:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    type: "ai" as MessageType,
    created_at: new Date(),
  },
  {
    id: uniqueid(),
    message: "testd asd asdas da da da",
    type: "ai" as MessageType,
    created_at: new Date(),
  },
  {
    id: uniqueid(),
    message:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    type: "user" as MessageType,
    created_at: new Date(),
  },
  {
    id: uniqueid(),
    message:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    type: "ai" as MessageType,
    created_at: new Date(),
  },
  {
    id: uniqueid(),
    message: "ostatnia",
    type: "user" as MessageType,
    created_at: new Date(),
  },
];

export const ELProvider: React.FC<PropsWithChildren<ELProviderProps>> = ({
  children,
}) => {
  const { value: isShown, setTrue: show, setFalse: hide } = useBoolean();
  const [messages, setMessages] = useState<IMessage[]>(dummy_messages);

  const onBlockOutput = (
    blockId: string,
    outputName: string,
    payload: unknown
  ) => {
    console.log(blockId, outputName, payload);
    setMessages((prev) => [
      ...prev,
      {
        id: uniqueid(),
        type: "ai",
        message: (payload as { message: string }).message,
        created_at: new Date(),
      },
    ]);
  };

  const { startRun, stopRun, push } = usePipelineRun(
    13,
    135,
    onBlockOutput,
    () => console.log("Status chabge"),
    () => console.log("Error")
  );

  const clearMessages = () => {
    setMessages([]);
  };

  const handleShowEL = async () => {
    show();
    await startRun();
  };

  const handleHideEL = async () => {
    hide();
    // clearMessages();
    await stopRun();
  };

  const handlePush = (message: string) => {
    setMessages((prev) => [
      ...prev,
      { id: uniqueid(), type: "user", message, created_at: new Date() },
    ]);
    push("text_input_1:input", message);
  };

  useEffect(() => {
    return () => {
      stopRun();
    };
  }, []);

  return (
    <ELContext.Provider
      value={{
        messages,
        isShown,
        show: handleShowEL,
        hide: handleHideEL,
        push: handlePush,
      }}
    >
      {children}
    </ELContext.Provider>
  );
};

export function useEl() {
  const ctx = React.useContext(ELContext);

  if (!ctx) throw new Error("useEl have to be used inside ElProvider");

  return ctx;
}
