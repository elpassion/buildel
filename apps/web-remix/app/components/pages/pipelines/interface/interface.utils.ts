import type { IBlockConfig } from '~/components/pages/pipelines/pipeline.types';

export function toSelectOption(item: IBlockConfig) {
  return {
    id: item.name.toString(),
    value: JSON.stringify({ name: item.name, type: item.type }),
    label: item.name,
  };
}
