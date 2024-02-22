import { z } from "zod";
import { PaginationMeta } from "~/components/pagination/pagination.types";

export const MemoryChunk = z.object({
  id: z.string(),
  content: z.string(),
});

export type IMemoryChunk = z.TypeOf<typeof MemoryChunk>;

export const MemoryChunks = z.array(MemoryChunk);

export const MemoryChunksResponse = z.object({
  data: MemoryChunks,
  meta: PaginationMeta,
});

export type IMemoryChunksResponse = z.TypeOf<typeof MemoryChunksResponse>;
