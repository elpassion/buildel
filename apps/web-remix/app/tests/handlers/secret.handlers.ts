import { http, HttpResponse } from "msw";
import { IAsyncSelectItem, IAsyncSelectItemList } from "~/api/AsyncSelectApi";
import { secretFixture } from "~/tests/fixtures/secrets.fixtures";

export class SecretsHandlers {
  private secrets: Map<string | number, IAsyncSelectItem> = new Map();

  constructor(initials: IAsyncSelectItem[] = []) {
    initials.forEach((secret) => this.secrets.set(secret.id, secret));
    // this.secrets.set(secretFixture().id, secretFixture());
    // this.secrets.set("Test", secretFixture({ name: "Test", id: "Test" }));
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
