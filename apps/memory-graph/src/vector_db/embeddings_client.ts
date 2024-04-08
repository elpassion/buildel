import OpenAI from "openai";
import type { Embedding } from "../types";

export interface IEmbeddingsClient {
  generate(texts: string[]): Promise<Embedding[]>;
}

export class EmbeddingsClient implements IEmbeddingsClient {
  private readonly openAi = new OpenAI({
    apiKey: EmbeddingsClient.getOpenAIApiKey(),
  });

  public async generate(texts: string[]): Promise<Embedding[]> {
    const completion = await this.openAi.embeddings.create({
      input: texts,
      model: "text-embedding-3-small",
    });
    return completion.data.map((embeddings) => embeddings.embedding);
  }

  private static getOpenAIApiKey(): string {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Provide env OPENAI_API_KEY");
    return apiKey;
  }
}

export class OLLAEmbeddingsClient implements IEmbeddingsClient {
  public async generate(texts: string[]): Promise<Embedding[]> {
    return await Promise.all(texts.map((text) => this.generateEmbedding(text)));
  }

  private async generateEmbedding(text: string): Promise<Embedding> {
    const response = await fetch("http://127.0.0.1:11434/api/embeddings", {
      method: "POST",
      body: JSON.stringify({ model: "nomic-embed-text:latest", prompt: text }),
    });

    if (!response.ok) throw new Error("Failed to generate embedding");

    const data = await response.json();

    return data.embedding;
  }
}
