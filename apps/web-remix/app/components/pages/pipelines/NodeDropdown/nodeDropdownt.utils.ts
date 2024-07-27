import type { IBlockTypes } from '~/components/pages/pipelines/pipeline.types';

export function leaveOneGroup(blockTypes: IBlockTypes) {
  return blockTypes.map((type) => ({
    ...type,
    groups: type.groups.slice(0, 1),
  }));
}
