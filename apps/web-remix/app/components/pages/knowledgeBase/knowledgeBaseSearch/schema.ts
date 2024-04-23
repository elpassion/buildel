import { z } from "zod";
import { zfd } from "zod-form-data";

export const SearchSchema = z.object({
    query: z.string().min(1),
    limit: zfd.numeric(z.number().int().min(0).optional()),
    token_limit: zfd.numeric(z.number().int().min(0).optional())
});
