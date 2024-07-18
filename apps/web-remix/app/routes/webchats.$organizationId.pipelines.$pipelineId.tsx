import React, { useCallback, useEffect } from 'react';
import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import classNames from 'classnames';
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
            pipeline.interface_config.webchat.inputs[1] &&
            fileList.length > 0 && (
              <div className="w-full flex gap-1 p-1 flex-wrap">
                {fileList.map((file) => {
                  return (
                    <div
                      className={classNames(
                        'text-white px-1 border rounded-md flex items-center gap-1',
                        {
                          'border-neutral-700': file.status === 'done',
                          'border-neutral-900': file.status !== 'done',
                        },
                      )}
                      key={file.id}
                    >
                      {file.file_name}
                      <button
                        type="button"
                        onClick={() =>
                          removeFile(
                            file.id,
                            pipeline.interface_config.webchat.inputs.filter(
                              (input) => input.type === 'file_input',
                            )[0]?.name ?? '',
                          )
                        }
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
            pipeline.interface_config.webchat.inputs[1] && (
              <label className="text-white pl-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    [...(e.target.files || [])].forEach((file) => {
                      uploadFile(
                        file,
                        pipeline.interface_config.webchat.inputs.filter(
                          (input) => input.type === 'file_input',
                        )[0]?.name ?? '',
                      );
                    });
                  }}
                />
              </label>
            )
          }
        />

        <IntroPanel className={classNames({ hidden: !!messages.length })}>
          <p>Ask me anything!</p>
        </IntroPanel>
      </ChatWrapper>
      <div id="_root"></div>
    </div>
  );
}
