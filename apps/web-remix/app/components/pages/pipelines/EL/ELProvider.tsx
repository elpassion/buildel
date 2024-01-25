import React, { PropsWithChildren, useEffect, useState } from "react";
import uniqueid from "lodash.uniqueid";
import { useBoolean } from "usehooks-ts";
import cloneDeep from "lodash.clonedeep";
import { BuildelRunStatus } from "@buildel/buildel";
import { usePipelineRun } from "~/components/pages/pipelines/usePipelineRun";
import { errorToast } from "~/components/toasts/errorToast";
import { IMessage, MessageStatusType, MessageType } from "./EL.types";

interface IELContext {
  isGenerating: boolean;
  isShown: boolean;
  show: () => void;
  hide: () => void;
  push: (message: string) => void;
  messages: IMessage[];
  connectionStatus: BuildelRunStatus;
}

const ELContext = React.createContext<IELContext>(undefined!);

export const ELProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const { value: isShown, setTrue: show, setFalse: hide } = useBoolean();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const onBlockOutput = (
    _blockId: string,
    _outputName: string,
    payload: unknown
  ) => {
    setMessages((prev) => {
      const tmpPrev = cloneDeep(prev);
      const lastMessage = tmpPrev[tmpPrev.length - 1];

      if (
        lastMessage &&
        lastMessage.type === "ai" &&
        lastMessage.status === "ongoing"
      ) {
        tmpPrev[tmpPrev.length - 1].message += (
          payload as { message: string }
        ).message;

        return tmpPrev;
      }

      return [
        ...prev,
        {
          id: uniqueid(),
          type: "ai",
          message: (payload as { message: string }).message,
          created_at: new Date(),
          status: "ongoing",
        },
      ];
    });
  };

  const onStatusChange = (blockId: string, isWorking: boolean) => {
    if (isWorking) {
      setIsGenerating(true);
    }
    if (blockId.includes("text_output") && !isWorking) {
      setIsGenerating(false);
    }
  };

  const onError = () => {
    errorToast({ description: "Ups! Something went wrong" });
    setIsGenerating(false);
  };

  const { startRun, stopRun, push, status } = usePipelineRun(
    13,
    135,
    onBlockOutput,
    onStatusChange,
    onError
  );

  const clearMessages = () => {
    setMessages([]);
  };

  const handleShowEL = async () => {
    show();
    if (status === "idle") {
      await startRun();
    }
  };

  const handleHideEL = async () => {
    hide();
    // await stopRun();
    setIsGenerating(false);
    clearMessages();
  };

  const handlePush = (message: string) => {
    if (!message.trim()) return;

    const newMessage = {
      message,
      id: uniqueid(),
      type: "user" as MessageType,
      created_at: new Date(),
      status: "finished" as MessageStatusType,
    };

    const tmpPrev = cloneDeep(messages);
    const lastMessage = tmpPrev[tmpPrev.length - 1];

    if (
      lastMessage &&
      lastMessage.type === "ai" &&
      lastMessage.status === "ongoing"
    ) {
      tmpPrev[tmpPrev.length - 1].status = "finished";
    }

    setMessages([...tmpPrev, newMessage]);

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
        isShown,
        messages,
        isGenerating,
        show: handleShowEL,
        hide: handleHideEL,
        push: handlePush,
        connectionStatus: status,
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
