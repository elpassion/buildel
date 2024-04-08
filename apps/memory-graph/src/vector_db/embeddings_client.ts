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
