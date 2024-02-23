import { IKnowledgeBaseFile } from "~/components/pages/knowledgeBase/knowledgeBase.types";

export const collectionMemoryFixtures = (
  override?: Partial<IKnowledgeBaseFile>
): IKnowledgeBaseFile => {
  return {
    id: 16,
    file_name: "Kodeks_Etyki_Biznesu_PL.pdf",
    file_size: 89940,
    file_type: "application/pdf",
    ...override,
  };
};
