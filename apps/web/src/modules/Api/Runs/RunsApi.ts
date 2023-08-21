import { HttpClient, createHttpClient } from '~/utils';

export class RunsApi {
  public baseUrl = `/runs`;
  private client: HttpClient;

  constructor(client: HttpClient = createHttpClient()) {
    this.client = client;
  }
}
