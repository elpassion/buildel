import React, { PropsWithChildren } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useBoolean } from 'usehooks-ts';

import { IconButton, IconButtonProps } from '~/components/iconButton';
import { BasicLink } from '~/components/link/BasicLink';
import { IInterfaceConfigForm } from '~/components/pages/pipelines/pipeline.types';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { usePipelineId } from '~/hooks/usePipelineId';
import { cn } from '~/utils/cn';
import { routes } from '~/utils/routes.utils';

interface FloatingChatProps {
  chatUrl: string;
  webchatConfig: IInterfaceConfigForm;
}

export const FloatingChat = ({ chatUrl, webchatConfig }: FloatingChatProps) => {
  const { value: isOpen, toggle, setFalse: close } = useBoolean(false);

  return (
    <div className="hidden fixed top-0 bottom-0 left-0 right-0 pointer-events-none lg:block">
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
  const { value: isLoading, setFalse: setLoadingFalse } = useBoolean(true);
  const isConfigured = config.inputs.length > 0 && config.outputs.length > 0;

  return (
    <ChatWrapper
      config={config}
      onClose={onClose}
      className={cn({ 'bg-muted': isLoading })}
    >
      {isConfigured ? (
        <iframe
          src={chatUrl}
          width="600"
          height="500"
          title="chat"
          onLoad={setLoadingFalse}
        />
      ) : (
        <ChatErrorMessage />
      )}
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
  const isConfigured = config.inputs.length > 0 && config.outputs.length > 0;
  return (
    <div
      className={cn(
        'absolute bottom-4 right-4 pointer-events-auto min-w-[500px] min-h-[400px] bg-white rounded-lg flex justify-center items-center',
        {
          'border border-input': !isConfigured,
        },
        className,
      )}
    >
      {children}

      <IconButton
        icon={<X />}
        onClick={onClose}
        className="absolute top-2 right-2"
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
  return <iframe src={chatUrl} width="600" height="500" title="chat" />;
}
