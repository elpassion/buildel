import db from "neo4j-driver";
import { randomUUID } from "node:crypto";
import type { z } from "zod";
import { EmailTrigger, type ITrigger } from "../chain/trigger";
import { GraphDB } from "../graph_db/graph_db";
import { GraphClient } from "../graph_db/graph_db_client";
import { EmbeddingsService } from "../vector_db/embeddings";
import { EmbeddingsClient } from "../vector_db/embeddings_client";
import { VectorDB } from "../vector_db/vector_db";
import { VectorDBClient } from "../vector_db/vector_db_client";
import type { IReaction } from "../chain/reaction";

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

  saveTrigger(trigger: ITrigger): Promise<{ id: string }> {
    switch (trigger.type) {
      case "email_received":
        return this.saveEmailTrigger(trigger);
      case "feedback_received":
        return this.saveFeedbackTrigger(trigger);
      default:
        throw new Error("Unknown trigger type");
    }
  }

  async saveEmailTrigger(trigger: z.infer<typeof EmailTrigger>) {
    const id = randomUUID();

    const [embedding] = await this.embeddings.generate([
      this.formatEmailTrigger(trigger),
    ]);

    await this.vectorDB.add({ embedding, id, metadata: { event: trigger } });
    await this.graphDB.upsertNode({
      id,
      type: "trigger",
      metadata: { event: trigger },
    });

    return { id };
  }

  formatTrigger(trigger: ITrigger): string {
    switch (trigger.type) {
      case "email_received":
        return this.formatEmailTrigger(trigger);
      default:
        throw new Error("Unknown trigger type");
    }
  }

  formatEmailTrigger(trigger: {
    type: "email_received";
    from: string;
    title: string;
    body: string;
  }): string {
    return `
  from: ${trigger.from}
  title: ${trigger.title}
  body: ${trigger.body}
  `;
  }

  saveFeedbackTrigger(trigger: {
    type: "feedback_received";
  }): Promise<{ id: string }> {
    throw new Error("Method not implemented.");
  }

  async saveReactionToHelpReaction({
    reactionId,
    reaction,
  }: {
    reactionId: string;
    reaction: IReaction;
  }) {
    const id = randomUUID();

    const [{ id: triggerId }] = await this.graphDB.getRelationsToType({
      id: reactionId,
      relatedToNodeType: "trigger",
      relationType: "ask_for_help",
    });

    await this.graphDB.upsertNode({
      id,
      type: "reaction",
      metadata: reaction,
    });

    await this.graphDB.upsertRelation({
      from: id,
      to: reactionId,
      type: "resolved_help",
      status: "resolved",
    });

    await this.graphDB.upsertRelation({
      from: triggerId,
      to: id,
      type: "reaction",
      status: "resolved",
    });

    await this.markAskForHelpAsResolved(reactionId);

    return { id };
  }

  async saveReactionToTrigger({
    reaction,
    triggerId,
  }: {
    triggerId: string;
    reaction: IReaction;
  }) {
    const id = randomUUID();

    await this.graphDB.upsertNode({
      id,
      type: "reaction",
      metadata: reaction,
    });

    const relationType =
      {
        ask_for_help: "ask_for_help",
        send_log: "reaction",
        upload_invoice: "reaction",
        archive_email: "reaction",
      }[reaction.type] || "reaction";

    const status = reaction.type === "ask_for_help" ? "pending" : "resolved";

    await this.graphDB.upsertRelation({
      from: triggerId,
      to: id,
      type: relationType,
      status,
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

  async searchForTriggersWithReactions(query: string, top_k: number) {
    const [embedding] = await this.embeddings.generate([query]);

    const { documents } = await this.vectorDB.query(embedding, top_k);

    const triggersWithReactions = await Promise.all(
      documents.map(async (document) => {
        const reactions = await this.graphDB.getRelationsToType({
          id: document.document.id,
          relatedToNodeType: "reaction",
          relationType: "reaction",
        });

        return {
          documentId: document.document.id,
          trigger: document.document.metadata.event,
          reactions: reactions,
        };
      })
    );

    const queryId = randomUUID();

    await this.graphDB.upsertNode({
      id: queryId,
      type: "query",
      metadata: { query },
    });

    await Promise.all(
      documents.map(async (document) => {
        await this.graphDB.upsertRelation({
          from: queryId,
          to: document.document.id,
          type: "query_result",
          status: "resolved",
        });
      })
    );

    return { triggersWithReactions, queryId };
  }

  async connectTriggerWithQuery({
    queryId,
    triggerId,
  }: {
    queryId: string;
    triggerId: string;
  }) {
    await this.graphDB.upsertRelation({
      from: triggerId,
      to: queryId,
      type: "trigger",
      status: "resolved",
    });
  }

  async markAskForHelpAsResolved(reactionId: string) {
    await this.graphDB.query(
      `
      MATCH (trigger)-[r:ask_for_help]->(reaction { id: $reactionId })
      SET r.status = "resolved"
      RETURN trigger, r, reaction
      `,
      { reactionId }
    );
  }

  async getReactionsWaitingForHelp(): Promise<
    { id: string; metadata: IReaction }[]
  > {
    const response = await this.graphDB.query(
      `
      MATCH (trigger)-[r:ask_for_help]->(reaction)
      WHERE r.status = "pending"
      RETURN reaction
      `
    );

    return response.records.map((r: any) => r.toObject().reaction.properties);
  }
}
