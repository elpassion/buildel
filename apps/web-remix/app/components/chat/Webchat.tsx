import React, { useCallback, useEffect, useMemo } from 'react';
import { Trash, Upload } from 'lucide-react';

import type { IPipelinePublicResponse } from '~/api/pipeline/pipeline.contracts';
import {
  ChatGeneratingAnimation,
  ChatHeader,
  ChatMessagesWrapper,
  ChatStatus,
  IntroPanel,
  SuggestedMessage,
  SuggestedMessages,
} from '~/components/chat/Chat.components';
import type { ChatSize } from '~/components/chat/chat.types';
import { ChatHeading } from '~/components/chat/ChatHeading';
import { ChatInput } from '~/components/chat/ChatInput';
import { ChatMessages } from '~/components/chat/ChatMessages';
import { ChatWrapper } from '~/components/chat/ChatWrapper';
import { useChat } from '~/components/chat/useChat';
import { useFilesUpload } from '~/components/fileUpload/FileUpload';
import { cn } from '~/utils/cn';

const SUPPORTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
];
const SUPPORTED_DOCUMENT_TYPES = [
  'application/pdf',
  'text/csv',
  'text/css',
  'text/html',
  'application/json',
  'text/plain',
  'application/xml',
  'text/xml',
  'text/markdown',
];

interface WebchatProps {
  pipeline: IPipelinePublicResponse;
  pipelineId: string;
  organizationId: string;
  alias?: string;
  metadata?: Record<string, unknown>;
  placeholder?: string;
  onBlockOutput?: (
    blockId: string,
    outputName: string,
    payload: unknown,
  ) => void;
  onBlockStatusChange?: (blockId: string, isWorking: boolean) => void;
  disabled?: boolean;
  size?: ChatSize;
  className?: string;
}

export const Webchat = ({
  pipeline,
  alias,
  pipelineId,
  organizationId,
  metadata,
  placeholder,
  onBlockStatusChange,
  onBlockOutput,
  disabled,
  size,
  className,
}: WebchatProps) => {
  const inputs = pipeline.interface_config.webchat.inputs.filter(
    (input) => input.type === 'text_input',
  );
  const {
    isGenerating,
    connectionStatus,
    pushMessage,
    stopRun,
    startRun,
    messages,
    runId,
  } = useChat({
    inputs,
    outputs: pipeline.interface_config.webchat.outputs.filter(
      (output) => output.type === 'text_output',
    ),
    organizationId: organizationId as unknown as number,
    pipelineId: pipelineId as unknown as number,
    useAuth: !(pipeline.interface_config.webchat.public ?? false),
    onBlockStatusChange,
    onBlockOutput,
  });

  const fileInput = useMemo(() => {
    return pipeline.interface_config.webchat.inputs.find((input) => {
      return input.type === 'file_input';
    });
  }, [pipeline.interface_config.webchat]);

  const imageInput = useMemo(() => {
    return pipeline.interface_config.webchat.inputs.find((input) => {
      return input.type === 'image_input';
    });
  }, [pipeline.interface_config.webchat]);

  const supportedTypes = useMemo(() => {
    let types: string[] = [];
    if (fileInput) types = SUPPORTED_DOCUMENT_TYPES;
    if (imageInput) types = [...types, ...SUPPORTED_IMAGE_TYPES];
    return types;
  }, [fileInput, imageInput]);

  const {
    fileList,
    removeFile,
    uploadFile,
    inputRef,
    clearFiles,
    isUploading,
  } = useFilesUpload({
    organizationId: parseInt(organizationId),
    pipelineId: parseInt(pipelineId),
    runId: runId as string,
  });

  const uploadFileToCorrectInput = (file: File) => {
    if (SUPPORTED_IMAGE_TYPES.includes(file.type) && imageInput)
      return uploadFile(file, imageInput.name);
    if (SUPPORTED_DOCUMENT_TYPES.includes(file.type) && fileInput)
      return uploadFile(file, fileInput.name);
  };
  const removeFileFromCorrectInput = (fileId: string | number) => {
    if (imageInput) removeFile(fileId, imageInput.name);
    if (fileInput) removeFile(fileId, fileInput.name);
  };

  const onSubmit = useCallback(
    (value: string) => {
      const files = fileList
        .map((file) =>
          file.status === 'done'
            ? { id: file.id, file_name: file.file_name }
            : null,
        )
        .filter((f) => !!f);
      const filesString = files.length
        ? `
\`\`\`buildel_message_attachments
${JSON.stringify(files)}
\`\`\`\n`
        : '';
      pushMessage(`${filesString}${value}`);
      clearFiles();
    },
    [fileList, pushMessage, clearFiles],
  );

  useEffect(() => {
    // todo change it
    setTimeout(() => {
      startRun({
        alias,
        initial_inputs: [],
        metadata: {
          ...metadata,
          interface: 'webchat',
        },
      });
    }, 500);

    return () => {
      stopRun();
    };
  }, []);

  return (
    <ChatWrapper className={cn('h-full py-3 lg:py-4 relative', className)}>
      <ChatHeader className="mb-4 lg:px-4 lg:py-2">
        <ChatHeading>{pipeline.name}</ChatHeading>
        <ChatStatus connectionStatus={connectionStatus} />
      </ChatHeader>

      <ChatMessagesWrapper className="mx-auto">
        <ChatMessages messages={messages} size={size}>
          <SuggestedMessages
            size={size}
            className={cn('max-w-[820px] mx-auto', {
              hidden:
                !!messages.length ||
                !pipeline.interface_config.webchat.suggested_messages.length,
            })}
          >
            {pipeline.interface_config.webchat.suggested_messages.map(
              (msg, index) => {
                return (
                  <SuggestedMessage
                    disabled={disabled}
                    key={index}
                    onClick={onSubmit}
                    content={msg}
                    size={size}
                  />
                );
              },
            )}
          </SuggestedMessages>

          <IntroPanel
            size={size}
            className={cn('max-w-[820px] mx-auto ', {
              hidden: !!messages.length,
              'mt-10 lg:mt-20': size !== 'sm',
              'mt-6 lg:mt-12': size === 'sm',
            })}
          >
            <p>{pipeline.interface_config.webchat.description}</p>
          </IntroPanel>
        </ChatMessages>

        <ChatGeneratingAnimation
          size={size}
          messages={messages}
          isGenerating={isGenerating}
        />
      </ChatMessagesWrapper>

      <div className="px-3">
        <ChatInput
          size={size}
          className="max-w-[820px] mx-auto"
          onSubmit={onSubmit}
          disabled={connectionStatus !== 'running' || isUploading || disabled}
          generating={isGenerating}
          placeholder={placeholder}
          suggestions={inputs.map((input) => input.name)}
          attachments={
            (!!fileInput || !!imageInput) &&
            fileList.length > 0 && (
              <div className="w-full flex gap-1 px-2 pt-2 pb-1 flex-wrap">
                {fileList.map((file) => {
                  return (
                    <div
                      className={cn(
                        'px-1 border border-input rounded-md flex items-center gap-1 text-sm',
                        {
                          'text-foreground': file.status === 'done',
                          'text-muted-foreground ': file.status !== 'done',
                        },
                      )}
                      key={file.id}
                    >
                      {file.file_name}
                      <button
                        type="button"
                        onClick={() => removeFileFromCorrectInput(file.id)}
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          }
          prefix={
            (!!fileInput || !!imageInput) && (
              <label
                className={cn('cursor-pointer', {
                  'pl-2': size === 'sm',
                  'pl-4': size !== 'sm',
                })}
              >
                <Upload className="w-4 h-4" />
                <input
                  disabled={disabled}
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  accept={supportedTypes.toString()}
                  onChange={(e) => {
                    [...(e.target.files || [])].forEach((file) => {
                      uploadFileToCorrectInput(file);
                    });
                  }}
                />
              </label>
            )
          }
        />
      </div>
    </ChatWrapper>
  );
};
