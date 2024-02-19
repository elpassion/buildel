import React from "react";
import { MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { BasicLink } from "~/components/link/BasicLink";
import { routes } from "~/utils/routes.utils";
import {
  IInterfaceConfig,
  IPipeline,
} from "~/components/pages/pipelines/pipeline.types";
import { CodePreviewOptions } from "~/components/pages/pipelines/CodePreview/CodePreviewOptions";
import { ChatbotSectionWrapper } from "./ChatbotSectionWrapper";
import { InterfaceConfigForm } from "./InterfaceConfigForm";
import { loader } from "./loader.server";
import {
  ChatbotSectionHeading,
  ChatbotSectionHeaderParagraph,
  ChatbotSectionHeader,
} from "./ChatbotSectionHeading";

export function WebsiteChatbotPage() {
  const updateFetcher = useFetcher<IPipeline>();
  const [searchParams] = useSearchParams();

  const { organizationId, pipelineId, pageUrl, pipeline, aliasId } =
    useLoaderData<typeof loader>();

  const websiteChatUrl = `${pageUrl}${routes.chatPreview(
    organizationId,
    pipelineId,
    Object.fromEntries(searchParams.entries()),
  )}`;

  const handleUpdate = (interfaceConfig: IInterfaceConfig) => {
    updateFetcher.submit(interfaceConfig, {
      method: "PATCH",
      encType: "application/json",
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-3 mb-6 md:justify-between md:flex-row md:items-center">
        <div>
          <h2 className="text-lg text-white font-medium">Website Chatbot</h2>
          <p className="text-white text-xs">
            Share your Chatbot through url or embed into page.
          </p>
        </div>

        <BasicLink
          to={routes.chatPreview(
            organizationId,
            pipelineId,
            Object.fromEntries(searchParams.entries()),
          )}
          className="px-2 py-1 bg-primary-500 hover:bg-primary-600 rounded-md w-fit"
        >
          Open preview
        </BasicLink>
      </div>

      <ChatbotSectionWrapper className="mb-8">
        <ChatbotSectionHeader>
          <ChatbotSectionHeading>Inputs and outputs</ChatbotSectionHeading>
          <ChatbotSectionHeaderParagraph>
            Select inputs and outputs for chatbot
          </ChatbotSectionHeaderParagraph>
        </ChatbotSectionHeader>

        <div className="p-6 grid grid-cols-1 gap-3 min-h-[174px]">
          <InterfaceConfigForm
            key={aliasId}
            pipeline={pipeline}
            onSubmit={handleUpdate}
          />
        </div>
      </ChatbotSectionWrapper>

      <ChatbotSectionWrapper>
        <ChatbotSectionHeader>
          <ChatbotSectionHeading>Embed in website</ChatbotSectionHeading>
          <ChatbotSectionHeaderParagraph>
            Integrate your Buildel Chat easily on your website.
          </ChatbotSectionHeaderParagraph>
        </ChatbotSectionHeader>

        <div className="p-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="text-white text-sm">
            <p className="lg:mt-4 mb-2">
              Use this code snippet to deploy the form in your application.
            </p>
            <p>
              This snippet allows for a straightforward integration, offering
              your visitors the convenience of engaging with Buildel Chat
              directly on your site.
            </p>
          </div>
          <div className="w-full">
            <CodePreviewOptions
              options={[
                {
                  id: 1,
                  framework: "Html",
                  language: "html",
                  value: `<iframe
  src="${websiteChatUrl}"
  width="600"
  height="600"
  title="chat"
></iframe>`,
                  height: 125,
                },
                {
                  id: 2,
                  framework: "React",
                  language: "html",
                  value: `<iframe
  src="${websiteChatUrl}"
  width="600"
  height="600"
  title="chat"
/>`,
                  height: 125,
                },
              ]}
            />
          </div>
        </div>
      </ChatbotSectionWrapper>

      {/*<iframe src={websiteChatUrl} width="600" height="600" title="chat" />*/}
    </div>
  );
}
export const meta: MetaFunction = () => {
  return [
    {
      title: "Website Chatbot",
    },
  ];
};
