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
                <div className="flex gap-1">
                  <p className="m-0 text-xs mt-1.5 text-muted-foreground shrink-0">
                    See more
                  </p>
                  <ul className="list-none p-0 flex gap-1 flex-wrap mt-0.5">
                    {embedLinks.map((link, idx) => (
                      <EmbedLink key={idx} link={link} idx={idx} />
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

interface EmbedLinkProps {
  link: URL;
  idx: number;
}
function EmbedLink({ link, idx }: EmbedLinkProps) {
  return (
    <li
      key={idx}
      className="m-0 rounded border border-input text-xs p-0 overflow-hidden group"
    >
      <a
        href={link.toString()}
        target="_blank"
        rel="noreferrer"
        className="gap-1 items-center flex no-underline p-0 group-hover:bg-secondary transition"
      >
        <span className="block w-5 text-center bg-secondary px-1 py-0.5 text-muted-foreground">
          {idx + 1}
        </span>
        <span className="text-blue-500 pr-2 py-0.5 group-hover:underline">
          {link.hostname}
        </span>
      </a>
    </li>
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
