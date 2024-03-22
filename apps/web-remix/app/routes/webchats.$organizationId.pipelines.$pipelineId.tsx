import React, { useEffect } from "react";
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

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");

    const pipelineApi = new PipelineApi(fetch);

    const pipeline = await pipelineApi.getPublicPipeline(
      params.organizationId,
      params.pipelineId,
    );

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
  } = useChat({
    input: pipeline.interface_config?.input ?? "",
    output: pipeline.interface_config?.output ?? "",
    chat: pipeline.interface_config?.chat ?? "",
    organizationId: organizationId as unknown as number,
    pipelineId: pipelineId as unknown as number,
    useAuth: !(pipeline.interface_config?.public ?? false),
  });

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
          onSubmit={pushMessage}
          disabled={connectionStatus !== "running"}
          generating={isGenerating}
        />

        <IntroPanel className={classNames({ hidden: !!messages.length })}>
          <p>Ask me anything!</p>
        </IntroPanel>
      </ChatWrapper>
      <div id="_root"></div>
    </div>
  );
}
