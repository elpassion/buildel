import React, { useCallback, useEffect, useMemo } from 'react';
import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Trash, Upload } from 'lucide-react';
import invariant from 'tiny-invariant';

import type { IPipelinePublicResponse } from '~/api/pipeline/pipeline.contracts';
import { PipelineApi } from '~/api/pipeline/PipelineApi';
import {
  ChatGeneratingAnimation,
  ChatHeader,
  ChatMessagesWrapper,
  ChatStatus,
  IntroPanel,
} from '~/components/chat/Chat.components';
import { ChatHeading } from '~/components/chat/ChatHeading';
import { ChatInput } from '~/components/chat/ChatInput';
import { ChatMessages } from '~/components/chat/ChatMessages';
import { ChatWrapper } from '~/components/chat/ChatWrapper';
import { useChat } from '~/components/chat/useChat';
import { useFilesUpload } from '~/components/fileUpload/FileUpload';
import { loaderBuilder } from '~/utils.server';
import { cn } from '~/utils/cn';
import { UnauthorizedError } from '~/utils/errors';
import type { ParsedResponse } from '~/utils/fetch.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.pipelineId, 'pipelineId not found');

    const pipelineApi = new PipelineApi(fetch);

    let pipeline: ParsedResponse<IPipelinePublicResponse> | void =
      await pipelineApi
        .getPipeline(params.organizationId, params.pipelineId)
        .catch((e) => {
          if (e instanceof UnauthorizedError) return;
          throw e;
        });
    if (!pipeline) {
      pipeline = await pipelineApi.getPublicPipeline(
        params.organizationId,
        params.pipelineId,
      );
    }

    const alias = pipelineApi.getAliasFromUrl(request.url);

    return json({
      pipeline: pipeline.data,
      organizationId: params.organizationId as string,
      pipelineId: params.pipelineId as string,
      alias,
    });
  })(args);
}

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

export default function WebsiteChat() {
  const { pipelineId, organizationId, pipeline, alias } =
    useLoaderData<typeof loader>();
  const {
    isGenerating,
    connectionStatus,
    pushMessage,
    stopRun,
    startRun,
    messages,
    runId,
  } = useChat({
    input:
      pipeline.interface_config.webchat.inputs.filter(
        (input) => input.type === 'text_input',
      )[0]?.name ?? '',
    output:
      pipeline.interface_config.webchat.outputs.filter(
        (output) => output.type === 'text_output',
      )[0]?.name ?? '',
    organizationId: organizationId as unknown as number,
    pipelineId: pipelineId as unknown as number,
    useAuth: !(pipeline.interface_config.webchat.public ?? false),
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
          interface: 'webchat',
        },
      });
    }, 500);

    return () => {
      stopRun();
    };
  }, []);

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <ChatWrapper className="max-w-[820px] h-[500px] !py-4 relative">
        <ChatHeader className="mb-1">
          <div className="flex gap-2 items-center">
            <ChatHeading>{pipeline.name}</ChatHeading>
            <ChatStatus connectionStatus={connectionStatus} />
          </div>
        </ChatHeader>

        <ChatMessagesWrapper>
          <ChatMessages messages={messages} />

          <ChatGeneratingAnimation
            messages={messages}
            isGenerating={isGenerating}
          />
        </ChatMessagesWrapper>

        <ChatInput
          onSubmit={onSubmit}
          disabled={connectionStatus !== 'running' || isUploading}
          generating={isGenerating}
          attachments={
            (!!fileInput || !!imageInput) &&
            fileList.length > 0 && (
              <div className="w-full flex gap-1 p-1 flex-wrap">
                {fileList.map((file) => {
                  return (
                    <div
                      className={cn(
                        'px-1 border border-input rounded-md flex items-center gap-1',
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
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          }
          prefix={
            (!!fileInput || !!imageInput) && (
              <label className="pl-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <input
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

        <IntroPanel className={cn({ hidden: !!messages.length })}>
          <p>{pipeline.interface_config.webchat.description}</p>
        </IntroPanel>
      </ChatWrapper>
      <div id="_root"></div>
    </div>
  );
}
