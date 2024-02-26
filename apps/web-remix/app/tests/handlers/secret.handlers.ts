import { http, HttpResponse } from "msw";
import { ISecretKey } from "~/components/pages/secrets/variables.types";

export class SecretsHandlers {
  private secrets: Map<string | number, ISecretKey> = new Map();

  constructor(initials: ISecretKey[] = []) {
    initials.forEach((secret) => this.secrets.set(secret.id, secret));
  }

  getSecretsHandler() {
    return http.get("/super-api/organizations/:organizationId/secrets", () => {
      return HttpResponse.json<{ data: ISecretKey[] }>(
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
        const transformed: ISecretKey = {
          id: data.value,
          name: data.name,
          created_at: "07/02/2024 11:35",
          updated_at: "07/02/2024 11:35",
        };

        this.secrets.set(data.value, transformed);

        return HttpResponse.json({ data: transformed }, { status: 200 });
      }
    );
  }

  deleteHandler() {
    return http.delete(
      "/super-api/organizations/:organizationId/secrets/:secretId",
      async ({ params }) => {
        this.secrets.delete(params.secretId.toString());

        return HttpResponse.json({}, { status: 200 });
      }
    );
  }

  updateHandler() {
    return http.put(
      "/super-api/organizations/:organizationId/secrets/:secretId",
      async ({ params, request }) => {
        const secret = this.secrets.get(params.secretId.toString());

        if (!secret) {
          return HttpResponse.json(
            {},
            {
              status: 404,
            }
          );
        }

        this.secrets.set(params.secretId.toString(), {
          ...secret,
          updated_at: "07/02/2024 00:00:00",
        });
        return HttpResponse.json({}, { status: 200 });
      }
    );
  }

  get handlers() {
    return [
      this.getSecretsHandler(),
      this.createHandler(),
      this.deleteHandler(),
      this.updateHandler(),
    ];
  }
}
