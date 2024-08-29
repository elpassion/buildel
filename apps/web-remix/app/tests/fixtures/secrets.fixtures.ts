import type { ISecretKey } from '~/components/pages/secrets/variables.types';

export const secretFixture = (override?: Partial<ISecretKey>): ISecretKey => {
  return {
    id: 'OPENAI',
    name: 'OPENAI',
    alias: null,
    created_at: '07/02/2024 11:35',
    updated_at: '07/02/2024 11:35',
    ...override,
  };
};
