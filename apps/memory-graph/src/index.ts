import { swagger } from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import { Chat } from "./chain/chat";
import { OLLAMAChatClient } from "./chain/chat_client";
import { Memory } from "./chain/memory";
import { Trigger } from "./chain/trigger";
import { MemoryGraph } from "./memory_graph/memory_graph";
import { Phoenix } from "./phoenix";
import { EmbeddingsService } from "./vector_db/embeddings";
import { OLLAEmbeddingsClient } from "./vector_db/embeddings_client";
import { Reaction } from "./chain/reaction";
import { TriggerEnhancer } from "./phoenix_chain/trigger_enhancer/trigger_enhancer";
import { TriggerFilter } from "./phoenix_chain/trigger_filter/trigger_filter";
import { VectorDB } from "./vector_db/vector_db";
import { VectorDBClient } from "./vector_db/vector_db_client";
import { EmailTriggerEnhancer } from "./phoenix_chain/trigger_enhancer/email";
import { ReactionTypePicker } from "./phoenix_chain/reaction_type_picker/reaction_type_picker";
import { ReactionCreator } from "./phoenix_chain/reaction_creator/reaction_creator";
import { EmailReactionCreator } from "./phoenix_chain/reaction_creator/email";
import { HelpCreator } from "./phoenix_chain/reaction_creator/help";

const vectorDbClient = new VectorDBClient();

vectorDbClient.loadFile("data.json");

process.on("SIGINT", () => {
  vectorDbClient.dumpFile("data.json").then(() => {
    console.log("Data saved to data.json");
    console.log("Exiting...");
    process.exit();
  });
});

const memoryGraph = new MemoryGraph({
  embeddings: new EmbeddingsService(new OLLAEmbeddingsClient()),
  vectorDB: new VectorDB(vectorDbClient),
});

const buildPhoenix = () => {
  return new Phoenix(
    memoryGraph,
    new Chat({
      chat: new OLLAMAChatClient({ maxTokens: 1000 }),
      memory: new Memory(),
    }),
    new TriggerEnhancer({
      email: new EmailTriggerEnhancer(
        new Chat({ chat: new OLLAMAChatClient(), memory: new Memory() })
      ),
    }),
    new TriggerFilter(
      new Chat({
        chat: new OLLAMAChatClient({ maxTokens: 50 }),
        memory: new Memory(),
      })
    ),
    new ReactionTypePicker(
      new Chat({ chat: new OLLAMAChatClient(), memory: new Memory() })
    ),
    new ReactionCreator({
      email: new EmailReactionCreator(
        new Chat({ chat: new OLLAMAChatClient(), memory: new Memory() })
      ),
      help: new HelpCreator(
        new Chat({ chat: new OLLAMAChatClient(), memory: new Memory() })
      ),
    })
  );
};

new Elysia()
  .post(
    "/triggers",
    async ({ body: trigger }) => {
      console.log("Received trigger:", trigger);
      const service = buildPhoenix();

      const response = await service.handleTrigger(Trigger.parse(trigger));

      return response;
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
  .get("/reactions", async () => {
    return await memoryGraph.getReactionsWaitingForHelp();
  })
  .post(
    "/reactions/:reactionId/help",
    async ({ body: reaction, params: { reactionId } }) => {
      console.log("Resolving reaction with id:", reactionId);

      const service = buildPhoenix();

      const parsedReaction = Reaction.parse(reaction);

      const result = await service.resolveAskForHelp(
        reactionId,
        parsedReaction
      );

      console.log("Resolved reaction:", parsedReaction);

      return result;
    },
    {
      body: t.Object({ type: t.String() }, { additionalProperties: true }),
      params: t.Object(
        {
          reactionId: t.String(),
        },
        { additionalProperties: true }
      ),
    }
  )
  .use(swagger())
  .listen(3000);

console.log("🐦‍🔥 Phoenix is listening on port 3000 🐦‍🔥");
