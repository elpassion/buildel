import React, { useCallback, useEffect } from 'react';

import {
  ChatGeneratingAnimation,
  ChatHeader,
  ChatMessagesWrapper,
  ChatStatus,
  IntroPanel,
} from '~/components/chat/Chat.components';
import { ChatHeading } from '~/components/chat/ChatHeading';
import { ChatInput } from '~/components/chat/ChatInput';
import { ChatMessages } from '~/components/chat/ChatMessages';
import { ChatWrapper } from '~/components/chat/ChatWrapper';
import { useChat } from '~/components/chat/useChat';
import { cn } from '~/utils/cn';

interface ELChatProps {
  pipelineId: string | number;
  output: string;
  input: string;
  onBlockOutput?: (
    blockId: string,
    outputName: string,
    payload: unknown,
  ) => void;
  onBlockStatusChange?: (blockId: string, isWorking: boolean) => void;
}

export const ELChat = ({
  pipelineId,
  input,
  output,
  onBlockOutput,
  onBlockStatusChange,
}: ELChatProps) => {
  // @todo org and pipelines id's for now
  const {
    isGenerating,
    connectionStatus,
    pushMessage,
    stopRun,
    startRun,
    messages,
  } = useChat({
    input,
    output,
    organizationId: 13,
    pipelineId: 147,
    onBlockOutput,
    onBlockStatusChange,
  });

  const onSubmit = useCallback(
    (value: string) => {
      pushMessage(value);
    },
    [pushMessage],
  );

  useEffect(() => {
    // todo change it
    setTimeout(() => {
      startRun({
        initial_inputs: [],
        metadata: {
          pipeline_id: pipelineId,
        },
      });
    }, 500);

    return () => {
      stopRun();
    };
  }, []);

  return (
    <ChatWrapper className="max-w-[820px] h-[500px] !py-4 relative">
      <ChatHeader className="mb-1">
        <div className="flex gap-2 items-center">
          <ChatHeading>✨</ChatHeading>
          <ChatStatus connectionStatus={connectionStatus} />
        </div>
      </ChatHeader>

      <ChatMessagesWrapper>
        <ChatMessages messages={messages} />

        <ChatGeneratingAnimation
          messages={messages}
          isGenerating={isGenerating}
        />
      </ChatMessagesWrapper>

      <ChatInput
        onSubmit={onSubmit}
        disabled={connectionStatus !== 'running'}
        generating={isGenerating}
        placeholder="e.g. Create a block that will retrieve current weather in New York..."
      />

      <IntroPanel className={cn('text-center', { hidden: !!messages.length })}>
        <p>
          It's EL here! I'm here to help you with block creation, but feel free
          to ask me anything.
        </p>
      </IntroPanel>
    </ChatWrapper>
  );
};
