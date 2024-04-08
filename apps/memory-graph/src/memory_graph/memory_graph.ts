import db from "neo4j-driver";
import { randomUUID } from "node:crypto";
import type { z } from "zod";
import { EmailTrigger } from "../chain/trigger";
import { GraphDB } from "../graph_db/graph_db";
import { GraphClient } from "../graph_db/graph_db_client";
import { EmbeddingsService } from "../vector_db/embeddings";
import { EmbeddingsClient } from "../vector_db/embeddings_client";
import { VectorDB } from "../vector_db/vector_db";
import { VectorDBClient } from "../vector_db/vector_db_client";

export class MemoryGraph {
  private readonly vectorDB: VectorDB;
  private readonly embeddings: EmbeddingsService;
  private readonly graphDB: GraphDB;

  constructor({
    vectorDB,
    embeddings,
    graphDB,
  }: {
    vectorDB?: VectorDB;
    embeddings?: EmbeddingsService;
    graphDB?: GraphDB;
  } = {}) {
    this.embeddings =
      embeddings || new EmbeddingsService(new EmbeddingsClient());
    this.vectorDB = vectorDB || new VectorDB(new VectorDBClient());
    this.graphDB = graphDB || new GraphDB(new GraphClient());
  }

  async saveEmailTrigger(trigger: z.infer<typeof EmailTrigger>) {
    const id = randomUUID();

    const [embedding] = await this.embeddings.generate([
      `
  from: ${trigger.from}
  body: ${trigger.body}
  `,
    ]);

    await this.vectorDB.add({ embedding, id, metadata: { event: trigger } });
    await this.graphDB.upsertNode({
      id,
      type: trigger.type,
      metadata: { event: trigger },
    });

    return { id };
  }

  async searchForEmailTriggers(query: string, top_k: number) {
    const [embedding] = await this.embeddings.generate([query]);

    const { documents } = await this.vectorDB.query(embedding, top_k);

    return documents.map((document) => {
      return {
        id: document.document.id,
        trigger: EmailTrigger.parse(document.document.metadata.event),
      };
    });
  }
}
