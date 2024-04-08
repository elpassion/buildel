import { test, expect } from "bun:test";
import { MemoryGraph } from "./memory_graph/memory_graph";
import { EmbeddingsService } from "./vector_db/embeddings";
import { OLLAEmbeddingsClient } from "./vector_db/embeddings_client";
// ideas:
// in background analyze triggers, build summaries, scenarios

// create trigger - email_received
// search for similar triggers
// type 0-1
// email_trigger -> from, body
// traverse graph for triggers -> look at reactions
// return top x reactions (format them for better context understanding)
//   based on reactions decide on your own reaction
//   react - save reaction

test("works e2e", async () => {
  const service = new MemoryGraph({
    embeddings: new EmbeddingsService(new OLLAEmbeddingsClient()),
  });

  const trigger = await service.saveEmailTrigger({
    type: "email_received",
    from: "michal@gmail.com",
    body: "to jest pierwszy event",
  });
  const trigger2 = await service.saveEmailTrigger({
    type: "email_received",
    from: "michal@gmail.com",
    body: "to jest drugi event",
  });

  const trigger3 = await service.saveEmailTrigger({
    type: "email_received",
    from: "michal@gmail.com",
    body: "to jest trzeci event",
  });

  const results = await service.searchForEmailTriggers(
    "to jest trzeci event",
    5
  );

  console.log(results);
});
