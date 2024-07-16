import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import {
  Link,
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
} from '@remix-run/react';
import classNames from 'classnames';

import { CopyCodeButton } from '~/components/actionButtons/CopyCodeButton';
import { CodePreviewWrapper } from '~/components/interfaces/CodePreview/CodePreviewWrapper';
import { DocumentationCTA } from '~/components/interfaces/DocumentationCTA';
import {
  InterfaceSectionHeader,
  InterfaceSectionHeaderParagraph,
  InterfaceSectionHeading,
  InterfaceSectionWrapper,
} from '~/components/interfaces/InterfaceSection';
import { ActionSidebar } from '~/components/sidebar/ActionSidebar';
import { routes } from '~/utils/routes.utils';

import type { loader } from './loader.server';

export function KnowledgeBaseCollectionInterface() {
  const { organizationId, collectionName, collectionId, apiUrl } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const matchSearch = useMatch(
    routes.collectionInterfaceSearch(organizationId, collectionName),
  );
  const isSidebarOpen = !!matchSearch;

  const handleClose = () => {
    navigate(routes.collectionInterface(organizationId, collectionName));
  };

  return (
    <>
      <div>
        <div>
          <h2 className="text-lg text-white font-medium">HTTP API</h2>
          <p className="text-white text-xs mb-6 max-w-lg">
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
            <div className="text-white text-sm">
              <p className="lg:mt-4 mb-2">
                Ensure you replace the baseURL with our API's URL and include
                your{' '}
                <Link
                  to={routes.organizationSettings(organizationId)}
                  className="text-primary-500 hover:underline"
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
            <div className="text-white text-sm">
              <p className="lg:mt-4 mb-2">
                Ensure you replace the baseURL with our API's URL and include
                your{' '}
                <Link
                  to={routes.organizationSettings(organizationId)}
                  className="text-primary-500 hover:underline"
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
            <div className="text-white text-sm">
              <p className="lg:mt-4 mb-2">
                Ensure you replace the baseURL with our API's URL and include
                your{' '}
                <Link
                  to={routes.organizationSettings(organizationId)}
                  className="text-primary-500 hover:underline"
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

      <ActionSidebar
        className={classNames('!bg-neutral-950 md:w-[550px]')}
        isOpen={isSidebarOpen}
        onClose={handleClose}
        overlay
      >
        <Outlet />
      </ActionSidebar>
    </>
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${data?.collectionName} Interface`,
    },
  ];
};
