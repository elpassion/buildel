import type { PropsWithChildren } from 'react';
import React, { useMemo } from 'react';

import { ChatMarkdown } from '~/components/chat/ChatMarkdown';
import { ItemList } from '~/components/list/ItemList';
import { ClientOnly } from '~/utils/ClientOnly';
import { cn } from '~/utils/cn';
import { dayjs } from '~/utils/Dayjs';

import type { ChatSize, IMessage, MessageRole } from './chat.types';

interface ChatMessagesProps {
  messages: IMessage[];
  initialMessages?: IMessage[];
  size?: ChatSize;
}

export function ChatMessages({ messages, initialMessages }: ChatMessagesProps) {
  const reversed = useMemo(() => {
    if (!messages.length) return initialMessages ?? [];
    return messages.map((_, idx) => messages[messages.length - 1 - idx]);
  }, [messages, initialMessages]);

  return (
    <ItemList
      className={cn(
        'flex flex-col-reverse gap-2 min-w-full w-full h-[97%] overflow-y-auto pr-1 prose',
      )}
      itemClassName="w-full"
      items={reversed}
      renderItem={(msg) => (
        <>
          <ChatMessage role={msg.role}>
            <ChatMarkdown>{msg.message}</ChatMarkdown>
          </ChatMessage>

          <ClientOnly>
            <MessageTime message={msg} />
          </ClientOnly>
        </>
      )}
    />
  );
}

function MessageTime({ message }: { message: IMessage }) {
  return (
    <span
      className={cn('block w-fit text-[10px] text-muted-foreground mt-[2px]', {
        'ml-auto mr-1': message.role === 'user',
      })}
    >
      {dayjs(message.created_at).format('HH:mm')}
    </span>
  );
}

interface ChatMessageProps {
  role: MessageRole;
}

function ChatMessage({ role, children }: PropsWithChildren<ChatMessageProps>) {
  return (
    <article
      className={cn(
        'bg-white w-full max-w-[60%] min-h-[30px] rounded-t-xl border border-input px-2 py-1.5 prose ',
        {
          'rounded-br-xl': role === 'ai',
          'rounded-bl-xl ml-auto mr-0': role !== 'ai',
        },
      )}
    >
      {children}
    </article>
  );
}
