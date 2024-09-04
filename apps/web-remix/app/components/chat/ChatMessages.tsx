import type { PropsWithChildren } from 'react';
import React, { useMemo } from 'react';
import { ClientOnly } from 'remix-utils/client-only';

import { ChatMarkdown } from '~/components/chat/ChatMarkdown';
import { ItemList } from '~/components/list/ItemList';
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
      renderItem={(msg) => {
        const embedLinks = matchLinks(msg.message);

        return (
          <>
            <ChatMessage role={msg.role}>
              <ChatMarkdown>{msg.message}</ChatMarkdown>

              {embedLinks.length > 0 ? (
                <div>
                  <p className="m-0 text-xs mt-1 text-muted-foreground">
                    See more
                  </p>
                  <ul className="list-none p-0 flex gap-1 flex-wrap mt-0.5">
                    {embedLinks.map((link, id) => (
                      <li
                        key={id}
                        className="m-0 bg-secondary rounded border border-input text-xs px-1 py-0.5"
                      >
                        <a
                          href={link.toString()}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {link.hostname}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </ChatMessage>

            <ClientOnly fallback={null}>
              {() => <MessageTime message={msg} />}
            </ClientOnly>
          </>
        );
      }}
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

function matchLinks(message: string) {
  const regex = /\[.*?]\((https?:\/\/[^)]+)\)/g;

  return (
    message
      .match(regex)
      ?.map((match) => match.match(/\((https?:\/\/[^)]+)\)/)?.[1] ?? '') ?? []
  )
    .filter(isValidUrl)
    .map((url) => new URL(url));
}

function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
