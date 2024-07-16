import type { IAsyncSelectItem } from '~/api/AsyncSelectApi';

export const embeddingFixture = (
  override?: Partial<IAsyncSelectItem>,
): IAsyncSelectItem => {
  return {
    id: 'text-embedding-ada-002',
    name: 'text-embedding-ada-002',
    ...override,
  };
};
