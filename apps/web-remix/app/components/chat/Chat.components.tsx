import type { PropsWithChildren } from 'react';
import React, { useMemo } from 'react';
import type { BuildelRunStatus } from '@buildel/buildel';
import classNames from 'classnames';
import { X } from 'lucide-react';

import type { IMessage } from '~/components/chat/chat.types';

interface ChatCloseButtonProps {
  onClick: () => void;
}

export const ChatCloseButton: React.FC<ChatCloseButtonProps> = ({
  onClick,
}) => {
  return (
    <button onClick={onClick} className="text-neutral-200 hover:text-white">
      <X className="w-5 h-5" />
    </button>
  );
};

interface ChatHeaderProps {
  className?: string;
}

export const ChatHeader: React.FC<PropsWithChildren<ChatHeaderProps>> = ({
  children,
  className,
}) => {
  return (
    <header
      className={classNames(
        'flex justify-between gap-2 items-center',
        className,
      )}
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
      className={classNames(
        'w-full border border-neutral-800 rounded-lg px-2 py-3 grow overflow-hidden',
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
}

export const ChatGeneratingAnimation = ({
  messages,
  isGenerating,
}: ChatGeneratingAnimationProps) => {
  const renderMessage = () => {
    if (!messages.length) return;
    const lastMessage = messages[messages.length - 1];

    if (
      lastMessage.role === 'user' ||
      (lastMessage.role === 'ai' && !lastMessage.message.length)
    ) {
      return 'Thinking...';
    }

    return 'Generating...';
  };

  if (!isGenerating) return null;
  return (
    <div className="flex gap-0.5 items-center">
      <span className="text-[10px] text-neutral-400 mr-1">
        {renderMessage()}
      </span>
      <div className="w-1 h-1 rounded-full bg-secondary-400 animate-bounce" />
      <div className="w-1 h-1 rounded-full bg-secondary-800 animate-[bounce_1s_0.5s_ease-in-out_infinite]" />
      <div className="w-1 h-1 rounded-full bg-secondary-600 animate-bounce" />
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
      className={classNames(
        'py-0.5 px-1 bg-neutral-800 rounded flex gap-1 items-center',
        className,
      )}
    >
      <div
        className={classNames('w-[6px] h-[6px] rounded-full', {
          'bg-red-500': connectionStatus === 'idle',
          'bg-green-500': connectionStatus === 'running',
          'bg-orange-500': connectionStatus === 'starting',
        })}
      />

      <span className="text-xs text-neutral-400">{mappedStatusToText}</span>
    </div>
  );
};

interface IntroPanelProps {
  className?: string;
}

export const IntroPanel = ({
  children,
  className,
}: PropsWithChildren<IntroPanelProps>) => {
  return (
    <article
      className={classNames(
        'p-4 bg-neutral-900 rounded-xl border border-neutral-800 text-neutral-100 text-sm absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2',
        className,
      )}
    >
      {children}
    </article>
  );
};
