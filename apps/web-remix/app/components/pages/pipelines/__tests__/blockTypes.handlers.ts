import { http, HttpResponse } from "msw";
import { blockTypesFixture } from "~/tests/fixtures/blockTypes.fixtures";
import { IBlockTypesResponse } from "~/api/blockType/blockType.contracts";

export const handlers = () => {
  return [
    http.get("/super-api/block_types", () => {
      return HttpResponse.json<IBlockTypesResponse>(
        { data: blockTypesFixture() },
        { status: 200 }
      );
    }),
  ];
};
