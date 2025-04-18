import React, { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
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
import type {
  IKnowledgeBaseFile,
  IKnowledgeBaseFileList,
} from '~/components/pages/knowledgeBase/knowledgeBase.types';
import { LoadMoreButton } from '~/components/pagination/LoadMoreButton';
import { useInfiniteFetch } from '~/components/pagination/useInfiniteFetch';
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
  const { ref: fetchNextRef, inView } = useInView();
  const navigate = useNavigate();

  const { fileList, organizationId, collectionName, pagination } =
    useLoaderData<typeof loader>();

  const { hasNextPage, data, fetchNextPage, isFetchingNextPage } =
    useInfiniteFetch<IKnowledgeBaseFile, typeof loader>({
      pagination,
      initialData: fileList,
      loaderUrl: routes.collectionFiles(organizationId, collectionName),
      dataExtractor: (response) => response.data?.fileList,
    });

  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, isFetchingNextPage, hasNextPage]);

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

  const dialogHeading = useMemo(() => {
    if (matchDetails) return searchParams.get('file_name') ?? '';
    if (matchNew) return 'Create New Memory';
    if (matchSearch) return 'Ask a question to your knowledge base';

    return '';
  }, [matchDetails, matchNew, matchSearch]);

  return (
    <ListActionProvider>
      <PageContentWrapper className="mt-5">
        <div className="flex justify-between gap-2 items-center  mb-4">
          {data.length > 0 ? <SelectAllButton items={data} /> : null}

          <Button asChild className="w-fit ml-auto mr-0 flex">
            <BasicLink
              to={routes.collectionSearch(organizationId, collectionName)}
            >
              Ask a question
            </BasicLink>
          </Button>
        </div>

        <KnowledgeBaseFileList items={data} />

        <div className="flex justify-center mt-5" ref={fetchNextRef}>
          <LoadMoreButton
            isFetching={isFetchingNextPage}
            hasNextPage={hasNextPage}
            onClick={fetchNextPage}
            className="text-xs"
          />
        </div>

        <DialogDrawer open={isSidebarOpen} onOpenChange={handleClose}>
          <DialogDrawerContent
            className={cn({
              'md:min-w-[700px]': matchDetails ?? matchSearch,
              'lg:min-w-[900px]': matchDetails,
            })}
          >
            <DialogDrawerHeader className="w-full line-clamp-1">
              <DialogDrawerTitle className="break-all truncate max-w-[95%]">
                <span title={dialogHeading}>{dialogHeading}</span>
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
