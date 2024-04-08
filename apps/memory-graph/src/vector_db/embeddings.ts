import type { IEmbeddingsClient } from "./embeddings_client";

export class EmbeddingsService {
  constructor(private readonly client: IEmbeddingsClient) {}

  public generate(texts: string[]) {
    return this.client.generate(texts);
  }
}
