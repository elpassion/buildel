import { z } from "zod";
import type { Chat } from "../../chain/chat";
import type {
  IAskForHelpReaction,
  IReaction,
  ISendEmailReaction,
} from "../../chain/reaction";
import { type IEnhancedTrigger } from "../../chain/trigger";
import type { IEnhancedTriggerWithReactions } from "../../types";
import { BaseReactionCreator } from "./base";
import { Logger } from "../../logger";

export class HelpCreator extends BaseReactionCreator {
  constructor(private readonly chat: Chat) {
    super();
  }

  async create(args: {
    reactionType: IReaction["type"];
    trigger: IEnhancedTrigger;
    relatedTriggersWithReactions: IEnhancedTriggerWithReactions[];
  }): Promise<IAskForHelpReaction> {
    Logger.debug("Creating help reaction");

    this.chat.addMessage({
      role: "system",
      content: HelpCreator.systemMessage(),
    });
    args.relatedTriggersWithReactions.forEach((relatedTrigger) => {
      relatedTrigger.reactions.forEach((reaction) => {
        if (reaction.metadata.type !== "ask_for_help") return;
        this.chat.addMessage({
          role: "user",
          content: HelpCreator.userMessage(relatedTrigger.trigger),
        });
        this.chat.addMessage({
          role: "assistant",
          content: HelpCreator.assistantMessage(reaction.metadata),
        });
      });
    });

    this.chat.addMessage({
      role: "user",
      content: HelpCreator.userMessage(args.trigger),
    });

    const message = await this.chat.generate(z.object({ message: z.string() }));

    Logger.debug(`Generated message: ${JSON.stringify(message)}`);

    return {
      type: "ask_for_help",
      message: message.message,
    };
  }

  static userMessage(trigger: IEnhancedTrigger): string {
    switch (trigger.type) {
      case "email_received":
        return JSON.stringify({
          type: trigger.type,
          title: trigger.title,
          from: trigger.from,
          summary: trigger.summary,
        });
      case "feedback_received":
        return JSON.stringify(trigger);
    }
  }

  static assistantMessage(reaction: IAskForHelpReaction): string {
    return JSON.stringify(reaction);
  }

  protected static systemMessage() {
    return `
You are a help requesting assistant. 

INSTRUCTIONS:
1. I will provide you with a trigger that caused me to ask you to ask for help.
2. You need to write a reason for why you need help.
3. The help request needs to be returned in a form of json like this: { "message": "Message about why you asked for help" }.

If you want to write the request just do it. Do not ask for permission or if you should write this specific one.

DO NOT RESPOND WITH ANYTHING ELSE. JUST THE JSON OBJECT.
    `;
  }
}
