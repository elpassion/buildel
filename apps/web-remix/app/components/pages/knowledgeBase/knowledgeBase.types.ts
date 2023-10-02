import { z } from "zod";
import { KnowledgeBaseFile, KnowledgeBaseFileList } from "./contracts";

export type IKnowledgeBaseFile = z.TypeOf<typeof KnowledgeBaseFile>;

export type IKnowledgeBaseFileList = z.TypeOf<typeof KnowledgeBaseFileList>;
