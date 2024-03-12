import { fetchTyped } from "~/utils/fetch.server";
import { BlockTypesResponse, IBlockTypesResponse } from "./blockType.contracts";

let cache: undefined | IBlockTypesResponse = undefined;

export class BlockTypeApi {
  constructor(private client: typeof fetchTyped) {}

  async getBlockTypes(): Promise<IBlockTypesResponse> {
    // TODO: Setup better caching
    if (process.env.NODE_ENV === "production" && cache) return cache;
    const response = await this.client(BlockTypesResponse, `/block_types`);
    cache = response.data;
    setTimeout(() => (cache = undefined), 1000 * 60 * 5);

    return response.data;
  }
}
