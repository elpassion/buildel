import { z } from "zod";
import { NotFoundError } from "~/utils/errors";
import { PaginationMeta } from "~/components/pagination/pagination.types";

export const KnowledgeBaseFile = z.object({
  id: z.number(),
  file_name: z.string(),
  file_size: z.number(),
  file_type: z.string(),
});

export const MemoryChunk = z.object({
  id: z.string(),
  content: z.string(),
});

export const MemoryChunks = z.array(MemoryChunk);

export const MemoryChunksResponse = z.object({
  data: MemoryChunks,
  meta: PaginationMeta,
});

export const KnowledgeBaseCollection = z.object({
  id: z.number(),
  name: z.string(),
  embeddings: z.object({
    api_type: z.string(),
    model: z.string(),
    secret_name: z.string(),
  }),
});

export const KnowledgeBaseFileResponse = z
  .object({ data: KnowledgeBaseFile })
  .transform((res) => res.data);

export const KnowledgeBaseFileList = z.array(KnowledgeBaseFile);

export const KnowledgeBaseCollectionList = z.array(KnowledgeBaseCollection);
export const KnowledgeBaseFileListResponse = z
  .object({
    data: KnowledgeBaseFileList,
  })
  .transform((res) => res.data);

export const KnowledgeBaseCollectionListResponse = z
  .object({
    data: KnowledgeBaseCollectionList,
  })
  .transform((res) => res.data);

export const KnowledgeBaseCollectionFromListResponse =
  KnowledgeBaseCollectionListResponse.transform((res) => {
    const collection = res[0];

    if (!collection) {
      throw new NotFoundError();
    }
    return collection;
  });
