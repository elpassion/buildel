import type {
  KnowledgeBaseCollection,
  KnowledgeBaseCollectionCost,
  KnowledgeBaseFile,
  KnowledgeBaseFileList
} from "~/api/knowledgeBase/knowledgeApi.contracts";
import type { z } from "zod";

export type IKnowledgeBaseFile = z.TypeOf<typeof KnowledgeBaseFile>;

export type IKnowledgeBaseFileList = z.TypeOf<typeof KnowledgeBaseFileList>;

export type IKnowledgeBaseCollection = z.TypeOf<typeof KnowledgeBaseCollection>;

export type IKnowledgeBaseCollectionCost = z.TypeOf<typeof KnowledgeBaseCollectionCost>