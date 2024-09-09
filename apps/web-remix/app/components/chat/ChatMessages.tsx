import type { PropsWithChildren } from 'react';
import React, { useMemo, useRef } from 'react';
import { UserRound } from 'lucide-react';
import { ClientOnly } from 'remix-utils/client-only';

import { ChatMarkdown } from '~/components/chat/ChatMarkdown';
import { useTruncatedList } from '~/components/chat/useTruncatedList';
import { ItemList } from '~/components/list/ItemList';
import { cn } from '~/utils/cn';
import { dayjs } from '~/utils/Dayjs';

import type { ChatSize, IMessage } from './chat.types';

interface ChatMessagesProps {
  messages: IMessage[];
  initialMessages?: IMessage[];
  size?: ChatSize;
}

export function ChatMessages({
  messages,
  initialMessages,
  children,
}: PropsWithChildren<ChatMessagesProps>) {
  const reversed = useMemo(() => {
    if (!messages.length) return initialMessages ?? [];
    return messages.map((_, idx) => messages[messages.length - 1 - idx]);
  }, [messages, initialMessages]);

  return (
    <ItemList
      className={cn(
        'flex flex-col-reverse gap-2 min-w-full w-full h-fit max-h-[97%] pr-1 prose overflow-y-auto',
      )}
      itemClassName="w-full pl-3 pr-1"
      items={reversed}
      renderItem={(msg) => {
        const { message, links } = addReferenceToLinks(msg.message);
        return (
          <>
            <ChatMessage message={msg}>
              <ChatMarkdown>{message}</ChatMarkdown>

              <EmbedLinksList links={links} />
            </ChatMessage>

            <div className="pl-12 max-w-[820px] mx-auto">
              <ClientOnly fallback={null}>
                {() => <MessageTime message={msg} />}
              </ClientOnly>
            </div>
          </>
        );
      }}
    >
      {children}
    </ItemList>
  );
}

function MessageTime({ message }: { message: IMessage }) {
  return (
    <span
      className={cn('block w-fit text-[10px] text-muted-foreground mt-[1px]')}
    >
      {dayjs(message.created_at).format('HH:mm')}
    </span>
  );
}

interface ChatMessageProps {
  message: IMessage;
}

function ChatMessage({
  message,
  children,
}: PropsWithChildren<ChatMessageProps>) {
  return (
    <article
      className={cn(
        'w-full max-w-[820px] mx-auto prose text-foreground flex gap-4',
      )}
    >
      <div className="w-8 flex justify-center shrink-0">
        {message.role === 'ai' ? (
          <span className="text-2xl">✨</span>
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-500/60 text-white flex justify-center items-center">
            <UserRound className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <h4 className="mb-0 mt-1">
          {message.role === 'ai' ? message.blockName : 'You'}
        </h4>
        {children}
      </div>
    </article>
  );
}

interface EmbedLinksListProps {
  links: URL[];
}
export function EmbedLinksList({ links }: EmbedLinksListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const { hiddenElements, toggleShowAll, showAll } = useTruncatedList(
    listRef,
    links.length,
  );

  if (links.length === 0) return null;

  return (
    <div className="flex gap-1 w-full">
      <p className="m-0 text-xs mt-1.5 text-muted-foreground shrink-0">
        See more
      </p>
      <ul
        ref={listRef}
        className="grow list-none p-0 flex gap-1 flex-wrap mt-0.5"
      >
        {links.map((link, idx) => (
          <EmbedLink key={idx} link={link} idx={idx} />
        ))}

        {(hiddenElements > 0 || showAll) && (
          <button
            type="button"
            onClick={toggleShowAll}
            className="text-xs bg-transparent hover:text-foreground"
          >
            {showAll ? 'Hide' : `+ ${hiddenElements} more`}
          </button>
        )}
      </ul>
    </div>
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
        <span className="block w-5 text-center bg-secondary px-1 py-0.5 text-muted-foreground break-keep min-w-fit">
          {idx + 1}
        </span>
        <span className="text-blue-500 pr-2 py-0.5 group-hover:underline">
          {link.hostname}
        </span>
      </a>
    </li>
  );
}

const LINK_REGEX = /\[.*?]\((https?:\/\/[^)]+)\)/g;

export function addReferenceToLinks(message: string) {
  let linkIndex = 1;
  const links: URL[] = [];

  const msg = message.replace(LINK_REGEX, (match) => {
    const link = match.match(/\((https?:\/\/[^)]+)\)/)?.[1] ?? '';

    if (!isValidUrl(link)) {
      return match;
    }

    links.push(new URL(link));
    const numberedLink = `${match} <span style="width: 18px; height: 18px; border-radius: 4px; background-color: #f1f1f1; display: inline-flex; justify-content: center; align-items: center; margin-left: 4px; font-size: 12px; color: #61616A; font-weight: 400;">${linkIndex}</span>`;

    linkIndex++;
    return numberedLink;
  });

  return { message: msg, links };
}

function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
