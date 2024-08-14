import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import {
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { BasicLink } from '~/components/link/BasicLink';
import { Button } from '~/components/ui/button';
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

import { KnowledgeBaseFileList } from './KnowledgeBaseFileList';
import type { loader } from './loader.server';

export function KnowledgeBaseContentPage() {
  const { fileList, organizationId, collectionName } =
    useLoaderData<typeof loader>();

  const navigate = useNavigate();

  const matchNew = useMatch(
    `:organizationId/knowledge-base/:collectionName/content/new`,
  );

  const matchSearch = useMatch(
    `:organizationId/knowledge-base/:collectionName/content/search`,
  );

  const matchDetails = useMatch(
    `:organizationId/knowledge-base/:collectionName/content/:memoryId/chunks`,
  );

  const isSidebarOpen = !!matchNew || !!matchSearch || !!matchDetails;

  const [searchParams] = useSearchParams();

  const handleClose = (value?: boolean) => {
    if (value) return;
    navigate(routes.collectionFiles(organizationId, collectionName), {
      replace: true,
    });
  };

  return (
    <PageContentWrapper className="mt-5">
      <Button asChild className="w-fit ml-auto mr-0 flex mb-4">
        <BasicLink to={routes.collectionSearch(organizationId, collectionName)}>
          Ask a question
        </BasicLink>
      </Button>

      <KnowledgeBaseFileList items={fileList} />

      <DialogDrawer open={isSidebarOpen} onOpenChange={handleClose}>
        <DialogDrawerContent
          className={cn({
            'md:min-w-[700px]': matchDetails ?? matchSearch,
            'lg:min-w-[900px]': matchDetails,
          })}
        >
          <DialogDrawerHeader>
            <DialogDrawerTitle>
              {matchDetails && searchParams.get('file_name')}
              {matchNew && 'Create New File'}
              {matchSearch && 'Ask a question to your knowledge base'}
            </DialogDrawerTitle>

            <DialogDrawerDescription>
              {matchNew && 'Upload files to a Knowledge base.'}
              {matchSearch &&
                "Let's ask your knowledge base some questions so you can see how your chatbot will answer and where it'll take it's information from."}
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
        title: `${data?.collectionName} database`,
      },
    ];
  },
);
