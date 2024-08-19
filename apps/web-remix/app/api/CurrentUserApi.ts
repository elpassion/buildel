import { z } from 'zod';
import { zfd } from 'zod-form-data';

import type { fetchTyped } from '~/utils/fetch.server';

export const CurrentUser = z.object({
  id: z.number(),
  marketing_agreement: z.boolean().nullable(),
});

export type ICurrentUser = z.TypeOf<typeof CurrentUser>;

export const CurrentUserResponse = z
  .object({
    data: CurrentUser,
  })
  .transform((res) => res.data);

export const UpdateUserSchema = z.object({
  marketing_agreement: zfd.checkbox(),
});

export const UpdateUserResponse = z
  .object({
    data: CurrentUser,
  })
  .transform((res) => res.data);

export class CurrentUserApi {
  constructor(private client: typeof fetchTyped) {}

  async updateUser(data: Omit<ICurrentUser, 'id'>) {
    return this.client(UpdateUserResponse, '/users', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}
