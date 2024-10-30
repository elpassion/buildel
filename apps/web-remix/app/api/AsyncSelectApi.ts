import { z } from 'zod';

export const AsyncSelectItem = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
});

export const AsyncSelectItemList = z.array(AsyncSelectItem);

export const AsyncSelectItemResponse = z
  .object({
    data: AsyncSelectItem,
  })
  .transform((res) => res.data);

export const AsyncSelectItemListResponse = z
  .object({
    data: AsyncSelectItemList,
  })
  .transform((res) => res.data);

export const AsyncSelectListErrorResponse = z
  .object({
    errors: z.object({
      detail: z.string(),
    }),
  })
  .transform((res) => res.errors.detail);

export type IAsyncSelectItem = z.TypeOf<typeof AsyncSelectItem>;

export type IAsyncSelectItemList = z.TypeOf<typeof AsyncSelectItemList>;

export class AsyncSelectApi {
  async getData(url: string, args?: RequestInit) {
    try {
      const response = await fetch(url.replace('/api', '/super-api'), args);
      const json = await response.json();
      if (!response.ok)
        return Promise.reject(AsyncSelectListErrorResponse.parse(json));
      return AsyncSelectItemListResponse.parse(json);
    } catch (error) {
      return Promise.reject(
        'Could not return entities from specified endpoint',
      );
    }
  }

  async createData(url: string, item: IAsyncSelectItem) {
    return fetch(url.replace('/api', '/super-api'), {
      method: 'POST',
      body: JSON.stringify(item),
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => AsyncSelectItemResponse.parse(data));
  }
}

export const asyncSelectApi = new AsyncSelectApi();
