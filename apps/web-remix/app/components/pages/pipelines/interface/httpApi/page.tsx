import React from "react";
import { routes } from "~/utils/routes.utils";
import { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { CopyCodeButton } from "~/components/actionButtons/CopyCodeButton";
import { CodePreviewWrapper } from "~/components/pages/pipelines/CodePreview/CodePreviewWrapper";
import { CodePreviewOptions } from "~/components/pages/pipelines/CodePreview/CodePreviewOptions";
import {
  PreviewConnector,
  PreviewSection,
  PreviewSectionContent,
  PreviewSectionHeader,
  PreviewSectionHeading,
  PreviewSectionStep,
  PreviewSectionText,
} from "../PreviewSection";
import { loader } from "./loader.server";

export function HTTPApiPage() {
  const { organizationId, pipelineId } = useLoaderData<typeof loader>();
  return (
    <div>
      <h2 className="text-lg text-white font-medium">HTTP Api</h2>
      <p className="text-white text-xs mb-6">
        Access our Buildel API easily with our client SDK.
      </p>

      <PreviewSection>
        <PreviewConnector />
        <PreviewSectionHeader>
          <PreviewSectionStep>1</PreviewSectionStep>

          <PreviewSectionHeading>
            Install Buildel packages
          </PreviewSectionHeading>
        </PreviewSectionHeader>

        <PreviewSectionContent>
          <PreviewSectionText>
            Begin by installing the necessary Buildel packages using npm. This
            initial step equips you with the tools required for seamless
            integration with our API.
          </PreviewSectionText>

          <CodePreviewWrapper
            value={`curl https://buildel-api.fly.dev/api/organizations/${organizationId}/pipelines/${pipelineId}/runs \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer \${BUILDEL_API_KEY}" \\
  -d '{"metadata": {"userId": 123}}'`}
            language="shell"
            height={115}
          >
            {(value) => <CopyCodeButton value={value} />}
          </CodePreviewWrapper>
        </PreviewSectionContent>
      </PreviewSection>

      <PreviewSection>
        <PreviewConnector />
        <PreviewSectionHeader>
          <PreviewSectionStep>2</PreviewSectionStep>

          <PreviewSectionHeading>
            Install Buildel packages
          </PreviewSectionHeading>
        </PreviewSectionHeader>

        <PreviewSectionContent>
          <PreviewSectionText>
            Begin by installing the necessary Buildel packages using npm. This
            initial step equips you with the tools required for seamless
            integration with our API.
          </PreviewSectionText>

          <CodePreviewWrapper
            value={`curl https://buildel-api.fly.dev/api/organizations/${organizationId}/pipelines/${pipelineId}/runs/RUN_ID/start \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer \${BUILDEL_API_KEY}"`}
            language="shell"
            height={95}
          >
            {(value) => <CopyCodeButton value={value} />}
          </CodePreviewWrapper>
        </PreviewSectionContent>
      </PreviewSection>

      <PreviewSection>
        <PreviewConnector />
        <PreviewSectionHeader>
          <PreviewSectionStep>3</PreviewSectionStep>

          <PreviewSectionHeading>
            Install Buildel packages
          </PreviewSectionHeading>
        </PreviewSectionHeader>

        <PreviewSectionContent>
          <PreviewSectionText>
            Begin by installing the necessary Buildel packages using npm. This
            initial step equips you with the tools required for seamless
            integration with our API.
          </PreviewSectionText>

          <CodePreviewWrapper
            value={`curl https://buildel-api.fly.dev/api/organizations/${organizationId}/pipelines/${pipelineId}/runs/RUN_ID/input \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer \${BUILDEL_API_KEY}" \\
  -d '{"block_name": "text_input_1", "input_name": "input", "data": "Content"}'`}
            language="shell"
            height={110}
          >
            {(value) => <CopyCodeButton value={value} />}
          </CodePreviewWrapper>
        </PreviewSectionContent>
      </PreviewSection>

      <PreviewSection>
        <PreviewSectionHeader>
          <PreviewSectionStep>4</PreviewSectionStep>

          <PreviewSectionHeading>
            Install Buildel packages
          </PreviewSectionHeading>
        </PreviewSectionHeader>

        <PreviewSectionContent>
          <PreviewSectionText>
            Begin by installing the necessary Buildel packages using npm. This
            initial step equips you with the tools required for seamless
            integration with our API.
          </PreviewSectionText>

          <CodePreviewWrapper
            value={`curl https://buildel-api.fly.dev/api/organizations/${organizationId}/pipelines/${pipelineId}/runs/RUN_ID/stop \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer \${BUILDEL_API_KEY}"`}
            language="shell"
            height={95}
          >
            {(value) => <CopyCodeButton value={value} />}
          </CodePreviewWrapper>
        </PreviewSectionContent>
      </PreviewSection>
    </div>
  );
}
export const meta: MetaFunction = () => {
  return [
    {
      title: "Client SDK",
    },
  ];
};
