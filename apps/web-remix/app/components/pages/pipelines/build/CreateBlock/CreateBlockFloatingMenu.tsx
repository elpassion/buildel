import React, { useMemo } from 'react';
import { useLoaderData } from '@remix-run/react';
import startCase from 'lodash.startcase';
import { ClientOnly } from 'remix-utils/client-only';

import { MenuClient } from '~/components/menu/Menu.client';
import type {
  IBlockConfig,
  IBlockType,
  IBlockTypes,
} from '~/components/pages/pipelines/pipeline.types';

import type { loader } from '../loader.server';
import { CreateBlockDraggableItem } from './CreateBlockDraggableItem';
import { GroupSubMenu } from './GroupSubMenu';

interface CreateBlockFloatingMenuProps {
  onCreate: (node: IBlockConfig) => void;
}

export const CreateBlockFloatingMenu: React.FC<
  CreateBlockFloatingMenuProps
> = ({ onCreate }) => {
  const { blockTypes } = useLoaderData<typeof loader>();

  const blockGroups = useMemo(
    () =>
      blockTypes.reduce(
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
    [blockTypes],
  );

  const SubMenuItems = ({ group }: { group: string }) => {
    return (
      <div
        data-testid={`submenu-${group}`}
        className="rounded-xl bg-white overflow-hidden drop-shadow border border-input p-0.5 flex flex-col gap-[2px] justify-center items-center"
      >
        {blockGroups[group].map((block) => (
          <CreateBlockDraggableItem
            key={block.type}
            data={block}
            onCreate={onCreate}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="absolute top-1/2 -translate-y-1/2 left-4 h-auto">
      <ClientOnly fallback={null}>
        {() => (
          <div className="bg-black/5 p-[2px] rounded-xl">
            <MenuClient expandIcon={null}>
              {/*<ELMenuItem />*/}

              {Object.keys(blockGroups).map((group) => (
                <GroupSubMenu
                  key={group}
                  title={
                    <span className="truncate w-full text-center">
                      {startCase(group)}
                    </span>
                  }
                >
                  <SubMenuItems group={group} />
                </GroupSubMenu>
              ))}
            </MenuClient>
          </div>
        )}
      </ClientOnly>
    </div>
  );
};
