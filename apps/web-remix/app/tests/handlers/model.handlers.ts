import { http, HttpResponse } from 'msw';

import type {
  IAsyncSelectItem,
  IAsyncSelectItemList,
} from '~/api/AsyncSelectApi';
import type { IFixtureAsyncSelectModel } from '~/tests/fixtures/models.fixtures';

//@todo handle filtering by api type
export class EmbeddingsHandlers {
  private embeddings: Map<string | number, IAsyncSelectItem> = new Map();

  constructor(initials: IAsyncSelectItem[] = []) {
    initials.forEach((embedding) =>
      this.embeddings.set(embedding.id, embedding),
    );
  }

  getEmbeddingsHandler() {
    return http.get(
      '/super-api/organizations/:organizationId/models/embeddings',
      () => {
        return HttpResponse.json<{ data: IAsyncSelectItemList }>(
          { data: [...this.embeddings.values()] },
          { status: 200 },
        );
      },
    );
  }

  get handlers() {
    return [this.getEmbeddingsHandler()];
  }
}

export class ModelsHandlers {
  private models: Map<string | number, IFixtureAsyncSelectModel> = new Map();

  constructor(initials: IFixtureAsyncSelectModel[] = []) {
    initials.forEach((model) => this.models.set(model.id, model));
  }

  getModelsHandler() {
    return http.get(
      '/super-api/organizations/:organizationId/models',
      ({ request }) => {
        const url = new URL(request.url);
        const apiType = url.searchParams.get('api_type') ?? 'openai';

        return HttpResponse.json<{ data: IAsyncSelectItemList }>(
          {
            data: [...this.models.values()].filter(
              (model) => model.type === apiType,
            ),
          },
          { status: 200 },
        );
      },
    );
  }

  get handlers() {
    return [this.getModelsHandler()];
  }
}
