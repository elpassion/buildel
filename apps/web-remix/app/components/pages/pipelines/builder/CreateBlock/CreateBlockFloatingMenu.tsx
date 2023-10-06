import React, { useMemo } from "react";
import { useLoaderData } from "@remix-run/react";
import startCase from "lodash.startcase";
import { loader } from "~/components/pages/pipelines/builder";
import {
  IBlockConfig,
  IBlockType,
  IBlockTypes,
} from "~/components/pages/pipelines/pipeline.types";
import { Menu } from "~/components/menu/Menu";
import { GroupSubMenu } from "./GroupSubMenu";
import { CreateBlockDraggableItem } from "./CreateBlockDraggableItem";

interface CreateBlockFloatingMenuProps {
  onCreate: (node: IBlockConfig) => void;
}

export const CreateBlockFloatingMenu: React.FC<
  CreateBlockFloatingMenuProps
> = ({ onCreate }) => {
  const { blockTypes } = useLoaderData<typeof loader>();

  const blockGroups = useMemo(
    () =>
      blockTypes.reduce((groups, blockType) => {
        blockType.groups.forEach((group) => {
          if (!groups[group]) {
            groups[group] = [] as IBlockTypes;
          }
          groups[group].push(blockType as IBlockType);
        });

        return groups;
      }, {} as Record<string, IBlockTypes>),
    [blockTypes]
  );

  return (
    <div className="absolute top-1/2 -translate-y-1/2 right-4 h-auto">
      <Menu expandIcon={null}>
        {Object.keys(blockGroups).map((group) => (
          <GroupSubMenu
            key={group}
            title={
              <span className="truncate w-full text-center">
                {startCase(group)}
              </span>
            }
          >
            <div className="rounded-lg overflow-hidden drop-shadow-md border border-neutral-100 divide-y divide-solid">
              {blockGroups[group].map((block) => (
                <CreateBlockDraggableItem
                  key={block.type}
                  data={block}
                  onCreate={onCreate}
                />
              ))}
            </div>
          </GroupSubMenu>
        ))}
      </Menu>
    </div>
  );
};
