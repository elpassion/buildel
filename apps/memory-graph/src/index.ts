import { swagger } from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import { EmailTrigger } from "./chain/trigger";
import { MemoryGraph } from "./memory_graph/memory_graph";

new Elysia()
  .post(
    "/triggers",
    async ({ body: trigger }) => {
      return new MemoryGraph().saveEmailTrigger(EmailTrigger.parse(trigger));
    },
    {
      body: t.Union([
        t.Object({
          type: t.Const("email_received"),
          from: t.String(),
          body: t.String(),
        }),
      ]),
    }
  )
  .use(swagger())
  .listen(3000);
