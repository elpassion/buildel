import { z } from "zod";
import type { Chat } from "./chat";
import { type ITrigger } from "./trigger";

export class TriggerFilter {
  constructor(private readonly chat: Chat) {}

  public async filter(
    baseTrigger: ITrigger,
    comparedTrigger: ITrigger
  ): Promise<ITrigger | null> {
    this.chat.addMessage({
      role: "system",
      content: `
You are a comparator.
I will send you two triggers. 

Your job is to compare them and return a json { "related": true } if they are related, { "related": false } otherwise. 
Keep in mind that the triggers can be of different types. Just because the types are the same doesn't mean they are related. 
Similarly, just because the types are different doesn't mean they are not related. Take a look at the content and make a decision based on that.

DO NOT RESPOND WITH ANYTHING ELSE. JUST THE JSON OBJECT. ie. { "related": true } or { "related": false }
`.trim(),
    });
    this.chat.addMessage({
      role: "user",
      content: `
$$$$$ Trigger 1 $$$$$

${TriggerFilter.formatTrigger(baseTrigger)}


$$$$$ Trigger 2 $$$$$

${TriggerFilter.formatTrigger(comparedTrigger)}
      `.trim(),
    });

    const message = await this.chat.generate(
      z.object({ related: z.boolean() })
    );

    const { related } = JSON.parse(message.content);

    if (related) {
      return comparedTrigger;
    } else {
      return null;
    }
  }

  private static formatTrigger(trigger: ITrigger): string {
    switch (trigger.type) {
      case "email_received":
        return JSON.stringify(
          {
            type: trigger.type,
            from: trigger.from,
            title: trigger.title,
            summary:
              "summary" in trigger ? trigger.summary : "No summary available",
          },
          null,
          2
        );
      default:
        return JSON.stringify(trigger, null, 2);
    }
  }
}
