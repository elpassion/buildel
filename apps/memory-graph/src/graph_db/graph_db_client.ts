import db, { Driver } from "neo4j-driver";

export interface IGraphDBClient {
  query(query: string, params?: Record<string, any>): Promise<any>;
}

export class GraphClient implements IGraphDBClient {
  constructor(
    private readonly driver: Driver = db.driver("bolt://localhost:7687")
  ) {}

  query(query: string, params: Record<string, any> = {}): Promise<any> {
    return this.driver.executeQuery(query, params);
  }
}
