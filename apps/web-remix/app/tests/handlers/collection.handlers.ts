import { http, HttpResponse } from "msw";
import {
  IKnowledgeBaseCollection,
  IKnowledgeBaseFile,
} from "~/components/pages/knowledgeBase/knowledgeBase.types";
import { ICreateCollectionSchema } from "~/api/knowledgeBase/knowledgeApi.contracts";
export class CollectionHandlers {
  private collections: Map<number, IKnowledgeBaseCollection> = new Map();

  constructor(initials: IKnowledgeBaseCollection[] = []) {
    initials.forEach((collection) =>
      this.collections.set(collection.id, collection)
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
          }
        );
      }
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
          }
        );
      }
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
          }
        );
      }
    );
  }

  get handlers() {
    return [
      this.getCollections(),
      this.deleteHandler(),
      this.createCollection(),
    ];
  }
}

export class CollectionMemoriesHandlers {
  private collectionMemories: Map<number, IKnowledgeBaseFile> = new Map();

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
          }
        );
      }
    );
  }

  get handlers() {
    return [this.getCollectionMemories()];
  }
}
