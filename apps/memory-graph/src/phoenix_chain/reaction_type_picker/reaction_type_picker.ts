import { z } from "zod";
import type { Chat } from "../../chain/chat";
import type { IReaction } from "../../chain/reaction";
import { type IEnhancedTrigger } from "../../chain/trigger";
import type { IEnhancedTriggerWithReactions } from "../../types";
import { Logger } from "../../logger";

export class ReactionTypePicker {
  constructor(private readonly chat: Chat) {}

  public async pickReactionType(
    baseTrigger: IEnhancedTrigger,
    similarTriggers: IEnhancedTriggerWithReactions[]
  ): Promise<{ type: IReaction["type"]; reason: string }> {
    this.chat.addMessage({
      role: "system",
      content: ReactionTypePicker.systemMessage(),
    });
    const reactionsCount = similarTriggers.flatMap((t) => t.reactions).length;
    if (reactionsCount < 2) {
      Logger.debug(
        `Not enough similar reactions to determine. Found ${reactionsCount} reactions. Asking for help.`
      );
      return {
        type: "ask_for_help",
        reason: "Not enough similar reactions to determine. Asking for help.",
      };
    }

    similarTriggers.forEach((triggerWithReactions) => {
      triggerWithReactions.reactions.forEach((reaction) => {
        this.chat.addMessage({
          role: "user",
          content: ReactionTypePicker.userMessage(triggerWithReactions.trigger),
        });
        this.chat.addMessage({
          role: "assistant",
          content: JSON.stringify({
            type: reaction.metadata.type,
            reason: reaction.metadata.reason,
          }),
        });
      });
    });

    this.chat.addMessage({
      role: "user",
      content: ReactionTypePicker.userMessage(baseTrigger),
    });

    Logger.debug("Generating reaction type");

    const response = await this.chat.generate(
      z.object({
        type: z.union([
          z.literal("upload_invoice"),
          z.literal("archive_email"),
          z.literal("respond_to_email"),
          z.literal("ask_for_help"),
        ]),
        reason: z.string(),
      })
    );

    Logger.debug(`Generated reaction type: ${response.type}`);

    return response;
  }

  protected static systemMessage() {
    return `
You are my personal assistant. Your job is to pick a reaction to the trigger you receive.

INSTRUCTIONS:

1. You will receive a trigger in a form: { type: "trigger_type", ...metadata }
2. Look at the trigger and try to understand it.
3. Based on that, decide on your own reaction.
4. Write it in a form of json: {"type": "reaction_type", "reason": "Why you picked this reaction"}.

ONLY AVAILABLE REACTIONS ARE:

- "upload_invoice": Upload an invoice. Use only if you have an invoice to upload. 
- "archive_email": This deletes the email. DO NOT ARCHIVE IF YOU DID NOT DO IT PREVIOUSLY.
- "respond_to_email": DON'T RESPOND IF YOU DID NOT DO IT PREVIOUSLY.
- "ask_for_help": Ask for help for the reaction because you don't know what to do.

If you want to pick a reaction type just do it. Do not ask for permission or if you should pick this specific one.

DO NOT USE ANY REACTIONS OTHER THEN THE ONES ABOVE: ["upload_invoice", "archive_email", "ask_for_help"].

RETURN ONLY THE JSON. DO NOT ADD ANY ADDITIONAL TEXT.
`.trim();
  }

  protected static userMessage(trigger: IEnhancedTrigger) {
    return `
${ReactionTypePicker.formatTriggerMessage({ trigger: trigger })}
  `.trim();
  }

  private static formatTriggerMessage({
    trigger,
  }: {
    trigger: IEnhancedTrigger;
  }) {
    let message = "$$$$$ Trigger $$$$$\n\n";

    switch (trigger.type) {
      case "email_received":
        message += JSON.stringify({
          type: trigger.type,
          from: trigger.from,
          title: trigger.title,
          summary: trigger.summary,
        });
        break;

      default:
        message += JSON.stringify(trigger, null, 2);
    }
    return message;
  }
}
