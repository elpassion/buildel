import { fetchTyped } from "~/utils/fetch.server";
import { BlockTypesResponse } from "./blockType.contracts";

export class BlockTypeApi {
  constructor(private client: typeof fetchTyped) {}

  getBlockTypes() {
    return this.client(BlockTypesResponse, `/block_types`);
  }
}
