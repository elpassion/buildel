import type { IKnowledgeBaseCollection } from "~/components/pages/knowledgeBase/knowledgeBase.types";

export const collectionFixture = (
  override?: Partial<IKnowledgeBaseCollection>,
): IKnowledgeBaseCollection => {
  return {
    id: 1,
    name: "test",
    embeddings: {
      api_type: "openai",
      model: "text-embedding-ada-002",
      secret_name: "openai",
      endpoint: "https://api.openai.com/v1/embeddings",
    },
    chunk_size: 1000,
    chunk_overlap: 0,
    ...override,
  };
};
