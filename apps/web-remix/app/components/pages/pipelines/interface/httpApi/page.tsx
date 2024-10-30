import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { CopyCodeButton } from '~/components/actionButtons/CopyCodeButton';
import { CodePreviewWrapper } from '~/components/interfaces/CodePreview/CodePreviewWrapper';
import { DocumentationCTA } from '~/components/interfaces/DocumentationCTA';
import { metaWithDefaults } from '~/utils/metadata';

import {
  PreviewConnector,
  PreviewSection,
  PreviewSectionContent,
  PreviewSectionContentTip,
  PreviewSectionContentWrapper,
  PreviewSectionHeader,
  PreviewSectionHeading,
  PreviewSectionStep,
  PreviewSectionText,
} from '../PreviewSection';
import type { loader } from './loader.server';

export function HTTPApiPage() {
  const { organizationId, pipelineId, apiUrl } = useLoaderData<typeof loader>();
  return (
    <div>
      <h2 className="text-lg text-foreground font-medium">HTTP Api</h2>
      <p className="text-muted-foreground text-xs mb-6">
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

          {/*<PreviewSectionContentTip>*/}
          {/*  Use can access metadata inside of the block by using the{' '}*/}
          {/*  <span className="font-medium">*/}
          {/*      {'{{metadata.YOUR_METADATA_KEY}}'}*/}
          {/*    </span>{' '}*/}
          {/*  syntax.*/}
          {/*</PreviewSectionContentTip>*/}

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
          <PreviewSectionStep>2.5</PreviewSectionStep>

          <PreviewSectionHeading>
            Start the run and wait for outputs
          </PreviewSectionHeading>
        </PreviewSectionHeader>

        <PreviewSectionContent>
          <PreviewSectionContentWrapper>
            <PreviewSectionText className="pl-0">
              You can optionally wait for the outputs of the run by specifying
              the blocks you want to wait for. This will make the API call wait
              until the specified outputs return a value. <br /> <br />
              You can also pass initial inputs to the run. It's useful when you
              want to pass some data to the blocks immediately after the run
              starts.
            </PreviewSectionText>

            <PreviewSectionContentTip>
              In some scenarios you do not need to input data to the run by
              sending separate request (point 3). Passing initial inputs to the
              run will automatically input the data. Combining this with
              wait_for_outputs will make the Start API call wait for the outputs
              and return the result of the run.
            </PreviewSectionContentTip>
          </PreviewSectionContentWrapper>

          <CodePreviewWrapper
            value={`curl ${apiUrl}/api/organizations/${organizationId}/pipelines/${pipelineId}/runs/RUN_ID/start \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer \${BUILDEL_API_KEY}"
  -d '{
    "wait_for_outputs": [
      { "block_name": "BLOCK_NAME (e.g. text_output_1)", "output_name": "output" }
    ],
    "initial_inputs": [
      { "block_name": "BLOCK_NAME (e.g. text_input_1)", "input_name": "input", "data": YOUR_DATA }
    ]
  }'`}
            language="shell"
            height={235}
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

      <div className="mt-20">
        <DocumentationCTA />
      </div>
    </div>
  );
}
export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'HTTP Api',
    },
  ];
});
