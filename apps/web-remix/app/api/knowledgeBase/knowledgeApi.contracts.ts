import { z } from 'zod';
import { zfd } from 'zod-form-data';

import { PaginationMeta } from '~/components/pagination/pagination.types';
import { NotFoundError } from '~/utils/errors';

export const MemoryChunk = z.object({
  id: z.string(),
  content: z.string(),
  keywords: z.array(z.string()).default([]),
  file_name: z.string().optional(),
  pages: z.array(z.number()).default([]),
});

export type IMemoryChunk = z.TypeOf<typeof MemoryChunk>;

export const MemoryChunks = z.array(MemoryChunk);

export const MemoryChunksResponse = z.object({
  data: MemoryChunks,
  meta: PaginationMeta,
});

export type IMemoryChunksResponse = z.TypeOf<typeof MemoryChunksResponse>;

export const CreateCollectionSchema = z.object({
  collection_name: z.string().min(2),
  embeddings: z.object({
    api_type: z.string().min(2),
    model: z.string().min(2),
    secret_name: z.string().min(2),
    endpoint: z.string().min(2),
  }),
  chunk_size: zfd.numeric(z.number().int().positive()),
  chunk_overlap: zfd.numeric(z.number().int().min(0)),
});

export const UpdateCollectionSchema = z.object({
  id: zfd.numeric(),
  // name: z.string().min(2),
  embeddings: z.object({
    // api_type: z.string().min(2),
    // model: z.string().min(2),
    secret_name: z.string().min(2),
  }),
});

export type ICreateCollectionSchema = z.TypeOf<typeof CreateCollectionSchema>;

export type IUpdateCollectionSchema = z.TypeOf<typeof UpdateCollectionSchema>;

export const KnowledgeBaseFile = z.object({
  id: z.union([z.number(), z.string()]),
  file_name: z.string(),
  file_size: z.number(),
  file_type: z.string(),
});

export const KnowledgeBaseSearchChunk = z.object({
  id: z.string(),
  content: z.string(),
  file_name: z.union([z.string(), z.null()]),
  similarity: z.number(),
  keywords: z.array(z.string()).default([]),
  pages: z.array(z.number()).default([]),
});

export const KnowledgeBaseSearchChunkMeta = z.object({
  total_tokens: z.number(),
});

export const KnowledgeBaseSearchChunkResponse = z
  .object({
    data: z.array(KnowledgeBaseSearchChunk),
    meta: KnowledgeBaseSearchChunkMeta,
  })
  .transform((res) => ({ data: res.data, meta: res.meta }));

export type IKnowledgeBaseSearchChunk = z.TypeOf<
  typeof KnowledgeBaseSearchChunk
>;

export type IKnowledgeBaseSearchChunkMeta = z.TypeOf<
  typeof KnowledgeBaseSearchChunkMeta
>;

export const KnowledgeBaseCollection = z.object({
  id: z.number(),
  name: z.string(),
  embeddings: z.object({
    api_type: z.string(),
    model: z.string(),
    secret_name: z.string(),
    endpoint: z.string(),
  }),
  chunk_size: z.number(),
  chunk_overlap: z.number(),
});

export const KnowledgeBaseCollectionCost = z.object({
  id: z.number(),
  amount: z.string(),
  cost_type: z.string(),
  description: z.string().nullable(),
  input_tokens: z.number(),
  output_tokens: z.number(),
  created_at: z.string(),
});

export const KnowledgeBaseCollectionCostResponse = z
  .object({
    data: z.array(KnowledgeBaseCollectionCost),
    meta: PaginationMeta,
  })
  .transform((res) => ({ data: res.data, meta: res.meta }));

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

export type IKnowledgeBaseFileListResponse = z.TypeOf<
  typeof KnowledgeBaseFileListResponse
>;

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

export const MemoryNode = z.object({
  id: z.union([z.string(), z.number()]),
  memory_id: z.union([z.string(), z.number()]),
  point: z.array(z.number(), z.number()),
});

export const MemoryGraphResponse = z
  .object({
    data: z.object({
      nodes: z.array(MemoryNode),
    }),
  })
  .transform((res) => res.data);

export const MemoryGraphState = z.object({
  state: z.enum(['processing', 'idle']),
});

export const MemoryGraphStateResponse = z
  .object({
    data: MemoryGraphState,
  })
  .transform((res) => res.data);

export const MemoryNodeRelated = z.object({
  chunks: z.array(z.string()),
});

export const MemoryNodeRelatedResponse = z
  .object({
    data: MemoryNodeRelated,
  })
  .transform((res) => res.data);

export const MemoryNodeDetails = MemoryNode.merge(
  z.object({
    next: z.union([z.string(), z.number()]).nullable().optional(),
    prev: z.union([z.string(), z.number()]).nullable().optional(),
    file_name: z.string(),
    content: z.string(),
    keywords: z.array(z.string()).default([]),
  }),
);

export const MemoryNodeDetailsResponse = z
  .object({
    data: MemoryNodeDetails,
  })
  .transform((res) => res.data);

export const TemporaryChunk = z.object({
  id: z.string(),
  content: z.string(),
  keywords: z.array(z.string()).default([]),
  file_name: z.string(),
  pages: z.array(z.number()).default([]),
});

export const TemporaryChunkResponse = z
  .object({
    data: TemporaryChunk,
  })
  .transform((res) => res.data);

export const TemporaryMemoryResponse = z
  .object({
    data: z.array(TemporaryChunk),
    meta: PaginationMeta,
  })
  .transform((res) => ({ data: res.data, meta: res.meta }));
