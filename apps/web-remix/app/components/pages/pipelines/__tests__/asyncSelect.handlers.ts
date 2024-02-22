import { http, HttpResponse } from "msw";
import { IAsyncSelectItem, IAsyncSelectItemList } from "~/api/AsyncSelectApi";
import { secretFixture } from "~/tests/fixtures/secrets.fixtures";
import {
  IFixtureAsyncSelectModel,
  modelFixture,
} from "~/tests/fixtures/models.fixtures";

export class SecretsHandlers {
  private secrets: Map<string | number, IAsyncSelectItem> = new Map();

  constructor() {
    this.secrets.set(secretFixture().id, secretFixture());
    this.secrets.set("Test", secretFixture({ name: "Test", id: "Test" }));
  }

  getSecretsHandler() {
    return http.get("/super-api/organizations/:organizationId/secrets", () => {
      return HttpResponse.json<{ data: IAsyncSelectItemList }>(
        { data: [...this.secrets.values()] },
        { status: 200 }
      );
    });
  }

  createHandler() {
    return http.post<any, { name: string; value: string }>(
      "/super-api/organizations/:organizationId/secrets",
      async ({ request }) => {
        const data = await request.json();
        const transformed = { id: data.value, name: data.name };

        this.secrets.set(data.value, transformed);

        return HttpResponse.json({ data: transformed }, { status: 200 });
      }
    );
  }

  get handlers() {
    return [this.getSecretsHandler(), this.createHandler()];
  }
}

export class ModelsHandlers {
  private models: Map<string | number, IFixtureAsyncSelectModel> = new Map();

  constructor() {
    this.models.set(modelFixture().id, modelFixture());
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
