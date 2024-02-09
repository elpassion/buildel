import { fetchTyped } from "~/utils/fetch.server";
import { BlockTypesResponse } from "./blockType.contracts";

let cache = undefined as any;

export class BlockTypeApi {
  constructor(private client: typeof fetchTyped) {}

  async getBlockTypes() {
    // TODO: Setup better caching
    if (cache) return cache;
    const response = await this.client(BlockTypesResponse, `/block_types`);
    cache = response;
    return response;
  }
}
