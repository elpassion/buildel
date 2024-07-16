import { http, HttpResponse } from 'msw';

import type { IBlockTypesResponse } from '~/api/blockType/blockType.contracts';
import { blockTypesFixture } from '~/tests/fixtures/blockTypes.fixtures';

export const handlers = () => {
  return [
    http.get('/super-api/block_types', () => {
      return HttpResponse.json<IBlockTypesResponse>(
        { data: blockTypesFixture() },
        { status: 200 },
      );
    }),
  ];
};
