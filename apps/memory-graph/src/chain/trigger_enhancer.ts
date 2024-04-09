import { z } from "zod";
import type { Chat } from "./chat";
import {
  EmailTriggerWithSummary,
  type EmailTrigger,
  type ITrigger,
} from "./trigger";

export class TriggerEnhancer {
  constructor(private readonly chat: Chat) {}

  public async enhance(trigger: ITrigger): Promise<ITrigger> {
    if (trigger.type === "email_received") {
      return await this.enhanceEmailTrigger(trigger);
    }
    return trigger;
  }

  private async enhanceEmailTrigger(trigger: z.infer<typeof EmailTrigger>) {
    this.chat.addMessage({
      role: "system",
      content:
        "You are an email summarizer. I will send you an email. Your job is to summarize it in 5 sentences. Send me back the summary in a json format like so: { summary: 'Your summary here' }.",
    });
    this.chat.addMessage({ role: "user", content: `Email:\n ${trigger.body}` });
    const message = await this.chat.generate(z.object({ summary: z.string() }));

    const summary = JSON.parse(message.content).summary;

    return EmailTriggerWithSummary.parse({
      ...trigger,
      summary: summary.trim(),
    });
  }
}
