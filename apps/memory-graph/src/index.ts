import db from "neo4j-driver";
import { Elysia, t } from "elysia";
import { generateEmbeddings } from "./embeddings";
import { VectorDB } from "./db";
import { swagger } from "@elysiajs/swagger";

const driver = db.driver("bolt://localhost:7687");

const vectorDB = new VectorDB();

new Elysia()
  .post(
    "/saveTrigger",
    async ({ body: { type, body, from } }) => {
      const embedding = await generateEmbeddings(
        `from: ${from}\n body: ${body}`
      );
      const id = Math.floor(Math.random() * 10000).toString();

      const document = {
        id,
        embedding,
        metadata: {
          body,
          from,
          type,
          embedding,
        },
      };

      vectorDB.add(document);

      await driver.executeQuery(
        `
      MERGE (t:Trigger { id: $id, type: $type })
      RETURN t.id as id
      `,
        {
          id: Math.floor(Math.random() * 10000).toString(),
          type,
        }
      );
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
  .post(
    "/add",
    async ({ body: { text, type } }) => {
      const embedding = await generateEmbeddings(text);
      const id = Math.floor(Math.random() * 10000).toString();

      const document = {
        id,
        embedding,
        metadata: {
          text,
          type,
          embedding,
        },
      };

      vectorDB.add(document);

      await driver.executeQuery(
        `
        MERGE (d:$type { id: $id, body: $body })
        RETURN d.id as id
        `,
        {
          id,
          type,
          body: text,
        }
      );

      return document;
    },
    {
      body: t.Object({ text: t.String(), type: t.String() }),
    }
  )
  .post(
    "/query",
    async ({ body: { query } }) => {
      const embedding = await generateEmbeddings(query);
      const closestDocuments = await vectorDB.query(embedding);

      return {};
    },
    {
      body: t.Object({ query: t.String() }),
    }
  )
  .use(swagger())
  .listen(3000);
