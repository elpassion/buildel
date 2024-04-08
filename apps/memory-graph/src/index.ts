import { swagger } from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import { Chat } from "./chain/chat";
import { ChatClient, OLLAMAChatClient } from "./chain/chat_client";
import { Memory } from "./chain/memory";
import { Trigger } from "./chain/trigger";
import { MemoryGraph } from "./memory_graph/memory_graph";
import { Phoenix } from "./phoenix";
import { EmbeddingsService } from "./vector_db/embeddings";
import { OLLAEmbeddingsClient } from "./vector_db/embeddings_client";

const memoryGraph = new MemoryGraph({
  embeddings: new EmbeddingsService(new OLLAEmbeddingsClient()),
});

new Elysia()
  .post(
    "/triggers",
    async ({ body: trigger }) => {
      const service = new Phoenix(
        memoryGraph,
        new Chat({ chat: new OLLAMAChatClient(), memory: new Memory() })
      );

      await service.handleTrigger(Trigger.parse(trigger));
    },
    {
      body: t.Union([
        t.Object({
          type: t.Const("email_received"),
          from: t.String(),
          body: t.String(),
          title: t.String(),
        }),
      ]),
    }
  )
  .use(swagger())
  .listen(3000);
