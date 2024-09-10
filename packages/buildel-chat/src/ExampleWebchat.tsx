import { useCallback, useEffect } from "react";
import { cn } from "~/utils/cn";
import {
  ChatGeneratingAnimation,
  ChatHeader,
  ChatMessagesWrapper,
  ChatStatus,
  IntroPanel,
  SuggestedMessage,
  SuggestedMessages,
} from "~/components/chat/Chat.components";
import { ChatHeading } from "~/components/chat/ChatHeading";
import type { ChatSize } from "~/components/chat/chat.types";
import { ChatInput } from "~/components/chat/ChatInput";
import { ChatMessages } from "~/components/chat/ChatMessages";
import { ChatWrapper } from "~/components/chat/ChatWrapper";
import { useChat } from "~/components/chat/useChat";

interface PipelinePublic {
  id: number;
  name: string;
  interface_config: {
    webchat: {
      inputs: { name: string; type: string }[];
      outputs: { name: string; type: string }[];
      description: string;
      suggested_messages: string[];
      public: boolean;
    };
  };
}

export interface ExampleWebchatProps {
  pipeline: PipelinePublic;
  pipelineId: string;
  organizationId: string;
  alias?: string;
  metadata?: Record<string, unknown>;
  placeholder?: string;
  onBlockOutput?: (
    blockId: string,
    outputName: string,
    payload: unknown,
  ) => void;
  onBlockStatusChange?: (blockId: string, isWorking: boolean) => void;
  disabled?: boolean;
  size?: ChatSize;
  className?: string;
}

export const ExampleWebchat = ({
  pipeline,
  alias,
  pipelineId,
  organizationId,
  metadata,
  placeholder,
  onBlockStatusChange,
  onBlockOutput,
  disabled,
  size,
  className,
}: ExampleWebchatProps) => {
  const inputs = pipeline.interface_config.webchat.inputs.filter(
    (input) => input.type === "text_input",
  );
  const {
    isGenerating,
    connectionStatus,
    pushMessage,
    stopRun,
    startRun,
    messages,
  } = useChat({
    inputs,
    outputs: pipeline.interface_config.webchat.outputs.filter(
      (output) => output.type === "text_output",
    ),
    organizationId: organizationId as unknown as number,
    pipelineId: pipelineId as unknown as number,
    onBlockStatusChange,
    onBlockOutput,
    socketArgs: {
      useAuth: !(pipeline.interface_config.webchat.public ?? false),
      socketUrl: "http://0.0.0.0:3000/super-api/socket",
    },
  });

  const onSubmit = useCallback(
    (value: string) => {
      pushMessage(value);
    },
    [pushMessage],
  );

  useEffect(() => {
    setTimeout(() => {
      startRun({
        alias,
        initial_inputs: [],
        metadata: {
          ...metadata,
          interface: "webchat",
        },
      });
    }, 500);

    return () => {
      stopRun();
    };
  }, []);

  return (
    <ChatWrapper className={cn(className)}>
      <ChatHeader>
        <ChatHeading>{pipeline.name}</ChatHeading>
        <ChatStatus connectionStatus={connectionStatus} />
      </ChatHeader>

      <ChatMessagesWrapper>
        <ChatMessages messages={messages} size={size}>
          <SuggestedMessages
            size={size}
            hidden={
              !!messages.length ||
              !pipeline.interface_config.webchat.suggested_messages.length
            }
          >
            {pipeline.interface_config.webchat.suggested_messages.map(
              (msg, index) => {
                return (
                  <SuggestedMessage
                    disabled={disabled}
                    key={index}
                    onClick={onSubmit}
                    content={msg}
                    size={size}
                  />
                );
              },
            )}
          </SuggestedMessages>

          <IntroPanel size={size} hidden={!!messages.length}>
            <p>{pipeline.interface_config.webchat.description}</p>
          </IntroPanel>
        </ChatMessages>

        <ChatGeneratingAnimation
          size={size}
          messages={messages}
          isGenerating={isGenerating}
        />
      </ChatMessagesWrapper>

      <div className="px-3">
        <ChatInput
          size={size}
          onSubmit={onSubmit}
          disabled={connectionStatus !== "running" || disabled}
          generating={isGenerating}
          placeholder={placeholder}
          suggestions={inputs.map((input) => input.name)}
        />
      </div>
    </ChatWrapper>
  );
};
