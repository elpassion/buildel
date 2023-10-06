import { z } from "zod";
import {
  KnowledgeBaseCollection,
  KnowledgeBaseFile,
  KnowledgeBaseFileList,
} from "./contracts";

export type IKnowledgeBaseFile = z.TypeOf<typeof KnowledgeBaseFile>;

export type IKnowledgeBaseFileList = z.TypeOf<typeof KnowledgeBaseFileList>;

export type IKnowledgeBaseCollection = z.TypeOf<typeof KnowledgeBaseCollection>;
