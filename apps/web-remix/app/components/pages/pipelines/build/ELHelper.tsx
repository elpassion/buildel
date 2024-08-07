import React, { useEffect } from 'react';
import { Layers2 } from 'lucide-react';

import {
  ChatCloseButton,
  ChatGeneratingAnimation,
  ChatHeader,
  ChatMessagesWrapper,
  ChatStatus,
} from '~/components/chat/Chat.components';
import type { MessageRole } from '~/components/chat/chat.types';
import { ChatHeading } from '~/components/chat/ChatHeading';
import { ChatInput } from '~/components/chat/ChatInput';
import { ChatMessages } from '~/components/chat/ChatMessages';
import { ChatWrapper } from '~/components/chat/ChatWrapper';
import { useChat } from '~/components/chat/useChat';
import { useEl } from '~/components/pages/pipelines/EL/ELProvider';
import { cn } from '~/utils/cn';

const INITIAL_MESSAGES = [
  {
    message:
      "I'm EL, your AI helper here at Buildel. Feel free to ask me anything about creating the perfect workflow for you in the application.",
    role: 'ai' as MessageRole,
    created_at: new Date(),
    id: '2',
  },
  {
    message: '👋 Hi there!',
    role: 'ai' as MessageRole,
    created_at: new Date(),
    id: '1',
  },
];

interface ELHelperProps {
  pipelineId: string;
  organizationId: string;
  onBlockCreate: () => void;
}

export const ELHelper: React.FC<ELHelperProps> = ({
  pipelineId,
  organizationId,
  onBlockCreate,
}) => {
  const { isShown, hide } = useEl();
  const {
    isGenerating,
    connectionStatus,
    pushMessage,
    stopRun,
    startRun,
    messages,
  } = useChat({
    pipelineId: 135,
    organizationId: 13,
    input: 'text_input_1',
    output: 'text_output_1',
    onFinish: onBlockCreate,
  });

  useEffect(() => {
    // todo change it
    setTimeout(
      () =>
        startRun({
          initial_inputs: [
            { name: 'text_input_2:input', value: organizationId },
            { name: 'text_input_3:input', value: pipelineId },
          ],
        }),
      500,
    );

    return () => {
      stopRun();
    };
  }, []);

  return (
    <div
      className={cn('absolute top-8 z-10 right-0 transition md:right-4', {
        'opacity-0 pointer-events-none scale-90': !isShown,
        'opacity-100 pointer-events-auto scale-100': isShown,
      })}
    >
      <ChatWrapper className="!w-[440px]">
        <ChatHeader>
          <div className="flex gap-2 items-center">
            <ChatHeading>
              <Layers2 className="w-4 h-4" />
              <div className="text-white">Ask EL</div>
            </ChatHeading>
            <ChatStatus connectionStatus={connectionStatus} />
          </div>

          <ChatCloseButton onClick={hide} />
        </ChatHeader>

        <ChatMessagesWrapper
          className={cn({
            'h-[300px]': !!messages.length,
            'h-[180px]': !messages.length,
          })}
        >
          <ChatMessages
            messages={messages}
            initialMessages={INITIAL_MESSAGES}
          />

          <ChatGeneratingAnimation
            messages={messages}
            isGenerating={isGenerating}
          />
        </ChatMessagesWrapper>

        <div className="mt-2">
          <ChatInput
            onSubmit={pushMessage}
            disabled={connectionStatus !== 'running'}
            generating={isGenerating}
          />
        </div>
      </ChatWrapper>
    </div>
  );
};
