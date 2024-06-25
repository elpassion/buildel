import { http, HttpResponse } from "msw";
import {
  IKnowledgeBaseCollection,
  IKnowledgeBaseFile,
} from "~/components/pages/knowledgeBase/knowledgeBase.types";
import {
  ICreateCollectionSchema,
  IUpdateCollectionSchema,
} from "~/api/knowledgeBase/knowledgeApi.contracts";
export class CollectionHandlers {
  private collections: Map<number, IKnowledgeBaseCollection> = new Map();

  constructor(initials: IKnowledgeBaseCollection[] = []) {
    initials.forEach((collection) =>
      this.collections.set(collection.id, collection),
    );
  }

  getCollections() {
    return http.get(
      "/super-api/organizations/:organizationId/memory_collections",
      () => {
        return HttpResponse.json<{ data: IKnowledgeBaseCollection[] }>(
          { data: [...this.collections.values()] },
          {
            status: 200,
          },
        );
      },
    );
  }

  createCollection() {
    return http.post<any, ICreateCollectionSchema>(
      "/super-api/organizations/:organizationId/memory_collections",
      async ({ request }) => {
        const data = await request.json();

        const newCollection = {
          ...data,
          id: this.collections.size + 1,
          name: data.collection_name,
        };
        this.collections.set(newCollection.id, newCollection);

        return HttpResponse.json(
          { data: newCollection },
          {
            status: 200,
          },
        );
      },
    );
  }

  updateCollection() {
    return http.put<any, IUpdateCollectionSchema>(
      "/super-api/organizations/:organizationId/memory_collections/:collectionId",
      async ({ request, params }) => {
        const data = await request.json();
        const { collectionId } = params;

        const collection = this.collections.get(collectionId);

        if (!collection) {
          return HttpResponse.json(
            {},
            {
              status: 404,
            },
          );
        }

        const updatedCollection: IKnowledgeBaseCollection = {
          ...collection,
          embeddings: {
            ...collection.embeddings,
            secret_name: data.embeddings.secret_name,
          },
        };

        this.collections.set(collectionId, updatedCollection);

        return HttpResponse.json(
          { data: updatedCollection },
          {
            status: 200,
          },
        );
      },
    );
  }

  deleteHandler() {
    return http.delete(
      "/super-api/organizations/:organizationId/memory_collections/:collectionId",
      async ({ params }) => {
        const { collectionId } = params;

        this.collections.delete(Number(collectionId));

        return HttpResponse.json(
          {},
          {
            status: 200,
          },
        );
      },
    );
  }

  get handlers() {
    return [
      this.getCollections(),
      this.deleteHandler(),
      this.createCollection(),
      this.updateCollection(),
    ];
  }
}

export class CollectionMemoriesHandlers {
  private collectionMemories: Map<number | string, IKnowledgeBaseFile> =
    new Map();

  constructor(initials: IKnowledgeBaseFile[] = []) {
    initials.forEach((file) => this.collectionMemories.set(file.id, file));
  }

  getCollectionMemories() {
    return http.get(
      "/super-api/organizations/:organizationId/memory_collections/:collectionId/memories",
      () => {
        return HttpResponse.json<{ data: IKnowledgeBaseFile[] }>(
          { data: [...this.collectionMemories.values()] },
          {
            status: 200,
          },
        );
      },
    );
  }

  createCollectionMemory() {
    return http.post(
      "/super-api/organizations/:organizationId/memory_collections/:collectionId/memories",
      async ({ request }) => {
        const data = await request.formData();
        const file = data.get("file") as File;

        const newMemory = {
          id: this.collectionMemories.size + 1,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
        };

        this.collectionMemories.set(newMemory.id, newMemory);

        return HttpResponse.json<{ data: IKnowledgeBaseFile[] }>(
          { data: [...this.collectionMemories.values()] },
          {
            status: 200,
          },
        );
      },
    );
  }

  createCollectionMemoryFailed() {
    return http.post(
      "/super-api/organizations/:organizationId/memory_collections/:collectionId/memories",
      async () => {
        return HttpResponse.json(
          {
            errors: {
              detail: "Invalid API key provided for embeddings model",
            },
          },
          {
            status: 400,
          },
        );
      },
    );
  }

  deleteCollectionMemory() {
    return http.delete(
      "/super-api/organizations/:organizationId/memory_collections/:collectionId/memories/:memoryId",
      ({ params }) => {
        const { memoryId } = params;

        const memory = this.collectionMemories.get(Number(memoryId));

        if (!memory) {
          return HttpResponse.json(null, {
            status: 404,
          });
        }

        this.collectionMemories.delete(Number(memoryId));
        return HttpResponse.json<{ data: IKnowledgeBaseFile[] }>(
          { data: [...this.collectionMemories.values()] },
          {
            status: 200,
          },
        );
      },
    );
  }

  get handlers() {
    return [
      this.getCollectionMemories(),
      this.deleteCollectionMemory(),
      this.createCollectionMemory(),
    ];
  }
}
