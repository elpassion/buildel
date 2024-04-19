import React from "react";
import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { CopyCodeButton } from "~/components/actionButtons/CopyCodeButton";
import { CodePreviewWrapper } from "~/components/interfaces/CodePreview/CodePreviewWrapper";
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
  const { organizationId, pipelineId, apiUrl } = useLoaderData<typeof loader>();
  return (
    <div>
      <h2 className="text-lg text-white font-medium">HTTP Api</h2>
      <p className="text-white text-xs mb-6">
        Access our Buildel API easily with our HTTP Api.
      </p>

      <PreviewSection>
        <PreviewConnector />
        <PreviewSectionHeader>
          <PreviewSectionStep>1</PreviewSectionStep>

          <PreviewSectionHeading>Create a new run</PreviewSectionHeading>
        </PreviewSectionHeader>

        <PreviewSectionContent>
          <PreviewSectionText>
            To create a new run, send a POST request to the runs endpoint of our
            API. Optionally the request can include additional metadata object,
            which contains any data you will need later inside of the run. By
            default metadata is empty. Also you can specify an alias for the
            run, which will be used. By default alias is 0 ~ latest.
          </PreviewSectionText>

          <CodePreviewWrapper
            value={`curl ${apiUrl}/api/organizations/${organizationId}/pipelines/${pipelineId}/runs \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer \${BUILDEL_API_KEY}" \\
  -d '{"metadata": {"userId": 123}, "alias": 0}'`}
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

          <PreviewSectionHeading>Start the run</PreviewSectionHeading>
        </PreviewSectionHeader>

        <PreviewSectionContent>
          <PreviewSectionText>
            Once the run is created, you can start it by sending a POST request
            to the start endpoint of our API. This will trigger the start of
            run. From this point, the run will be in progress and you can
            interact with it.
          </PreviewSectionText>

          <CodePreviewWrapper
            value={`curl ${apiUrl}/api/organizations/${organizationId}/pipelines/${pipelineId}/runs/RUN_ID/start \\
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

          <PreviewSectionHeading>Input data to the run</PreviewSectionHeading>
        </PreviewSectionHeader>

        <PreviewSectionContent>
          <PreviewSectionText>
            To input data to the run, send a POST request to the input endpoint
            of our API. This will trigger the input of data to the run. You can
            interact with all public inputs of the run. You can input data to
            the run only if it is in progress.
          </PreviewSectionText>

          <CodePreviewWrapper
            value={`curl ${apiUrl}/api/organizations/${organizationId}/pipelines/${pipelineId}/runs/RUN_ID/input \\
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

          <PreviewSectionHeading>Stop the run</PreviewSectionHeading>
        </PreviewSectionHeader>

        <PreviewSectionContent>
          <PreviewSectionText>
            To stop the run, send a POST request to the stop endpoint of our
            API. This will trigger the stop of run. From this point, the run
            will be stopped and you can't interact with it anymore.
          </PreviewSectionText>

          <CodePreviewWrapper
            value={`curl ${apiUrl}/api/organizations/${organizationId}/pipelines/${pipelineId}/runs/RUN_ID/stop \\
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
