import { z } from "zod";
import type { Chat } from "../../chain/chat";
import type { IReaction, ISendEmailReaction } from "../../chain/reaction";
import { type IEnhancedTrigger } from "../../chain/trigger";
import type { IEnhancedTriggerWithReactions } from "../../types";
import { BaseReactionCreator } from "./base";
import { Logger } from "../../logger";

export class EmailReactionCreator extends BaseReactionCreator {
  constructor(private readonly chat: Chat) {
    super();
  }

  async create(args: {
    reactionType: IReaction["type"];
    reactionReason: string;
    trigger: IEnhancedTrigger;
    relatedTriggersWithReactions: IEnhancedTriggerWithReactions[];
  }): Promise<ISendEmailReaction> {
    Logger.debug("Creating email reaction");

    this.chat.addMessage({
      role: "system",
      content: EmailReactionCreator.systemMessage(),
    });
    args.relatedTriggersWithReactions.forEach((relatedTrigger) => {
      relatedTrigger.reactions.forEach((reaction) => {
        if (reaction.metadata.type !== "respond_to_email") return;
        this.chat.addMessage({
          role: "user",
          content: EmailReactionCreator.userMessage(
            relatedTrigger.trigger,
            reaction.metadata.reason
          ),
        });
        this.chat.addMessage({
          role: "assistant",
          content: EmailReactionCreator.assistantMessage(reaction.metadata),
        });
      });
    });

    this.chat.addMessage({
      role: "user",
      content: EmailReactionCreator.userMessage(
        args.trigger,
        args.reactionReason
      ),
    });

    const email = await this.chat.generate(
      z.object({ email: z.string(), subject: z.string(), body: z.string() })
    );

    Logger.debug(`Generated email: ${JSON.stringify(email)}`);

    return {
      type: "respond_to_email",
      reason: args.reactionReason,
      email: email.email,
      subject: email.subject,
      body: email.body,
    };
  }

  static userMessage(
    trigger: IEnhancedTrigger,
    reactionReason: string
  ): string {
    let message = `Reason for writing email: ${reactionReason}\n Trigger:`;
    switch (trigger.type) {
      case "email_received":
        message += JSON.stringify({
          type: trigger.type,
          title: trigger.title,
          from: trigger.from,
          summary: trigger.summary,
        });
        break;
      case "feedback_received":
        message += JSON.stringify(trigger);
    }

    return message;
  }

  static assistantMessage(reaction: ISendEmailReaction): string {
    const { email, subject, body } = reaction;
    return JSON.stringify({ email, subject, body }, null, 2);
  }

  protected static systemMessage() {
    return `
You are an email writing specialist. 

INSTRUCTIONS:
1. I will provide you with a trigger that caused me to ask you to write an email.
2. You need to write an email in response to the trigger.
3. The email should be written in a json format like so: { "email": "example@example.com", "subject": "Example subject", "body": "Example body of the email" }.

If you want to write an email just do it. Do not ask for permission or if you should write this specific one.

DO NOT RESPOND WITH ANYTHING ELSE. JUST THE JSON OBJECT.
    `;
  }
}
