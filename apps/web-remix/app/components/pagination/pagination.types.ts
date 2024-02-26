import z from "zod";

export const PaginationMeta = z.object({
  total: z.number(),
  page: z.number(),
  per_page: z.number(),
});

export type IPaginationMeta = z.TypeOf<typeof PaginationMeta>;
