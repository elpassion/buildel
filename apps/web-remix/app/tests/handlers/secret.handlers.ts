import { http, HttpResponse } from 'msw';

import type { ISecretKey } from '~/components/pages/secrets/variables.types';

export class SecretsHandlers {
  private secrets: Map<string | number, ISecretKey> = new Map();

  constructor(initials: ISecretKey[] = []) {
    initials.forEach((secret) => this.secrets.set(secret.id, secret));
  }

  getSecretsHandler() {
    return http.get('/super-api/organizations/:organizationId/secrets', () => {
      return HttpResponse.json<{ data: ISecretKey[] }>(
        { data: [...this.secrets.values()] },
        { status: 200 },
      );
    });
  }

  createHandler() {
    return http.post<any, { name: string; value: string }>(
      '/super-api/organizations/:organizationId/secrets',
      async ({ request }) => {
        const data = await request.json();
        const transformed: ISecretKey = {
          id: data.value,
          name: data.name,
          created_at: '07/02/2024 11:35',
          updated_at: '07/02/2024 11:35',
          alias: null,
          hidden_value: '********',
        };

        this.secrets.set(data.value, transformed);

        return HttpResponse.json({ data: transformed }, { status: 200 });
      },
    );
  }

  deleteHandler() {
    return http.delete(
      '/super-api/organizations/:organizationId/secrets/:secretId',
      async ({ params }) => {
        this.secrets.delete(params.secretId.toString());

        return HttpResponse.json({}, { status: 200 });
      },
    );
  }

  updateHandler() {
    return http.put(
      '/super-api/organizations/:organizationId/secrets/:secretId',
      async ({ params }) => {
        const secret = this.secrets.get(params.secretId.toString());

        if (!secret) {
          return HttpResponse.json(
            {},
            {
              status: 404,
            },
          );
        }

        this.secrets.set(params.secretId.toString(), {
          ...secret,
          updated_at: '2024-01-01T13:00:00',
        });
        return HttpResponse.json({}, { status: 200 });
      },
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

export const secretAliasesHandles = () => {
  return [
    http.get('/super-api/organizations/2/secrets/aliases', () => {
      return HttpResponse.json({ data: [] }, { status: 200 });
    }),
  ];
};
