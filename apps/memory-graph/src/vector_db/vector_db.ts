import type { Document, Embedding } from "../types";
import type { IVectorDBClient } from "./vector_db_client";

export class VectorDB {
  constructor(private readonly vectorDbClient: IVectorDBClient) {}
  get(id: string): Document | undefined {
    return this.vectorDbClient.get(id);
  }

  async add(document: Document) {
    return this.vectorDbClient.add(document);
  }

  query(
    queryVector: Embedding,
    top_k: number = 10
  ): Promise<{ documents: { similarity: number; document: Document }[] }> {
    return this.vectorDbClient.query(queryVector, top_k);
  }
}
