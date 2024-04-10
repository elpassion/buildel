import fs from "fs/promises";
import { Worker } from "worker_threads";
import type {
  Document,
  Documents,
  Embedding,
  Requests,
  WorkerResult,
} from "../types";

export interface IVectorDBClient {
  add(document: Document): Document;
  get(id: string): Document | undefined;
  query(
    queryVector: Embedding,
    top_k: number
  ): Promise<{ documents: { similarity: number; document: Document }[] }>;
}

export class VectorDBClient implements IVectorDBClient {
  private worker: Worker;
  private requests: Requests;
  private documents: Documents;

  constructor() {
    const workerURL = new URL("worker.ts", import.meta.url).href;

    this.worker = new Worker(workerURL);
    this.requests = new Map();
    this.documents = new Map();

    this.worker.on("message", (data: WorkerResult) => {
      const { id, results } = data;
      const { resolve } = this.requests.get(id) || {};
      if (resolve) {
        resolve(results);
        this.requests.delete(id);
      }
    });
  }

  add(document: Document): Document {
    this.documents.set(document.id, document);
    return this.documents.get(document.id)!;
  }

  get(id: string): Document | undefined {
    return this.documents.get(id);
  }

  del(document: Document): void {
    this.documents.delete(document.id);
  }

  size(): number {
    return this.documents.size;
  }

  async loadFile(filename: string) {
    if (!(await fs.exists(filename))) {
      await fs.writeFile(filename, "[]");
    }

    const dataBuffer = await fs.readFile(filename);
    const documents = JSON.parse(dataBuffer.toString());

    for (let doc of documents) {
      this.add(doc);
    }
  }

  async dumpFile(filename: string) {
    const jsonDump = JSON.stringify([...this.documents.values()]);
    await fs.writeFile(filename, jsonDump);
  }

  async query(
    queryVector: Embedding,
    top_k: number = 10
  ): Promise<{ documents: { similarity: number; document: Document }[] }> {
    const documents = this.documents;

    const response = (await new Promise((resolve) => {
      const id = Math.floor(Math.random() * 10000) + 1;
      // @ts-ignore
      this.requests.set(id, { resolve });
      this.worker.postMessage({
        id,
        queryVector,
        documents,
        top_k,
      });
    })) as { similarity: number; document: Document }[];

    return {
      documents: response,
    };
  }

  async terminate() {
    await this.worker.terminate();
  }
}
