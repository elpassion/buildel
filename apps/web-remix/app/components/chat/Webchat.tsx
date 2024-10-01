import React, { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from '@remix-run/react';
import { Headphones, Trash, Upload, X } from 'lucide-react';

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
import type { ChatSize, IMessage } from '~/components/chat/chat.types';
import { isWebchatConfigured } from '~/components/chat/chat.utils';
import { ChatHeading } from '~/components/chat/ChatHeading';
import { ChatInput } from '~/components/chat/ChatInput';
import { ChatMessages } from '~/components/chat/ChatMessages';
import { ChatWrapper } from '~/components/chat/ChatWrapper';
import { useChat } from '~/components/chat/useChat';
import {
  SpeakingRow,
  useVoicechat,
  Voicechat,
} from '~/components/chat/voice/Voicechat';
import { WebchatVoiceModal } from '~/components/chat/WebchatVoiceModal';
import { useFilesUpload } from '~/components/fileUpload/FileUpload';
import { Button } from '~/components/ui/button';
import { cn } from '~/utils/cn';
import { routes } from '~/utils/routes.utils';

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
  isAudioChat?: boolean;
}

export const Webchat = ({
  pipeline,
  alias,
  pipelineId,
  organizationId,
  metadata,
  placeholder,
  onBlockStatusChange,
  onBlockOutput: propsOnBlockOutput,
  disabled,
  size,
  className,
  isAudioChat = false,
}: WebchatProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const inputs = pipeline.interface_config.webchat.inputs.filter(
    (input) => input.type === 'text_input',
  );

  const outputs = pipeline.interface_config.webchat.outputs.filter(
    (output) => output.type === 'text_output',
  );

  const webchatConfigured = isWebchatConfigured(pipeline);

  const onBlockOutput = (
    blockId: string,
    outputName: string,
    payload: unknown,
  ) => {
    propsOnBlockOutput?.(blockId, outputName, payload);

    audioOnBlockOutput(blockId, outputName, payload);
  };

  const {
    isGenerating,
    connectionStatus,
    pushMessage,
    push,
    stopRun,
    startRun,
    messages,
    latestAiMessage,
    runId,
  } = useChat({
    inputs,
    outputs,
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

  const onAudioChunk = (chunk: BlobEvent) => {
    if (!audioInput || isAudioDisabled) return;

    const topic = `${audioInput.name}:input`;
    push(topic, chunk.data);
  };

  const {
    onBlockOutput: audioOnBlockOutput,
    startRecording,
    stopRecording,
    restore,
    discard,
    audioRef,
    dotCanvasRef,
    talkingCanvasRef,
    state: audioState,
    isAudioConfigured,
    audioInput,
  } = useVoicechat({
    pipeline,
    onChunk: onAudioChunk,
    audioEnabled: isAudioChat,
  });

  const isAudioDisabled = !isAudioConfigured || !isAudioChat || disabled;

  useEffect(() => {
    if (isAudioChat && audioRef.current) {
      audioRef.current.autoplay = true;
    }
  }, []);

  const onCloseAudioChat = () => {
    discard();

    navigate(
      routes.chatPreview(organizationId, pipelineId, {
        ...Object.fromEntries(new URLSearchParams(location.search).entries()),
        audio: false,
      }),
    );
  };

  const onOpenAudioChat = () => {
    restore();

    navigate(
      routes.chatPreview(organizationId, pipelineId, {
        ...Object.fromEntries(new URLSearchParams(location.search).entries()),
        audio: true,
      }),
    );
  };

  return (
    <>
      <ChatWrapper className={cn('h-full py-3 lg:py-4 relative', className)}>
        <ChatHeader className="relative z-[5] mb-4 lg:px-4 lg:py-2">
          <ChatHeading>{pipeline.name}</ChatHeading>

          <div className="flex gap-2 items-center">
            <ChatStatus connectionStatus={connectionStatus} />
            {webchatConfigured && isAudioChat ? (
              <Button
                className="p-0 rounded-full h-6"
                size="xs"
                variant="ghost"
                onClick={onCloseAudioChat}
              >
                <X className="w-5 h-5" />
              </Button>
            ) : null}
          </div>
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
                      disabled={disabled || connectionStatus !== 'running'}
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
              disabled={
                connectionStatus !== 'running' || isUploading || disabled
              }
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
            {isAudioConfigured ? (
              <Button
                variant="outline"
                className={cn('p-0 rounded-full shrink-0', {
                  'h-[48px] w-[48px]': size === 'default',
                  'h-[36px] w-[36px]': size === 'sm',
                })}
                onClick={onOpenAudioChat}
              >
                <Headphones
                  className={cn({
                    'w-6 h-6': size === 'default',
                    'w-5 h-5': size === 'sm',
                  })}
                />
              </Button>
            ) : null}
          </div>
        </div>
      </ChatWrapper>

      {isAudioConfigured ? (
        <WebchatVoiceModal isOpen={isAudioChat}>
          <Voicechat
            audioRef={audioRef}
            canvasRef={dotCanvasRef}
            transcription={<VoiceChatTranscription message={latestAiMessage} />}
          >
            <div className="py-4 px-6">
              <SpeakingRow
                disabled={disabled ?? connectionStatus !== 'running'}
                onStop={stopRecording}
                onStart={startRecording}
                canvasRef={talkingCanvasRef}
                status={audioState.status}
              />
            </div>
          </Voicechat>
        </WebchatVoiceModal>
      ) : null}
    </>
  );
};

function VoiceChatTranscription({ message }: { message?: IMessage }) {
  return (
    <div className="max-w-[800px] text-center">
      <p className="text-sm text-muted-foreground">{message?.message}</p>
    </div>
  );
}
