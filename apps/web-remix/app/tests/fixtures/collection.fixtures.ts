import { IKnowledgeBaseCollection } from "~/components/pages/knowledgeBase/knowledgeBase.types";

export const collectionFixture = (
  override?: Partial<IKnowledgeBaseCollection>
): IKnowledgeBaseCollection => {
  return {
    id: 1,
    name: "test",
    embeddings: {
      api_type: "openai",
      model: "text-embedding-ada-002",
      secret_name: "openai",
    },
    ...override,
  };
};
