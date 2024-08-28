import React, {
  DragEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLoaderData } from '@remix-run/react';
import { useReactFlow } from '@xyflow/react';
import { ChevronUp, Pin, X } from 'lucide-react';
import { useBoolean, useDebounce, useEventListener } from 'usehooks-ts';
import { z } from 'zod';

import { BlockType } from '~/api/blockType/blockType.contracts';
import { TextInput } from '~/components/form/inputs/text.input';
import { IconButton } from '~/components/iconButton';
import { EmptyMessage, ItemList } from '~/components/list/ItemList';
import { useBuilderSidebar } from '~/components/pages/pipelines/build/BuilderSidebar/BuilderSidebar.context';
import {
  IBlockConfig,
  IBlockType,
  IBlockTypes,
} from '~/components/pages/pipelines/pipeline.types';
import { useRunPipeline } from '~/components/pages/pipelines/RunPipelineProvider';
import { Button } from '~/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { useBreakpoints } from '~/hooks/useBreakpoints';
import { cn } from '~/utils/cn';
import { buildDocsUrl } from '~/utils/docs';
import { getRandomNumber } from '~/utils/numbers';

import { loader } from '../loader.server';
import {
  BlocksSearchContext,
  useBlocksSearch,
} from './BuilderSidebarBlocks.context';

interface BuilderSidebarBlocksProps {
  onCreate: (created: IBlockConfig) => Promise<unknown>;
}

export const BuilderSidebarBlocks = ({
  onCreate,
}: BuilderSidebarBlocksProps) => {
  const { blockTypes } = useLoaderData<typeof loader>();

  return (
    <BlockSearch>
      <BlockGroupList blocks={blockTypes} onCreate={onCreate} />
    </BlockSearch>
  );
};

interface BlockSearchProps {
  children: React.ReactNode;
}

function BlockSearch({ children }: BlockSearchProps) {
  const [search, setSearch] = useState('');
  const debounceSearch = useDebounce(search, 500);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const onClear = () => {
    setSearch('');
  };

  return (
    <BlocksSearchContext.Provider value={{ searchValue: debounceSearch }}>
      <div className="flex gap-1 items-center pl-2">
        <SearchInput value={search} onChange={onChange} onClear={onClear} />

        <PinButton />
      </div>

      {children}
    </BlocksSearchContext.Provider>
  );
}

interface BlockGroupListProps {
  blocks: IBlockTypes;
  onCreate: (created: IBlockConfig) => Promise<unknown>;
}

function BlockGroupList({ blocks, onCreate }: BlockGroupListProps) {
  const { searchValue } = useBlocksSearch();
  const blockGroups = useMemo(
    () =>
      blocks.reduce(
        (groups, blockType) => {
          blockType.groups.forEach((group) => {
            if (!groups[group]) {
              groups[group] = [] as IBlockTypes;
            }
            groups[group].push(blockType as IBlockType);
          });

          return groups;
        },
        {} as Record<string, IBlockTypes>,
      ),
    [blocks],
  );

  if (searchValue)
    return (
      <div className="flex flex-col gap-1 px-2 mt-2">
        {blocks
          .filter((block) =>
            block.type
              .replaceAll('_', ' ')
              .toLowerCase()
              .includes(searchValue.toLowerCase()),
          )
          .map((block) => (
            <BlockItem
              data={{ id: block.type, block }}
              group={block.groups.at(0)!}
              onCreate={onCreate}
            />
          ))}
      </div>
    );

  return (
    <ItemList
      emptyText={
        <EmptyMessage className="text-center block">
          No blocks found!
        </EmptyMessage>
      }
      className="px-2 mt-2 flex flex-col gap-1 overflow-y-auto max-h-[calc(100%-54px)]"
      items={Object.entries(blockGroups).map(([group, blocks]) => ({
        id: group,
        blocks,
      }))}
      renderItem={(item) => <BlockGroupItem data={item} onCreate={onCreate} />}
    />
  );
}

interface BlockGroupItemProps {
  data: { id: string; blocks: IBlockTypes };
  onCreate: (created: IBlockConfig) => Promise<unknown>;
}

function BlockGroupItem({ data, onCreate }: BlockGroupItemProps) {
  const { searchValue } = useBlocksSearch();
  const { value: isCollapsed, toggle } = useBoolean(false);

  const filteredBlocks = useMemo(() => {
    return data.blocks.filter((block) =>
      block.type
        .replace('_', ' ')
        .toLowerCase()
        .includes(searchValue.toLowerCase()),
    );
  }, [data.blocks, searchValue]);

  return (
    <div className="border border-input rounded-md flex flex-col gap-1 overflow-hidden">
      <Button
        isFluid
        size="xxs"
        variant="ghost"
        className="text-muted-foreground font-semibold justify-start gap-1 h-10 rounded-none text-xs"
        onClick={toggle}
      >
        <ChevronUp className={cn('w-4 h-4', { 'rotate-180': isCollapsed })} />
        {data.id}
      </Button>

      <ItemList
        emptyText={
          <EmptyMessage className="text-xs px-2">No blocks found</EmptyMessage>
        }
        className={cn('grid grid-cols-2 gap-2 px-1.5 pb-1.5', {
          hidden: isCollapsed,
        })}
        items={filteredBlocks.map((block) => ({ id: block.type, block }))}
        renderItem={(item) => (
          <BlockItem data={item} group={data.id} onCreate={onCreate} />
        )}
        aria-expanded={!isCollapsed}
        aria-hidden={isCollapsed}
      />
    </div>
  );
}

interface BlockItemProps {
  group: string;
  data: { block: IBlockType; id: string };
  onCreate: (created: IBlockConfig) => Promise<unknown>;
}
function BlockItem({ data, group, onCreate }: BlockItemProps) {
  const [urlSrc, setUrlSrc] = useState(resolveIconPath(group));
  const reactFlowInstance = useReactFlow();
  const { status: runStatus } = useRunPipeline();
  const onDragStart = (
    event: DragEvent<HTMLDivElement>,
    block: z.TypeOf<typeof BlockType>,
  ) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(block));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onClickAdd = useCallback(() => {
    const { block } = data;

    const wrapper = document.querySelector<HTMLDivElement>(
      '#react-flow-wrapper',
    );

    const rect = wrapper?.getBoundingClientRect();
    const { x, y } = reactFlowInstance.getViewport();

    const centerX = rect ? rect.left + rect.width / 2 : x / 2;
    const centerY = rect ? rect.top + rect.height / 2 : y / 2;

    const position = reactFlowInstance.screenToFlowPosition({
      x: centerX * getRandomNumber(0.9, 1.1),
      y: centerY * getRandomNumber(0.9, 1.1),
    });

    onCreate({
      name: '',
      opts: {},
      inputs: [],
      type: block.type,
      block_type: block,
      position: position,
      connections: [],
    });
  }, [onCreate, reactFlowInstance]);

  const onImageError = () => {
    setUrlSrc(resolveIconPath('default'));
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            key={data.block.type}
            draggable={runStatus === 'idle'}
            onDragStart={(event) => {
              onDragStart(event, data.block);
            }}
            id="draggable-block-item"
            className="w-full border border-input rounded-md p-2 flex gap-2 items-center hover:bg-muted cursor-pointer"
            onClick={onClickAdd}
          >
            <img
              className="w-3.5 h-3.5 shrink-0"
              src={urlSrc}
              alt={data.block.type}
              onError={onImageError}
            />
            <h3 className="text-xs truncate text-foreground">
              {data.block.type}
            </h3>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[200px] text-sm">
          <p className="mb-1 font-semibold">{data.block.type}</p>
          <span>{data.block.description}</span>

          <Button
            variant="secondary"
            size="xxs"
            isFluid
            className="mt-3 justify-start"
            asChild
          >
            <a
              href={buildDocsUrl(data.block.type)}
              target="_blank"
              rel="noreferrer"
            >
              View Docs
            </a>
          </Button>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}
function SearchInput({ value, onClear, onChange }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEventListener('keydown', (e) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    if (
      e.target instanceof HTMLElement &&
      e.target.classList.contains('tiptap')
    ) {
      return;
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      inputRef.current?.focus();
      console.log('SEARCH');
    }
  });

  return (
    <div className="relative grow">
      <TextInput
        placeholder="Search for blocks (ctrl/cmd + k)"
        value={value}
        onChange={onChange}
        size="sm"
        className="pr-8"
        ref={inputRef}
      />
      <IconButton
        type="button"
        icon={<X />}
        variant="ghost"
        size="xxs"
        onClick={onClear}
        className={cn('absolute z-[12] top-1/2 -translate-y-1/2 right-1', {
          hidden: !value,
          flex: !!value,
        })}
      />
    </div>
  );
}

function PinButton() {
  const { state, isOpen, onPinClick, onClose } = useBuilderSidebar();
  const { isDesktop } = useBreakpoints();

  if (!isDesktop) {
    return (
      <IconButton
        icon={<X />}
        size="sm"
        variant="secondary"
        onClick={onClose}
        title="Close"
        aria-label="Close"
      />
    );
  }

  return (
    <IconButton
      icon={<Pin />}
      size="sm"
      variant="ghost"
      onClick={onPinClick}
      title="Auto close"
      aria-label="Auto close"
      data-checked={isOpen}
      className={cn({ '!text-blue-500': state === 'keepOpen' })}
    />
  );
}

function resolveIconPath(type: string) {
  return `/block-types/${type.replace('/', '-')}.svg`;
}
