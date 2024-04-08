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
}
