import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import {
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import classNames from 'classnames';

import { ActionSidebar } from '~/components/sidebar/ActionSidebar';
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';
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
  const isSidebarOpen = !!matchNew || !!matchSearch;

  const matchDetails = useMatch(
    `:organizationId/knowledge-base/:collectionName/content/:memoryId/chunks`,
  );

  const [searchParams] = useSearchParams();
  const isDetails = !!matchDetails;

  const handleClose = (value?: boolean) => {
    if (value) return;
    navigate(routes.collectionFiles(organizationId, collectionName));
  };

  return (
    <>
      <KnowledgeBaseFileList items={fileList} />

      <DialogDrawer open={isDetails} onOpenChange={handleClose}>
        <DialogDrawerContent className="md:min-w-[700px]">
          <DialogDrawerHeader>
            <DialogDrawerTitle>
              {searchParams.get('file_name')}
            </DialogDrawerTitle>
          </DialogDrawerHeader>
          <DialogDrawerBody>
            <div className="max-h-[70vh] p-2 overflow-auto">
              <Outlet />
            </div>
          </DialogDrawerBody>
        </DialogDrawerContent>
      </DialogDrawer>

      <ActionSidebar
        className={classNames('!bg-neutral-950', {
          'md:w-[550px]': matchSearch,
        })}
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
      title: `${data?.collectionName} database`,
    },
  ];
};
