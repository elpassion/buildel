import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import {
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import { Modal } from '@elpassion/taco/Modal';
import classNames from 'classnames';

import { ActionSidebar } from '~/components/sidebar/ActionSidebar';
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

  const handleClose = () => {
    navigate(routes.collectionFiles(organizationId, collectionName));
  };

  return (
    <>
      <KnowledgeBaseFileList items={fileList} />

      <Modal
        isOpen={isDetails}
        header={
          <h3 className="text-white font-medium text-xl">
            {searchParams.get('file_name')}
          </h3>
        }
        closeButtonProps={{ iconName: 'x', 'aria-label': 'Close' }}
        onClose={handleClose}
        className="w-full max-w-3xl"
      >
        <div className="max-h-[70vh] p-2">
          <Outlet />
        </div>
      </Modal>

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
