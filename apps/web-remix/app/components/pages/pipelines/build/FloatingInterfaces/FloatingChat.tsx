import React from 'react';
import { MessageCircle } from 'lucide-react';

import { IconButton, IconButtonProps } from '~/components/iconButton';
import { BasicLink } from '~/components/link/BasicLink';
import { IInterfaceConfigForm } from '~/components/pages/pipelines/pipeline.types';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { usePipelineId } from '~/hooks/usePipelineId';
import { cn } from '~/utils/cn';
import { routes } from '~/utils/routes.utils';

export interface FloatingChatProps {
  config: IInterfaceConfigForm;
  chatUrl: string;
}

export function FloatingChat({ config, chatUrl }: FloatingChatProps) {
  const isConfigured = config.inputs.length > 0 && config.outputs.length > 0;

  if (!isConfigured) return <ChatErrorMessage />;
  return <ChatIframe chatUrl={chatUrl} />;
}

export function FloatingChatButton({
  disabled,
  className,
  ...props
}: Omit<IconButtonProps, 'icon'>) {
  return (
    <IconButton
      disabled={disabled}
      icon={<MessageCircle />}
      {...props}
      variant="outline"
      size="xxs"
      title="Chat"
      className={cn('rounded', className)}
    />
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
