import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import {
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';

import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';
import { cn } from '~/utils/cn';
import { routes } from '~/utils/routes.utils';

import { KnowledgeBaseFileList } from './KnowledgeBaseFileList';
import type { loader } from './loader.server';

export function KnowledgeBaseContentPage() {
  const { fileList, organizationId, collectionName } =
    useLoaderData<typeof loader>();

  const navigate = useNavigate();

  const matchNew = useMatch(
    routes.collectionFilesNew(organizationId, collectionName),
  );
  const matchSearch = useMatch(
    routes.collectionSearch(organizationId, collectionName),
  );
  const matchDetails = useMatch(
    `:organizationId/knowledge-base/:collectionName/content/:memoryId/chunks`,
  );

  const isSidebarOpen = !!matchNew || !!matchSearch || !!matchDetails;

  const [searchParams] = useSearchParams();

  const handleClose = (value?: boolean) => {
    if (value) return;
    navigate(routes.collectionFiles(organizationId, collectionName));
  };

  return (
    <div className="mt-5">
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
    </div>
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${data?.collectionName} database`,
    },
  ];
};
