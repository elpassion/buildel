import type { Embedding, WorkerData } from "./types";

// prevents TS errors
declare var self: Worker;

self.onmessage = (event) => {
  const { id, queryVector, documents, top_k } = event.data as WorkerData;
  const results = new Array();

  const cosineSimilarity = (A: Embedding, B: Embedding) => {
    let dotproduct = 0;
    let mA = 0;
    let mB = 0;

    for (let i = 0; i < A.length; i++) {
      dotproduct += A[i] * B[i];
      mA += A[i] * A[i];
      mB += B[i] * B[i];
    }

    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);

    return dotproduct / (mA * mB);
  };

  for (let doc of documents) {
    results.push({
      similarity: cosineSimilarity(queryVector, doc[1].embedding),
      document: doc[1],
    });
  }

  results.sort((a, b) => b.similarity - a.similarity);

  self.postMessage({ id, results: results.slice(0, top_k) });
};
