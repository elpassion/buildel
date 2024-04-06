import type { Embedding } from "./types";

export function generateEmbeddings(query: string): Promise<Embedding> {
  return fetch("http://127.0.0.1:11434/api/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nomic-embed-text:latest",
      prompt: query,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      return data.embedding;
    })
    .catch((err) => {
      console.error(err);
    });
}
