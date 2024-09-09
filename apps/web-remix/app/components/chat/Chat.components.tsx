import type { PropsWithChildren } from 'react';
import React, { useMemo } from 'react';
import type { BuildelRunStatus } from '@buildel/buildel';

import type { ChatSize, IMessage } from '~/components/chat/chat.types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '~/components/ui/carousel';
import { cn } from '~/utils/cn';

interface ChatHeaderProps {
  className?: string;
}

export const ChatHeader: React.FC<PropsWithChildren<ChatHeaderProps>> = ({
  children,
  className,
}) => {
  return (
    <header
      className={cn('flex justify-between gap-2 items-center px-3', className)}
    >
      {children}
    </header>
  );
};

interface ChatMessagesWrapperProps {
  className?: string;
}

export const ChatMessagesWrapper: React.FC<
  PropsWithChildren<ChatMessagesWrapperProps>
> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'w-full rounded-lg pt-2 grow overflow-hidden relative',
        className,
      )}
    >
      {children}
    </div>
  );
};

interface ChatGeneratingAnimationProps {
  messages: IMessage[];
  isGenerating: boolean;
  size?: ChatSize;
}

export const ChatGeneratingAnimation = ({
  messages,
  isGenerating,
  size,
}: ChatGeneratingAnimationProps) => {
  const renderMessage = () => {
    if (!messages.length) return;
    const lastMessage = messages[messages.length - 1];

    if (
      lastMessage.role === 'user' ||
      (lastMessage.role === 'ai' && !lastMessage.message.length)
    ) {
      return 'Thinking';
    }

    return 'Generating';
  };

  if (!isGenerating) return null;
  return (
    <div className="max-w-[820px] mx-auto ">
      <div
        className={cn('shrink-0', {
          'w-8': size !== 'sm',
          'w-7': size === 'sm',
        })}
      />
      <div className={cn('flex gap-0.5 items-center pl-3 grow')}>
        <span className="text-[10px] text-muted-foreground mr-1">
          {renderMessage()}
        </span>
        <div className="w-1 h-1 rounded-full bg-secondary-400 animate-bounce" />
        <div className="w-1 h-1 rounded-full bg-secondary-800 animate-[bounce_1s_0.5s_ease-in-out_infinite]" />
        <div className="w-1 h-1 rounded-full bg-secondary-600 animate-bounce" />
      </div>
    </div>
  );
};

interface ChatStatusProps {
  connectionStatus: BuildelRunStatus;
  className?: string;
}
export const ChatStatus = ({
  connectionStatus,
  className,
}: ChatStatusProps) => {
  const mappedStatusToText = useMemo(() => {
    switch (connectionStatus) {
      case 'starting':
        return 'Starting';
      case 'running':
        return 'Running';
      default:
        return 'Not running';
    }
  }, [connectionStatus]);

  return (
    <div
      title={mappedStatusToText}
      className={cn('py-0.5 px-1 rounded flex gap-1 items-center', className)}
    >
      <div
        className={cn('w-[6px] h-[6px] rounded-full ', {
          'bg-red-500': connectionStatus === 'idle',
          'bg-green-500': connectionStatus === 'running',
          'bg-orange-500': connectionStatus === 'starting',
        })}
      />

      <span className="text-xs text-muted-foreground">
        {mappedStatusToText}
      </span>
    </div>
  );
};

interface IntroPanelProps {
  className?: string;
  size?: ChatSize;
}

export const IntroPanel = ({
  children,
  className,
  size,
}: PropsWithChildren<IntroPanelProps>) => {
  return (
    <article
      className={cn(
        'w-full max-w-[400px] text-center text-foreground',
        { 'text-xl': size === 'sm', 'text-2xl': size !== 'sm' },
        className,
      )}
    >
      {children}
    </article>
  );
};

export const SuggestedMessages = ({
  children,
  className,
  size,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { size?: ChatSize }) => {
  return (
    <div
      className={cn(
        'flex gap-2 grow w-full pl-3 ',
        { 'h-[120px]': size === 'sm', 'h-[160px]': size !== 'sm' },
        className,
      )}
      {...rest}
    >
      <Carousel className="w-full h-full">
        <CarouselContent>{children}</CarouselContent>
      </Carousel>
    </div>
  );
};

interface SuggestedMessageProps
  extends Omit<
    React.HTMLAttributes<HTMLButtonElement>,
    'children' | 'onClick'
  > {
  onClick: (message: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  content: string;
  disabled?: boolean;
  size?: ChatSize;
}

export const SuggestedMessage = ({
  className,
  content,
  onClick,
  disabled,
  size,
  ...rest
}: SuggestedMessageProps) => {
  return (
    <CarouselItem className="min-w-[110px] basis-[40%] md:basis-[35%] lg:basis-[29%]">
      <button
        disabled={disabled}
        onClick={(e) => onClick(content, e)}
        className={cn(
          'p-2 border border-input rounded-lg inline-flex justify-center items-center text-center text-sm shrink-0 transition w-full',
          {
            'h-[120px]': size === 'sm',
            'h-[160px]': size !== 'sm',
            'cursor-pointer hover:bg-neutral-100': !disabled,
            'opacity-70': disabled,
          },
          className,
        )}
        {...rest}
      >
        <div className="line-clamp-3 w-full" title={content}>
          {content}
        </div>
      </button>
    </CarouselItem>
  );
};
