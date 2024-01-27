import React from "react";
import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader";
import { BasicLink } from "~/components/link/BasicLink";
import { routes } from "~/utils/routes.utils";
import { CodePreviewOptions } from "~/components/pages/pipelines/CodePreview/CodePreviewOptions";

export function WebsiteChatbotPage() {
  const { organizationId, pipelineId } = useLoaderData<typeof loader>();
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg text-white font-medium">Website Chatbot</h2>
          <p className="text-white text-xs">
            Share your Chatbot through url or embed into page.
          </p>
        </div>

        <BasicLink
          to={routes.chatPreview()}
          className="px-2 py-1 bg-primary-500 hover:bg-primary-600 rounded-md"
        >
          Open preview
        </BasicLink>
      </div>

      <article className="bg-transparent border border-neutral-800 rounded-xl">
        <header className="w-full bg-neutral-900 px-6 py-4 rounded-t-xl">
          <h3 className="text-white text-sm">Embed in website</h3>
          <p className="text-neutral-100 text-xs">
            Integrate your Buildel Chat easily on your website.
          </p>
        </header>

        <div className="p-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="text-white text-sm">
            <p className="lg:mt-4 mb-2">
              Use this code snippet to deploy the form in your application.
            </p>
            <p>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took.
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
  src="http://localhost:3000/demo-chat"
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
  src="http://localhost:3000/demo-chat"
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
      </article>

      <iframe
        src="http://localhost:3000/demo-chat"
        width="552"
        height="600"
        title="chat"
      />
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
