import { http, HttpResponse } from "msw";
import { IAsyncSelectItem, IAsyncSelectItemList } from "~/api/AsyncSelectApi";
import { secretFixture } from "~/tests/fixtures/secrets.fixtures";
import {
  IFixtureAsyncSelectModel,
  modelFixture,
} from "~/tests/fixtures/models.fixtures";
import { embeddingFixture } from "~/tests/fixtures/embedding.fixtures";

//@todo handle filtering by api type
export class EmbeddingsHandlers {
  private embeddings: Map<string | number, IAsyncSelectItem> = new Map();

  constructor() {
    this.embeddings.set(embeddingFixture().id, embeddingFixture());
    this.embeddings.set(
      "embedding",
      embeddingFixture({ name: "embedding", id: "embedding" })
    );
  }

  getEmbeddingsHandler() {
    return http.get(
      "/super-api/organizations/:organizationId/models/embeddings",
      () => {
        return HttpResponse.json<{ data: IAsyncSelectItemList }>(
          { data: [...this.embeddings.values()] },
          { status: 200 }
        );
      }
    );
  }

  get handlers() {
    return [this.getEmbeddingsHandler()];
  }
}

export class ModelsHandlers {
  private models: Map<string | number, IFixtureAsyncSelectModel> = new Map();

  constructor() {
    this.models.set(embeddingFixture().id, modelFixture());
    this.models.set(
      "Test",
      modelFixture({ name: "Test", id: "Test", type: "google" })
    );
  }

  getModelsHandler() {
    return http.get(
      "/super-api/organizations/:organizationId/models",
      ({ request }) => {
        const url = new URL(request.url);
        const apiType = url.searchParams.get("api_type") ?? "openai";

        return HttpResponse.json<{ data: IAsyncSelectItemList }>(
          {
            data: [...this.models.values()].filter(
              (model) => model.type === apiType
            ),
          },
          { status: 200 }
        );
      }
    );
  }

  get handlers() {
    return [this.getModelsHandler()];
  }
}
