import {} from '~/contracts';
import { HttpClient, createHttpClient } from '~/utils';

export class OrganizationsApi {
  public baseUrl = () => `/organizations`;
  private client: HttpClient;

  constructor(client: HttpClient = createHttpClient()) {
    this.client = client;
  }

  getAll() {
    // return this.client.get<{ data: any[] }>(`${this.baseUrl()}`);
    return Promise.resolve(['1']);
  }

  get(organizationId: string) {
    // return this.client.get<any>(`${this.baseUrl()}/${organizationId}`);
    return Promise.resolve({});
  }

  create(organizationId: string, payload: any) {
    return this.client.post<any>(
      `${this.baseUrl()}/${organizationId}`,
      payload,
    );
  }

  delete(organizationId: string) {
    return this.client.delete(`${this.baseUrl()}/${organizationId}`);
  }
}

export const organizationsApi = new OrganizationsApi();
