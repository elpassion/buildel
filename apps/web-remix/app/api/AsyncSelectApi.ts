import { z } from "zod";

export const AsyncSelectItem = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
});

export const AsyncSelectItemList = z.array(AsyncSelectItem);

export const AsyncSelectItemListResponse = z
  .object({
    data: AsyncSelectItemList,
  })
  .transform((res) => res.data);

export type IAsyncSelectItem = z.TypeOf<typeof AsyncSelectItem>;

export type IAsyncSelectItemList = z.TypeOf<typeof AsyncSelectItemList>;

export class AsyncSelectApi {
  async getData(url: string) {
    // return fetch(url)
    //   .then((res) => res.json())
    //   .then((data) => AsyncSelectItemListResponse.parse(data));
    //
    return AsyncSelectItemListResponse.parse({
      data: [
        { id: "0", name: "Workflow" },
        { id: "3", name: "Jakies collection" },
      ],
    });
  }
}

export const asyncSelectApi = new AsyncSelectApi();
