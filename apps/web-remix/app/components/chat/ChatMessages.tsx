import type { PropsWithChildren } from 'react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useFetcher } from '@remix-run/react';
import { Check, Copy, Download, UserRound } from 'lucide-react';
import { parseDomain, ParseResultType } from 'parse-domain';
import { ClientOnly } from 'remix-utils/client-only';
import { useBoolean } from 'usehooks-ts';

import {
  addReferenceToLinks,
  ChatMarkdown,
  getFaviconFromDomain,
} from '~/components/chat/ChatMarkdown';
import { useTruncatedList } from '~/components/chat/useTruncatedList';
import { IconButton } from '~/components/iconButton';
import { ItemList } from '~/components/list/ItemList';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { useDownloadFile } from '~/hooks/useDownloadFile';
import type { WebsiteMeta } from '~/routes/fetch-meta';
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
  const listRef = useRef<HTMLUListElement | null>(null);
  const { ref: inViewRef, inView } = useInView({});

  const reversed = useMemo(() => {
    if (!messages.length) return initialMessages ?? [];
    return messages.map((_, idx) => messages[messages.length - 1 - idx]);
  }, [messages, initialMessages]);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      inViewRef(node);
    },
    [inViewRef],
  );

  useEffect(() => {
    if (!inView) return;

    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, inView]);

  const renderItem = useCallback(
    (msg: IMessage) => {
      const { message, links } = addReferenceToLinks(msg.message);
      return (
        <ChatMessage message={msg} size={size}>
          <ChatMarkdown>{message}</ChatMarkdown>

          <EmbedLinksList links={links} />
        </ChatMessage>
      );
    },
    [size],
  );

  return (
    <ItemList
      ref={listRef}
      className={cn(
        'relative flex flex-col-reverse gap-2 min-w-full w-full h-fit max-h-[97%] pr-1 prose overflow-y-auto',
      )}
      itemClassName="w-full pl-3 pr-1"
      items={reversed}
      renderItem={renderItem}
    >
      {children}

      <div
        ref={setRefs}
        className="opacity-0 absolute border-0 left-0 w-10 h-10 shrink-0 bg-white pointer-events-none"
      />
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
          <EmbedLinkItem key={idx} link={link} idx={idx} />
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
function EmbedLinkItem({ link, idx }: EmbedLinkProps) {
  const { value, setValue } = useBoolean(false);
  const { value: alreadyFetched, setValue: setFetched } = useBoolean(false);
  const metaFetcher = useFetcher<WebsiteMeta | null>();

  const onOpenChange = useCallback(
    (open: boolean) => {
      setValue(open);

      if (alreadyFetched) return;
      metaFetcher.load(`/fetch-meta?url=${link.toString()}`);
      setFetched(true);
    },
    [metaFetcher.data, alreadyFetched],
  );

  if (
    alreadyFetched &&
    (!metaFetcher.data?.title || !metaFetcher.data?.description)
  ) {
    return <EmbedLink link={link} idx={idx} />;
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip onOpenChange={onOpenChange} open={value}>
        <TooltipTrigger asChild>
          <EmbedLink link={link} idx={idx} />
        </TooltipTrigger>

        <TooltipContent>
          {metaFetcher.data ? (
            <EmbedLinkTooltipContent data={metaFetcher.data} link={link} />
          ) : null}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function EmbedLinkTooltipContent({
  link,
  data,
}: {
  link: URL;
  data: WebsiteMeta;
}) {
  if (!data.title || !data.description) return null;
  return (
    <div className="text-xs flex flex-col gap-1 max-w-[250px]">
      <div className="flex gap-2 items-center">
        <img
          alt={decodeHtml(data.title)}
          src={getFaviconFromDomain(link)}
          className="w-3.5 h-3.5 object-contain object-center m-0"
        />
        <h4 className="text-foreground line-clamp-1 m-0 font-normal">
          {getDomainName(link)}
        </h4>
      </div>
      <div className="flex flex-col">
        <h5 className="font-bold m-0 text-foreground line-clamp-2">
          {decodeHtml(data.title)}
        </h5>
        <p className="m-0 text-muted-foreground line-clamp-2">
          {decodeHtml(data.description)}
        </p>
      </div>
    </div>
  );
}

function EmbedLink({
  link,
  idx,
  ref,
  ...rest
}: EmbedLinkProps & { ref?: React.Ref<HTMLLIElement> }) {
  return (
    <li
      ref={ref}
      key={idx}
      className="m-0 rounded border border-input text-xs p-0 overflow-hidden group"
      {...rest}
    >
      <a
        href={link.toString()}
        target="_blank"
        rel="noreferrer"
        className="gap-1 items-center flex no-underline p-0 group-hover:bg-white/40 transition"
      >
        <span className="block w-5 text-center bg-white/40 px-1 py-0.5 text-muted-foreground break-keep min-w-fit">
          {idx + 1}
        </span>
        <span className="text-blue-500 pr-2 py-0.5 group-hover:underline">
          {link.hostname}
        </span>
      </a>
    </li>
  );
}

export function getDomainName(url: URL) {
  const result = parseDomain(new URL(url).hostname);

  if (result.type === ParseResultType.Listed) {
    return result.domain;
  } else {
    return url.hostname;
  }
}

function decodeHtml(value: string) {
  const txt = document.createElement('textarea');
  txt.innerHTML = value;
  return txt.value;
}
