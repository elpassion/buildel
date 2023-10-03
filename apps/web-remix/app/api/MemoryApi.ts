import { KnowledgeBaseFileListResponse } from "~/components/pages/knowledgeBase/contracts";

export class MemoryApi {
  async getMemoryFiles(organizationId: string, collection_name: string) {
    const response = await fetch(
      `/super-api/organizations/${organizationId}/memories?collection_name=${collection_name}`
    ).then((res) => res.json());

    return KnowledgeBaseFileListResponse.parse(response).map((file) => ({
      ...file,
      status: "done",
    }));
  }
}
