import type { PropsWithChildren } from 'react';
import React, { useMemo, useRef } from 'react';
import { Check, Copy, Download, UserRound } from 'lucide-react';
import { ClientOnly } from 'remix-utils/client-only';

import { ChatMarkdown } from '~/components/chat/ChatMarkdown';
import { useTruncatedList } from '~/components/chat/useTruncatedList';
import { IconButton } from '~/components/iconButton';
import { ItemList } from '~/components/list/ItemList';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { useDownloadFile } from '~/hooks/useDownloadFile';
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
  size,
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
          <ChatMessage message={msg} size={size}>
            <ChatMarkdown>{message}</ChatMarkdown>

            <EmbedLinksList links={links} />
          </ChatMessage>
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
  size?: ChatSize;
}

function ChatMessage({
  message,
  size,
  children,
}: PropsWithChildren<ChatMessageProps>) {
  return (
    <article
      className={cn('w-full max-w-[820px] mx-auto prose text-foreground flex', {
        'gap-4': size !== 'sm',
        'gap-2': size === 'sm',
      })}
    >
      <div
        className={cn('flex justify-center shrink-0', {
          'w-8': size !== 'sm',
          'w-7': size === 'sm',
        })}
      >
        {message.role === 'ai' ? (
          <span className="text-2xl">✨</span>
        ) : (
          <div
            className={cn(
              'w-full rounded-full bg-blue-500/60 text-white flex justify-center items-center',
              {
                'h-8': size !== 'sm',
                'h-7': size === 'sm',
              },
            )}
          >
            <UserRound className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <header
          className={cn({
            'mt-1': size !== 'sm',
            'mt-0.5': size === 'sm',
          })}
        >
          <h4 className={cn('my-0 line-clamp-1')} title={message.blockName}>
            {message.role === 'ai' ? message.blockName : 'You'}
          </h4>
        </header>

        {children}

        <ChatMessageFooter message={message} />
      </div>
    </article>
  );
}

interface ChatMessageFooterProps {
  message: IMessage;
}

function ChatMessageFooter({ message }: ChatMessageFooterProps) {
  const { copy, isCopied } = useCopyToClipboard(message.message);
  const download = useDownloadFile(message.message, `${message.blockName}.txt`);

  return (
    <footer className="flex items-center mt-1">
      <ClientOnly fallback={null}>
        {() => <MessageTime message={message} />}
      </ClientOnly>

      <IconButton
        onlyIcon
        size="xxxs"
        type="button"
        title="Copy"
        onClick={copy}
        icon={isCopied ? <Check /> : <Copy />}
        className={cn('h-fit hover:text-foreground ml-1', {
          'text-muted-foreground': !isCopied,
          'text-green-500': isCopied,
        })}
      />

      <IconButton
        onlyIcon
        size="xxxs"
        type="button"
        title="Copy"
        onClick={download}
        icon={<Download />}
        className="text-muted-foreground hover:text-foreground"
      />
    </footer>
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
