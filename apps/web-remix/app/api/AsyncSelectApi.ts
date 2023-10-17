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
    return fetch(url.replace("/api", "/super-api"))
      .then((res) => res.json())
      .then((data) => AsyncSelectItemListResponse.parse(data));
  }

  async createData(url: string, item: IAsyncSelectItem) {
    return fetch(url.replace("/api", "/super-api"), {
      method: "POST",
      body: JSON.stringify(item),
      headers: {
        "Content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => AsyncSelectItemListResponse.parse(data));
  }
}

export const asyncSelectApi = new AsyncSelectApi();
