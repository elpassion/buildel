import type { IAsyncSelectItem } from '~/api/AsyncSelectApi';

export interface IFixtureAsyncSelectModel extends IAsyncSelectItem {
  type: string;
}

export const modelFixture = (
  override?: Partial<IFixtureAsyncSelectModel>,
): IFixtureAsyncSelectModel => {
  return {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    type: 'openai',
    ...override,
  };
};
