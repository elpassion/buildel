import { fetchTyped } from "~/utils/fetch.server";
import {
  ICreateUpdateSecretSchema,
  SecretKeyListResponse,
  SecretKeyResponse,
} from "./secrets.contracts";
import { z } from "zod";

export class SecretsApi {
  constructor(private client: typeof fetchTyped) {}

  async getSecrets(organizationId: string | number) {
    return this.client(
      SecretKeyListResponse,
      `/organizations/${organizationId}/secrets`
    );
  }

  async deleteSecret(organizationId: string | number, name: string) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/secrets/${name}`,
      { method: "DELETE" }
    );
  }

  async updateSecret(
    organizationId: string | number,
    data: ICreateUpdateSecretSchema
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/secrets/${data.name}`,
      { method: "PUT", body: JSON.stringify({ value: data.value }) }
    );
  }

  async createSecret(
    organizationId: string | number,
    data: ICreateUpdateSecretSchema
  ) {
    return this.client(
      SecretKeyResponse,
      `/organizations/${organizationId}/secrets`,
      { method: "POST", body: JSON.stringify(data) }
    );
  }
}
