import { ENV } from '~/env.mjs';
import { BlockTypesResponse, IBlockTypesObj } from './pipelines.types';

export class BlockTypesApi {
  async getBlockTypes() {
    const response = await fetch(`${ENV.API_URL}/block_types`);
    const json = await response.json();
    return BlockTypesResponse.parse(json).data.reduce((acc, blockType) => {
      acc[blockType.type] = blockType;
      return acc;
    }, {} as IBlockTypesObj);
  }
}

export const blockTypesApi = new BlockTypesApi();
