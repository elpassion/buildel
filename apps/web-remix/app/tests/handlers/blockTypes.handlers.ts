import { http, HttpResponse } from 'msw';

import type {
  IBlockTypesResponse,
  IDynamicIOsResponse,
} from '~/api/blockType/blockType.contracts';
import { blockTypesFixture } from '~/tests/fixtures/blockTypes.fixtures';

export const handlers = () => {
  return [
    http.get('/super-api/block_types', () => {
      return HttpResponse.json<IBlockTypesResponse>(
        { data: blockTypesFixture() },
        { status: 200 },
      );
    }),
    http.get(
      '/super-api/organizations/:organizationId/pipelines/:pipelineId/ios',
      () => {
        return HttpResponse.json<IDynamicIOsResponse>(
          { data: { inputs: [], outputs: [], ios: [] } },
          { status: 200 },
        );
      },
    ),
  ];
};
