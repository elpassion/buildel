export type Embedding = number[];

export type Document = {
  id: string;
  embedding: Embedding;
  metadata: { [key: string]: any };
};

export type Documents = Map<string, Document>;

export type WorkerData = {
  id: number;
  queryVector: Embedding;
  documents: Documents;
  top_k: number;
};

export type WorkerResult = {
  id: number;
  results: {
    index: number;
    similarity: number;
    document: Document;
  }[];
};

export type ResolveFunction = (value: unknown) => void;

export type Request = {
  resolve: ResolveFunction;
};

export type Requests = Map<number, Request>;
