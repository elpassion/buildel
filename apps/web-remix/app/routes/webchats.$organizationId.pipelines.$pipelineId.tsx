import React, { useCallback, useEffect } from "react";
import { ChatWrapper } from "~/components/chat/ChatWrapper";
import { ChatHeading } from "~/components/chat/ChatHeading";
import { ChatMessages } from "~/components/chat/ChatMessages";
import { ChatInput } from "~/components/chat/ChatInput";
import { useChat } from "~/components/chat/useChat";
import {
  ChatGeneratingAnimation,
  ChatHeader,
  ChatMessagesWrapper,
  ChatStatus,
  IntroPanel,
} from "~/components/chat/Chat.components";
import classNames from "classnames";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { loaderBuilder } from "~/utils.server";
import invariant from "tiny-invariant";
import { useLoaderData } from "@remix-run/react";
import { PipelineApi } from "~/api/pipeline/PipelineApi";
import { UnauthorizedError } from "~/utils/errors";
import { IPipelinePublicResponse } from "~/api/pipeline/pipeline.contracts";
import { ParsedResponse } from "~/utils/fetch.server";
import { useFilesUpload } from "~/components/fileUpload/FileUpload";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");

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
      organizationId: params.organizationId,
      pipelineId: params.pipelineId,
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
    input: pipeline.interface_config?.input ?? "",
    output: pipeline.interface_config?.output ?? "",
    chat: pipeline.interface_config?.chat ?? "",
    organizationId: organizationId as unknown as number,
    pipelineId: pipelineId as unknown as number,
    useAuth: !(pipeline.interface_config?.public ?? false),
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
    runId: runId,
    fileBlockName: pipeline.interface_config?.file,
  });

  const onSubmit = useCallback(
    (value: string) => {
      const files = fileList
        .map((file) =>
          file.status === "done"
            ? { id: file.id, file_name: file.file_name }
            : null,
        )
        .filter((f) => !!f);
      const filesString = files.length
        ? `
\`\`\`buildel_message_attachments
${JSON.stringify(files)}
\`\`\`\n`
        : "";
      pushMessage(`${filesString}${value}`);
      clearFiles();
    },
    [fileList, pushMessage, clearFiles],
  );

  useEffect(() => {
    // todo change it
    setTimeout(() => {
      startRun({ alias, initial_inputs: [] });
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
          disabled={connectionStatus !== "running" || isUploading}
          generating={isGenerating}
          prefix={
            process.env.NODE_ENV === "development" &&
            pipeline.interface_config?.file && (
              <div className="w-full">
                {fileList.map((file) => {
                  return (
                    <div className="text-white px-1" key={file.id}>
                      {file.status} {file.file_name}
                      <button
                        onClick={() => removeFile(file.id)}
                        className="ml-2"
                      >
                        R
                      </button>
                    </div>
                  );
                })}
                <label className="text-white px-1">
                  U
                  <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      [...(e.target.files || [])].forEach((file) => {
                        uploadFile(file);
                      });
                    }}
                  />
                </label>
              </div>
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
