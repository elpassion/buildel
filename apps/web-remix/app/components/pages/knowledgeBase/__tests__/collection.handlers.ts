import { http, HttpResponse } from "msw";
import {
  IKnowledgeBaseCollection,
  IKnowledgeBaseFile,
} from "~/components/pages/knowledgeBase/knowledgeBase.types";
import { collectionFixture } from "~/tests/fixtures/collection.fixtures";
import { ICreateCollectionSchema } from "~/api/knowledgeBase/knowledgeApi.contracts";
import { collectionMemoryFixtures } from "~/tests/fixtures/collectionMemory.fixtures";

export class CollectionHandlers {
  private collections: Map<number, IKnowledgeBaseCollection> = new Map();

  constructor() {
    this.collections.set(collectionFixture().id, collectionFixture());
    this.collections.set(
      2,
      collectionFixture({ id: 2, name: "super-collection" })
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
          id: 3,
          name: data.collection_name,
        };
        this.collections.set(3, newCollection);

        return HttpResponse.json<{ data: IKnowledgeBaseCollection[] }>(
          { data: [...this.collections.values()] },
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

  constructor() {
    this.collectionMemories.set(
      collectionMemoryFixtures().id,
      collectionMemoryFixtures()
    );
    this.collectionMemories.set(
      2,
      collectionMemoryFixtures({ id: 2, file_name: "test_file" })
    );
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
