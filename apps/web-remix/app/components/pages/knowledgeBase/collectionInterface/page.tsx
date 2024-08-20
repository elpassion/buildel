import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import {
  Link,
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
} from '@remix-run/react';

import { CopyCodeButton } from '~/components/actionButtons/CopyCodeButton';
import { CodePreviewWrapper } from '~/components/interfaces/CodePreview/CodePreviewWrapper';
import { DocumentationCTA } from '~/components/interfaces/DocumentationCTA';
import {
  InterfaceSectionHeader,
  InterfaceSectionHeaderParagraph,
  InterfaceSectionHeading,
  InterfaceSectionWrapper,
} from '~/components/interfaces/InterfaceSection';
import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';
import { cn } from '~/utils/cn';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

import type { loader } from './loader.server';

export function KnowledgeBaseCollectionInterface() {
  const { organizationId, collectionName, collectionId, apiUrl } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const matchSearch = useMatch(
    `:organizationId/knowledge-base/:collectionName/interface/search`,
  );
  const isSidebarOpen = !!matchSearch;

  const handleClose = (value?: boolean) => {
    if (value) return;
    navigate(routes.collectionInterface(organizationId, collectionName));
  };

  return (
    <PageContentWrapper>
      <div className="mt-10">
        <div>
          <h2 className="text-lg text-foreground font-bold">HTTP API</h2>
          <p className="text-muted-foreground text-xs mb-6 max-w-lg">
            Access our HTTP API to manage Knowledge Base with capabilities such
            as searching, adding, modifying, and removing documents.
          </p>
        </div>

        <InterfaceSectionWrapper className="mb-8">
          <InterfaceSectionHeader>
            <InterfaceSectionHeading>Search</InterfaceSectionHeading>
            <InterfaceSectionHeaderParagraph>
              Use this endpoint to perform semantic searches.
            </InterfaceSectionHeaderParagraph>
          </InterfaceSectionHeader>

          <div className="p-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="text-foreground text-sm">
              <p className="lg:mt-4 mb-2">
                Ensure you replace the baseURL with our API's URL and include
                your{' '}
                <Link
                  to={routes.organizationSettings(organizationId)}
                  className="font-bold hover:underline"
                  target="_blank"
                >
                  API key
                </Link>{' '}
                as the bearer token in the Authorization header.
              </p>
            </div>
            <div className="w-full">
              <CodePreviewWrapper
                value={`curl "${apiUrl}/api/organizations/${organizationId}/memory_collections/${collectionId}/search?query=your_search_term_here" \\
  -X GET \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer \${BUILDEL_API_KEY}"`}
                language="shell"
                height={105}
              >
                {(value) => <CopyCodeButton value={value} />}
              </CodePreviewWrapper>
            </div>
          </div>
        </InterfaceSectionWrapper>

        <InterfaceSectionWrapper className="mb-8">
          <InterfaceSectionHeader>
            <InterfaceSectionHeading>Insert</InterfaceSectionHeading>
            <InterfaceSectionHeaderParagraph>
              Use this endpoint to add data to your knowledge base.
            </InterfaceSectionHeaderParagraph>
          </InterfaceSectionHeader>

          <div className="p-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="text-foreground text-sm">
              <p className="lg:mt-4 mb-2">
                Ensure you replace the baseURL with our API's URL and include
                your{' '}
                <Link
                  to={routes.organizationSettings(organizationId)}
                  className="font-bold hover:underline"
                  target="_blank"
                >
                  API key
                </Link>{' '}
                as the bearer token in the Authorization header.
              </p>
            </div>
            <div className="w-full">
              <CodePreviewWrapper
                value={`curl "${apiUrl}/api/organizations/${organizationId}/memory_collections/${collectionId}/memories" \\
  -X POST \\
  -H "Authorization: Bearer \${BUILDEL_API_KEY}" \\
  -F "file=@/path/to/your/file" \\
  -F "collection_name=${collectionName}"`}
                language="shell"
                height={120}
              >
                {(value) => <CopyCodeButton value={value} />}
              </CodePreviewWrapper>
            </div>
          </div>
        </InterfaceSectionWrapper>

        <InterfaceSectionWrapper>
          <InterfaceSectionHeader>
            <InterfaceSectionHeading>Delete</InterfaceSectionHeading>
            <InterfaceSectionHeaderParagraph>
              Use this endpoint to delete data from your knowledge base.
            </InterfaceSectionHeaderParagraph>
          </InterfaceSectionHeader>

          <div className="p-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="text-foreground text-sm">
              <p className="lg:mt-4 mb-2">
                Ensure you replace the baseURL with our API's URL and include
                your{' '}
                <Link
                  to={routes.organizationSettings(organizationId)}
                  className="font-bold hover:underline"
                  target="_blank"
                >
                  API key
                </Link>{' '}
                as the bearer token in the Authorization header.
              </p>
            </div>
            <div className="w-full">
              <CodePreviewWrapper
                value={`curl "${apiUrl}/api/organizations/${organizationId}/memory_collections/${collectionId}/memories/:memoryId" \\
  -X DELETE \\
  -H "Authorization: Bearer \${BUILDEL_API_KEY}"`}
                language="shell"
                height={80}
              >
                {(value) => <CopyCodeButton value={value} />}
              </CodePreviewWrapper>
            </div>
          </div>
        </InterfaceSectionWrapper>
      </div>

      <div className="mt-20">
        <DocumentationCTA />
      </div>

      <DialogDrawer open={isSidebarOpen} onOpenChange={handleClose}>
        <DialogDrawerContent
          className={cn({
            'md:min-w-[700px]': matchSearch,
          })}
        >
          <DialogDrawerHeader>
            <DialogDrawerTitle>
              Ask a question to your knowledge base
            </DialogDrawerTitle>

            <DialogDrawerDescription>
              Let's ask your knowledge base some questions so you can see how
              your chatbot will answer and where it'll take it's information
              from.
            </DialogDrawerDescription>
          </DialogDrawerHeader>

          <DialogDrawerBody>
            <Outlet />
          </DialogDrawerBody>
        </DialogDrawerContent>
      </DialogDrawer>
    </PageContentWrapper>
  );
}

export const meta: MetaFunction<typeof loader> = metaWithDefaults(
  ({ data }) => {
    return [
      {
        title: `${data?.collectionName} Interface`,
      },
    ];
  },
);
