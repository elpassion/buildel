import type { IGraphDBClient } from "./graph_db_client";

export class GraphDB {
  constructor(private readonly graphDBClient: IGraphDBClient) {}

  query(query: string, params: Record<string, any> = {}): Promise<any> {
    return this.graphDBClient.query(query, params);
  }

  upsertNode({
    id,
    type,
    metadata,
  }: {
    id: string;
    type: string;
    metadata: Record<string, any>;
  }) {
    return this.graphDBClient.query(
      `
      MERGE (t:$type { id: $id, type: $type, metadata: $metadata })
      RETURN t.id as id
      `,
      {
        id,
        type,
        metadata,
      }
    );
  }

  upsertRelation(data: { from: string; to: string; type: string }) {
    return this.graphDBClient.query(
      `
      MATCH (from { id: $from }), (to { id: $to })
      MERGE (from)-[r:${data.type} { type: $type }]->(to)
      RETURN r
      `,
      data
    );
  }

  async getRelationsToType(data: {
    id: string;
    relatedToNodeType: string;
    relationType: string;
  }) {
    const result = await this.graphDBClient.query(
      `
      MATCH (from { id: $id })-[r:${data.relationType} { type: $relationType }]->(to:$relatedToNodeType)
      RETURN to
      `,
      data
    );
    return result.records.map((r: any) => r.toObject().to.properties);
  }
}
