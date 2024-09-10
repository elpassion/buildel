import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useLocalStorage } from 'usehooks-ts';

import { IconButton, IconButtonProps } from '~/components/iconButton';
import { BasicLink } from '~/components/link/BasicLink';
import { IInterfaceConfigForm } from '~/components/pages/pipelines/pipeline.types';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { usePipelineId } from '~/hooks/usePipelineId';
import { cn } from '~/utils/cn';
import { routes } from '~/utils/routes.utils';
import { hashString } from '~/utils/stringHash';

interface FloatingChatProps {
  chatUrl: string;
  webchatConfig: IInterfaceConfigForm;
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

export const FloatingChat = ({
  chatUrl,
  webchatConfig,
  isOpen,
  toggle,
  close,
}: FloatingChatProps) => {
  return (
    <div className="hidden fixed z-[51] top-0 bottom-0 left-0 right-0 pointer-events-none lg:block">
      <FloatingChatButton
        className="absolute bottom-4 right-4 pointer-events-auto"
        onClick={toggle}
      />

      {isOpen && (
        <Chat chatUrl={chatUrl} config={webchatConfig} onClose={close} />
      )}
    </div>
  );
};

function Chat({
  config,
  chatUrl,
  onClose,
}: {
  config: IInterfaceConfigForm;
  chatUrl: string;
  onClose: () => void;
}) {
  const isConfigured = config.inputs.length > 0 && config.outputs.length > 0;

  return (
    <ChatWrapper config={config} onClose={onClose}>
      {isConfigured ? <ChatIframe chatUrl={chatUrl} /> : <ChatErrorMessage />}
    </ChatWrapper>
  );
}

function FloatingChatButton({
  disabled,
  ...props
}: Omit<IconButtonProps, 'icon'>) {
  return (
    <IconButton
      disabled={disabled}
      icon={<MessageCircle />}
      {...props}
      variant="outline"
    />
  );
}

interface ChatWrapperProps {
  onClose: () => void;
  config: IInterfaceConfigForm;
  className?: string;
}

function ChatWrapper({
  children,
  onClose,
  config,
  className,
}: PropsWithChildren<ChatWrapperProps>) {
  const organizationId = useOrganizationId();
  const pipelineId = usePipelineId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [rel, setRel] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useLocalStorage(
    hashString(
      `buildel-${organizationId}-${pipelineId}-chat-position`,
    ).toString(),
    { right: 16, bottom: 16 },
  );

  const isConfigured = config.inputs.length > 0 && config.outputs.length > 0;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.button !== 0) return;

    e.stopPropagation();
    e.preventDefault();

    if (!wrapperRef.current) return;

    const elem = wrapperRef.current.getBoundingClientRect();

    setRel({
      x: e.clientX - elem.left,
      y: e.clientY - elem.top,
    });
    setDragging(true);
  };

  const handleMouseUp = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging) return;

    e.stopPropagation();
    e.preventDefault();

    if (e.target instanceof HTMLElement) {
      if (!wrapperRef.current) return;

      setPosition({
        right:
          window.innerWidth -
          e.clientX -
          (wrapperRef.current.offsetWidth - rel.x),
        bottom:
          window.innerHeight -
          e.clientY -
          (wrapperRef.current.offsetHeight - rel.y),
      });
    }
  };

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  return (
    <div
      ref={wrapperRef}
      style={{ right: `${position.right}px`, bottom: `${position.bottom}px` }}
      className={cn(
        'fixed pointer-events-auto w-fit h-fit min-w-[500px] min-h-[400px] bg-muted rounded-lg flex justify-center items-center border border-input overflow-hidden',
        className,
      )}
    >
      <div className={cn({ 'pointer-events-none': dragging })}>{children}</div>

      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 left-0 ring-0 w-full h-[50px] bg-transparent cursor-grab"
      />

      <IconButton
        icon={<X />}
        onClick={onClose}
        className="absolute top-1 right-1"
        variant="outline"
        size="xxxs"
      />
    </div>
  );
}

function ChatErrorMessage() {
  const organizationId = useOrganizationId();
  const pipelineId = usePipelineId();

  return (
    <p className="text-sm max-w-[400px] text-center">
      You do not have inputs and outputs configured for this pipeline. Check the
      interface configuration{' '}
      <BasicLink
        target="_blank"
        to={routes.pipelineWebsiteChatbot(organizationId, pipelineId)}
        className="font-bold hover:underline"
      >
        here
      </BasicLink>
      .
    </p>
  );
}

function ChatIframe({ chatUrl }: { chatUrl: string }) {
  return (
    <iframe
      src={chatUrl}
      width="600"
      height="500"
      title="chat"
      className="py-1 px-1"
    />
  );
}
