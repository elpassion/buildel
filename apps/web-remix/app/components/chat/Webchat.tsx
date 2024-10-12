import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { OnConnect } from '@buildel/buildel';
import { LoaderCircle, Trash, Upload } from 'lucide-react';

import {
  ChatGeneratingAnimation,
  ChatHeader,
  ChatMessagesWrapper,
  ChatStatus,
  IntroPanel,
  SuggestedMessage,
  SuggestedMessages,
} from '~/components/chat/Chat.components';
import type {
  IMessage,
  WebchatBaseProps,
  WebchatInterface,
  WebchatPipelineConfig,
} from '~/components/chat/chat.types';
import { isAudioConfigured } from '~/components/chat/chat.utils';
import { ChatHeading } from '~/components/chat/ChatHeading';
import { ChatInput } from '~/components/chat/ChatInput';
import { ChatMessages } from '~/components/chat/ChatMessages';
import { ChatWrapper } from '~/components/chat/ChatWrapper';
import { useChat } from '~/components/chat/useChat';
import { Voicechat } from '~/components/chat/voice/Voicechat';
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
  'text/javascript',
  'video/mpeg',
];

interface WebchatProps extends WebchatBaseProps {
  pipelineId: string;
  organizationId: string;
  onBlockOutput?: (
    blockId: string,
    outputName: string,
    payload: unknown,
  ) => void;
  onBlockStatusChange?: (blockId: string, isWorking: boolean) => void;
  onConnect?: OnConnect;
}

export const Webchat = ({
  pipelineId,
  organizationId,
  onBlockStatusChange,
  onBlockOutput: propsOnBlockOutput,
  disabled,
  socketArgs,
  runArgs,
  onConnect,
  ...rest
}: WebchatProps) => {
  const onBlockOutput = (
    blockId: string,
    outputName: string,
    payload: unknown,
  ) => {
    propsOnBlockOutput?.(blockId, outputName, payload);
  };

  const {
    isGenerating,
    connectionStatus,
    pushMessage,
    stopRun,
    startRun,
    joinRun,
    messages,
    latestAiMessage,
    isLoading,
    isError,
    error: chatError,
    pipeline,
  } = useChat({
    organizationId: organizationId as unknown as number,
    pipelineId: pipelineId as unknown as number,
    onBlockStatusChange,
    onBlockOutput,
    onConnect,
    socketArgs,
  });

  useEffect(() => {
    setTimeout(() => {
      const args = {
        alias: runArgs?.alias,
        initial_inputs: [],
        metadata: {
          ...runArgs?.metadata,
          interface: 'webchat',
        },
      };

      if (runArgs?.id) {
        joinRun({
          runId: runArgs.id,
          ...args,
        });
      } else {
        startRun(args);
      }
    }, 500);

    return () => {
      stopRun();
    };
  }, []);

  if (isLoading)
    return <LoaderCircle className="animate-spin ease-in-out duration-300" />;
  if (chatError) return <p className="text-foreground text-sm">{chatError}</p>;
  if (isError || !pipeline)
    return <p className="text-foreground text-sm">Something went wrong</p>;

  return (
    <ChatWrapper className={cn('h-full py-3 lg:py-4 relative', rest.className)}>
      <ChatHeader className="mb-4 lg:px-4 lg:py-2">
        <ChatHeading>{pipeline.name}</ChatHeading>

        <ChatStatus connectionStatus={connectionStatus} />
      </ChatHeader>

      <WebchatContent
        pipeline={pipeline}
        messages={messages}
        onMessage={pushMessage}
        disabled={disabled || connectionStatus !== 'running'}
        isGenerating={isGenerating}
        latestAiMessage={latestAiMessage}
        runArgs={runArgs}
        socketArgs={socketArgs}
        {...rest}
      />
    </ChatWrapper>
  );
};

interface WebchatContentProps extends WebchatBaseProps {
  pipeline: WebchatPipelineConfig;
  messages: IMessage[];
  onMessage: (message: string) => void;
  isGenerating: boolean;
  latestAiMessage?: IMessage;
}

function WebchatContent({
  pipeline,
  messages,
  size,
  onMessage,
  placeholder,
  defaultInterface = 'chat',
  disabled,
  isGenerating,
  latestAiMessage,
  socketArgs,
  ...rest
}: WebchatContentProps) {
  const [view, setView] = useState<WebchatInterface>(() =>
    getDefaultView(defaultInterface, pipeline),
  );

  const openVoiceChat = () => {
    setView('voice');
  };

  const closeVoiceChat = () => {
    setView('chat');
  };

  const isAudioChat = useMemo(() => {
    return view === 'voice';
  }, [view]);

  const textInputs = useMemo(() => {
    return pipeline.interface_config.inputs.filter(
      (input) => input.type === 'text_input',
    );
  }, [pipeline]);

  const fileInput = useMemo(() => {
    return pipeline.interface_config.inputs.find((input) => {
      return input.type === 'file_input';
    });
  }, [pipeline]);

  const imageInput = useMemo(() => {
    return pipeline.interface_config.inputs.find((input) => {
      return input.type === 'image_input';
    });
  }, [pipeline]);

  const suggestions = useMemo(() => {
    return textInputs.map((input) => input.name);
  }, [textInputs]);

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
    organizationId: pipeline.organization_id,
    pipelineId: pipeline.id,
    runId: pipeline.run_id,
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

      onMessage(`${filesString}${value}`);
      clearFiles();
    },
    [fileList, onMessage, clearFiles],
  );

  return (
    <>
      <ChatMessagesWrapper className="mx-auto">
        <ChatMessages messages={messages} size={size}>
          <SuggestedMessages
            size={size}
            className={cn('max-w-[820px] mx-auto', {
              hidden:
                !!messages.length ||
                !(pipeline.interface_config.suggested_messages || []).length,
            })}
          >
            {(pipeline.interface_config.suggested_messages || []).map(
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
            <p>{pipeline.interface_config.description}</p>
          </IntroPanel>
        </ChatMessages>

        <ChatGeneratingAnimation
          size={size}
          messages={messages}
          isGenerating={isGenerating}
        />
      </ChatMessagesWrapper>

      <div>
        <div
          className={cn(
            'max-w-[820px] mx-auto grow grid  justify-center items-center gap-1 px-2',
            {
              'grid-cols-1': !isAudioConfigured,
              'grid-cols-[1fr_min-content]': isAudioConfigured,
            },
          )}
        >
          <ChatInput
            size={size}
            onSubmit={onSubmit}
            disabled={isUploading || disabled}
            generating={isGenerating}
            placeholder={placeholder}
            suggestions={suggestions}
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
                      e.target.value = '';
                    }}
                  />
                </label>
              )
            }
          />
          {isAudioConfigured(pipeline) ? (
            <Voicechat
              isOpen={isAudioChat}
              pipeline={pipeline}
              transcription={latestAiMessage}
              onOpen={openVoiceChat}
              onClose={closeVoiceChat}
              disabled={disabled}
              size={size}
              socketArgs={socketArgs}
              {...rest}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}

function getDefaultView(
  defaultView: WebchatInterface,
  pipeline: WebchatPipelineConfig,
) {
  if (defaultView === 'voice') {
    if (isAudioConfigured(pipeline)) return defaultView;
    return 'chat';
  }

  return defaultView;
}
