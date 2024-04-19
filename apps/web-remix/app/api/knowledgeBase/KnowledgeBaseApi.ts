import { fetchTyped } from "~/utils/fetch.server";
import { buildUrlWithParams } from "~/utils/url";
import {
  KnowledgeBaseCollectionFromListResponse,
  KnowledgeBaseCollectionListResponse,
  KnowledgeBaseFileListResponse,
  MemoryChunksResponse,
  CreateCollectionSchema,
  UpdateCollectionSchema,
  KnowledgeBaseSearchChunkResponse,
  IKnowledgeBaseSearchChunk,
} from "./knowledgeApi.contracts";
import { PaginationQueryParams } from "~/components/pagination/usePagination";
import { z } from "zod";

export class KnowledgeBaseApi {
  constructor(private client: typeof fetchTyped) {}

  async getCollections(organizationId: string | number) {
    return this.client(
      KnowledgeBaseCollectionListResponse,
      `/organizations/${organizationId}/memory_collections`
    );
  }

  async getCollectionByName(
    organizationId: string | number,
    collectionName: string | number
  ) {
    return this.client(
      KnowledgeBaseCollectionFromListResponse,
      `/organizations/${organizationId}/memory_collections?collection_name=${collectionName}`
    );
  }

  async deleteCollection(
    organizationId: string | number,
    collectionId: string | number
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/memory_collections/${collectionId}`,
      { method: "DELETE" }
    );
  }

  async getCollectionMemories(
    organizationId: string | number,
    collectionId: string | number
  ) {
    return this.client(
      KnowledgeBaseFileListResponse,
      `/organizations/${organizationId}/memory_collections/${collectionId}/memories`
    );
  }

  async searchCollectionChunks(
    organizationId: string | number,
    collectionId: string | number,
    params: { query?: string }
  ) {
    const urlWithParams = buildUrlWithParams(
      `/organizations/${organizationId}/memory_collections/${collectionId}/search`,
      params
    );
    return {
      data: [
        {
          id: 1,
          content:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
          file_name: "test.pdf",
        },
        {
          id: 2,
          content:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
          file_name: "test.pdf",
        },
        {
          id: 3,
          content:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
          file_name: "test.pdf",
        },
        {
          id: 4,
          content:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
          file_name: "test.pdf",
        },
        {
          id: 5,
          content:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
          file_name: "test.pdf",
        },
        {
          id: 6,
          content:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
          file_name: "test.pdf",
        },
        {
          id: 7,
          content:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
          file_name: "test.pdf",
        },
      ],
    } as { data: IKnowledgeBaseSearchChunk[] };
    // return this.client(KnowledgeBaseSearchChunkResponse, urlWithParams);
  }

  async deleteCollectionMemory(
    organizationId: string | number,
    collectionId: string | number,
    memoryId: string | number
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/memory_collections/${collectionId}/memories/${memoryId}`,
      { method: "DELETE" }
    );
  }

  async createCollection(
    organizationId: string | number,
    data: z.TypeOf<typeof CreateCollectionSchema>
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/memory_collections`,
      { method: "POST", body: JSON.stringify(data) }
    );
  }

  async updateCollection(
    organizationId: string | number,
    collectionId: string | number,
    data: z.TypeOf<typeof UpdateCollectionSchema>
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/memory_collections/${collectionId}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
  }

  async getMemoryChunk(
    organizationId: string | number,
    collectionId: string | number,
    memoryId: string | number,
    pagination?: PaginationQueryParams
  ) {
    const url = buildUrlWithParams(
      `/organizations/${organizationId}/memory_collections/${collectionId}/memories/${memoryId}/chunks`,
      { ...pagination }
    );

    return this.client(MemoryChunksResponse, url);
  }
}
