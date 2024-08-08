import type { z } from 'zod';

import type {
  KnowledgeBaseCollection,
  KnowledgeBaseCollectionCost,
  KnowledgeBaseFile,
  KnowledgeBaseFileList,
  MemoryGraphState,
  MemoryNode,
} from '~/api/knowledgeBase/knowledgeApi.contracts';

export type IKnowledgeBaseFile = z.TypeOf<typeof KnowledgeBaseFile>;

export type IKnowledgeBaseFileList = z.TypeOf<typeof KnowledgeBaseFileList>;

export type IKnowledgeBaseCollection = z.TypeOf<typeof KnowledgeBaseCollection>;

export type IKnowledgeBaseCollectionCost = z.TypeOf<
  typeof KnowledgeBaseCollectionCost
>;

export type IMemoryNode = z.TypeOf<typeof MemoryNode>;

export type IMemoryGraphState = z.TypeOf<typeof MemoryGraphState>;
