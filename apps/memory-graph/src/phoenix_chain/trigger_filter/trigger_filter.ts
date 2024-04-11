import { z } from "zod";
import type { Chat } from "../../chain/chat";
import { type IEnhancedTrigger } from "../../chain/trigger";
import type { IEnhancedTriggerWithReactions } from "../../types";
import { Logger } from "../../logger";

export class TriggerFilter {
  constructor(private readonly chat: Chat) {}

  public async filterMultiple(
    baseTrigger: IEnhancedTrigger,
    comparedTriggers: IEnhancedTriggerWithReactions[]
  ): Promise<IEnhancedTriggerWithReactions[]> {
    Logger.debug(
      `Filtering triggers for relatedness to trigger ${baseTrigger.type}`
    );

    const relatedTriggers: IEnhancedTriggerWithReactions[] = [];

    for (const comparedTrigger of comparedTriggers) {
      const relatedTrigger = await this.filter(
        baseTrigger,
        comparedTrigger.trigger
      );

      if (relatedTrigger) {
        relatedTriggers.push(comparedTrigger);
      }
    }

    Logger.debug(
      `\nFound ${relatedTriggers.length} related triggers for trigger ${baseTrigger.type}\n`
    );

    return relatedTriggers;
  }

  private async filter(
    baseTrigger: IEnhancedTrigger,
    comparedTrigger: IEnhancedTrigger
  ): Promise<IEnhancedTrigger | null> {
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

    const { related } = message;

    if (related) {
      return comparedTrigger;
    } else {
      return null;
    }
  }

  private static formatTrigger(trigger: IEnhancedTrigger): string {
    switch (trigger.type) {
      case "email_received":
        return JSON.stringify(
          {
            type: trigger.type,
            from: trigger.from,
            title: trigger.title,
            summary: trigger.summary,
          },
          null,
          2
        );
      default:
        return JSON.stringify(trigger, null, 2);
    }
  }
}
