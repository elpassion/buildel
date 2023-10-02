import { z } from "zod";

export const KnowledgeBaseFile = z.object({
  id: z.number(),
  file_name: z.string(),
  file_size: z.number(),
  file_type: z.string(),
});

export const KnowledgeBaseFileResponse = z
  .object({ data: KnowledgeBaseFile })
  .transform((res) => res.data);

export const KnowledgeBaseFileList = z.array(KnowledgeBaseFile);
export const KnowledgeBaseFileListResponse = z
  .object({
    data: KnowledgeBaseFileList,
  })
  .transform((res) => res.data);
