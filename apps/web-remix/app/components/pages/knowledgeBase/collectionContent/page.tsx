import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import {
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import type { CheckedState } from '@radix-ui/react-checkbox';

import { CheckboxInput } from '~/components/form/inputs/checkbox.input';
import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { BasicLink } from '~/components/link/BasicLink';
import {
  ListActionProvider,
  useListAction,
} from '~/components/pages/knowledgeBase/components/ListActionProvider';
import type { IKnowledgeBaseFileList } from '~/components/pages/knowledgeBase/knowledgeBase.types';
import { Button } from '~/components/ui/button';
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';
import { Label } from '~/components/ui/label';
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
    navigate(routes.collectionFiles(organizationId, collectionName));
  };

  return (
    <ListActionProvider>
      <PageContentWrapper className="mt-5">
        <div className="flex justify-between gap-2 items-center  mb-4">
          {fileList.length > 0 ? <SelectAllButton items={fileList} /> : null}

          <Button asChild className="w-fit ml-auto mr-0 flex">
            <BasicLink
              to={routes.collectionSearch(organizationId, collectionName)}
            >
              Ask a question
            </BasicLink>
          </Button>
        </div>

        <KnowledgeBaseFileList items={fileList} />

        <DialogDrawer open={isSidebarOpen} onOpenChange={handleClose}>
          <DialogDrawerContent
            className={cn({
              'md:min-w-[700px]': matchDetails ?? matchSearch,
              'lg:min-w-[900px]': matchDetails,
            })}
          >
            <DialogDrawerHeader>
              <DialogDrawerTitle className="break-words">
                {matchDetails && searchParams.get('file_name')}
                {matchNew && 'Create New Memory'}
                {matchSearch && 'Ask a question to your knowledge base'}
              </DialogDrawerTitle>

              <DialogDrawerDescription>
                {matchNew && 'Upload documents to a Knowledge base.'}
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
    </ListActionProvider>
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

interface SelectAllButtonProps {
  items: IKnowledgeBaseFileList;
}
function SelectAllButton({ items }: SelectAllButtonProps) {
  const { selectedItems, setSelected } = useListAction();

  const areAllSelected = items.length === selectedItems.length;

  const selectAll = (checked: CheckedState) => {
    if (checked) {
      setSelected(items.map((item) => item.id.toString()));
    } else {
      setSelected([]);
    }
  };

  return (
    <Button
      variant={areAllSelected ? 'secondary' : 'ghost'}
      size="xs"
      asChild
      className="gap-1"
    >
      <Label>
        <CheckboxInput
          size="sm"
          checked={areAllSelected}
          onCheckedChange={selectAll}
        />
        Select all
      </Label>
    </Button>
  );
}
