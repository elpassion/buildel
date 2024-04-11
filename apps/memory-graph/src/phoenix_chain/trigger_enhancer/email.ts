import { z } from "zod";
import type { Chat } from "../../chain/chat";
import {
  EmailTriggerWithSummary,
  type IEmailTrigger,
  type IEmailTriggerWithSummary,
} from "../../chain/trigger";
import { BaseTriggerEnhancer } from "./base";
import { Logger } from "../../logger";

export class EmailTriggerEnhancer extends BaseTriggerEnhancer {
  constructor(private readonly chat: Chat) {
    super();
  }

  async enhance(trigger: IEmailTrigger): Promise<IEmailTriggerWithSummary> {
    Logger.info(`Enhancing email trigger: ${trigger.title}`);

    this.chat.addMessage({
      role: "system",
      content: `
You are an email summarizer. I will send you an email. 
Your job is to summarize it in 5 sentences. 
Send me back the summary in a json format like so: { "summary": "Your summary here" }.
DO NOT RESPOND WITH ANYTHING ELSE. JUST THE JSON OBJECT IN A FORMAT: { "summary": "Your summary here" }.
`.trim(),
    });
    const exampleEmail = `
Hello, I am writing to you to ask for help.
I have a problem with my computer.
It is not turning on.
I would appreciate your help.
Thank you.
    `.trim();

    const exampleEmailSummary = `
The user is asking for help with their computer.
The computer is not turning on.
The user would appreciate help.
`.trim();

    this.chat.addMessage({ role: "user", content: `Email:\n ${exampleEmail}` });

    this.chat.addMessage({
      role: "assistant",
      content: JSON.stringify({ summary: exampleEmailSummary }),
    });

    this.chat.addMessage({
      role: "user",
      content: `Email:\n ${trigger.body.replaceAll(
        new RegExp(/<https?:\/\/.*>/g),
        "URL"
      )}`,
    });

    const message = await this.chat.generate(z.object({ summary: z.string() }));

    const summary = message.summary;

    Logger.info(
      `Enhanced email trigger: ${trigger.title} with summary: ${summary}`
    );

    return EmailTriggerWithSummary.parse({
      ...trigger,
      body: trigger.body.replaceAll(new RegExp(/<https?:\/\/.*>/g), "URL"),
      summary: summary.trim(),
    });
  }
}
