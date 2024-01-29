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
import { requireLogin } from "~/session.server";
import invariant from "tiny-invariant";
import { useLoaderData } from "@remix-run/react";
import { PipelineResponse } from "~/components/pages/pipelines/contracts";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");

    const pipeline = await fetch(
      PipelineResponse,
      `/organizations/${params.organizationId}/pipelines/${params.pipelineId}`
    );

    return json({
      pipeline: pipeline.data,
      organizationId: params.organizationId,
      pipelineId: params.pipelineId,
    });
  })(args);
}

export default function WebsiteChat() {
  const { pipelineId, organizationId, pipeline } =
    useLoaderData<typeof loader>();

  const {
    isGenerating,
    connectionStatus,
    pushMessage,
    stopRun,
    startRun,
    messages,
  } = useChat({
    input: pipeline.interfaceConfig?.input ?? "",
    output: pipeline.interfaceConfig?.output ?? "",
    organizationId: organizationId as unknown as number,
    pipelineId: pipelineId as unknown as number,
  });

  useEffect(() => {
    // todo change it
    setTimeout(() => startRun(), 500);

    return () => {
      stopRun();
    };
  }, []);

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <ChatWrapper className="max-w-[820px] h-[500px] !py-4 relative">
        <ChatHeader className="mb-1">
          <div className="flex gap-2 items-center">
            <ChatHeading>Simple Chat</ChatHeading>
            <ChatStatus connectionStatus={connectionStatus} />
          </div>
        </ChatHeader>

        <ChatMessagesWrapper>
          <ChatMessages size="md" messages={messages} />

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
    </div>
  );
}
