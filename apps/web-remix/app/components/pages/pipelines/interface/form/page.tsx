import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useFetcher, useLoaderData, useSearchParams } from '@remix-run/react';

import { CodePreviewOptions } from '~/components/interfaces/CodePreview/CodePreviewOptions';
import { DocumentationCTA } from '~/components/interfaces/DocumentationCTA';
import {
  InterfaceSectionHeader,
  InterfaceSectionHeaderParagraph,
  InterfaceSectionHeading,
  InterfaceSectionWrapper,
} from '~/components/interfaces/InterfaceSection';
import { BasicLink } from '~/components/link/BasicLink';
import type {
  IInterfaceConfig,
  IPipeline,
} from '~/components/pages/pipelines/pipeline.types';
import { Button } from '~/components/ui/button';
import { routes } from '~/utils/routes.utils';

import { InterfaceConfigForm } from './InterfaceConfigForm';
import type { loader } from './loader.server';

export function FormPage() {
  const updateFetcher = useFetcher<IPipeline>();
  const [searchParams] = useSearchParams();

  const { organizationId, pipelineId, pageUrl, pipeline, aliasId } =
    useLoaderData<typeof loader>();

  const websiteFormUrl = `${pageUrl}${routes.formPreview(
    organizationId,
    pipelineId,
    Object.fromEntries(searchParams.entries()),
  )}`;

  const handleUpdate = (interfaceConfig: IInterfaceConfig) => {
    updateFetcher.submit(interfaceConfig, {
      method: 'PATCH',
      encType: 'application/json',
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-3 mb-6 md:justify-between md:flex-row md:items-center">
        <div>
          <h2 className="text-lg text-foreground font-medium">Form</h2>
          <p className="text-muted-foreground text-xs">
            Share your form through url or embed into page.
          </p>
        </div>

        <Button asChild variant="secondary">
          <BasicLink
            to={routes.formPreview(
              organizationId,
              pipelineId,
              Object.fromEntries(searchParams.entries()),
            )}
            target="_blank"
          >
            Open preview
          </BasicLink>
        </Button>
      </div>

      <InterfaceSectionWrapper className="mb-8">
        <InterfaceSectionHeader>
          <InterfaceSectionHeading>Inputs and outputs</InterfaceSectionHeading>
          <InterfaceSectionHeaderParagraph>
            Select inputs and outputs for chatbot
          </InterfaceSectionHeaderParagraph>
        </InterfaceSectionHeader>

        <div className="p-6 grid grid-cols-1 gap-3 min-h-[174px]">
          <InterfaceConfigForm
            key={aliasId}
            pipeline={pipeline}
            onSubmit={handleUpdate}
          />
        </div>
      </InterfaceSectionWrapper>

      <InterfaceSectionWrapper>
        <InterfaceSectionHeader>
          <InterfaceSectionHeading>Embed in website</InterfaceSectionHeading>
          <InterfaceSectionHeaderParagraph>
            Integrate your Buildel Form easily on your website.
          </InterfaceSectionHeaderParagraph>
        </InterfaceSectionHeader>

        <div className="p-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="text-foreground text-sm">
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
                  framework: 'Html',
                  language: 'html',
                  value: `<iframe
  src="${websiteFormUrl}"
  width="600"
  height="600"
  title="chat"
></iframe>`,
                  height: 125,
                },
                {
                  id: 2,
                  framework: 'React',
                  language: 'html',
                  value: `<iframe
  src="${websiteFormUrl}"
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
      </InterfaceSectionWrapper>

      <div className="mt-20">
        <DocumentationCTA />
      </div>
    </div>
  );
}
export const meta: MetaFunction = () => {
  return [
    {
      title: 'Form',
    },
  ];
};
