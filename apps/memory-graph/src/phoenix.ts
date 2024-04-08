import type { Chat } from "./chain/chat";
import { Reaction, type IReaction } from "./chain/reaction";
import type { ITrigger } from "./chain/trigger";
import type { MemoryGraph } from "./memory_graph/memory_graph";

export class Phoenix {
  constructor(
    private readonly memoryGraph: MemoryGraph,
    private readonly chat: Chat
  ) {}

  public async handleTrigger(trigger: ITrigger) {
    const results = await this.memoryGraph.searchForTriggersWithReactions(
      this.memoryGraph.formatTrigger(trigger),
      3
    );

    await this.chat.addMessage({
      content: Phoenix.systemMessage(),
      role: "system",
    });

    await this.chat.addMessage({
      content: Phoenix.userMessage(trigger, results.triggersWithReactions),
      role: "user",
    });

    const response = await this.chat.generate(Reaction);

    const reaction = JSON.parse(response.content);

    const parsedReaction = Reaction.parse(reaction);

    const triggerToSave = await this.memoryGraph.saveTrigger(trigger);

    await this.memoryGraph.saveReactionToTrigger({
      triggerId: triggerToSave.id,
      reaction: parsedReaction,
    });

    await this.memoryGraph.connectTriggerWithQuery({
      queryId: results.queryId,
      triggerId: triggerToSave.id,
    });
  }

  protected static userMessage(
    trigger: ITrigger,
    similarTriggersWithReactions: {
      trigger: ITrigger;
      reactions: IReaction[];
    }[]
  ) {
    return `
    --- Trigger ---
  ${Phoenix.formatTriggerMessage({ trigger: trigger, reactions: [] })}

  --- Similar triggers ---
  ${similarTriggersWithReactions.map((triggerWithReactions) =>
    Phoenix.formatTriggerMessage(triggerWithReactions)
  )}
    `;
  }

  protected static systemMessage() {
    return `
    You are my personal assistant. Your job is to react to triggers I send you.
  
    You will receive a trigger in a form: {type: "event_type", ...metadata}.
    
    Your job is to react to the trigger.
  
    First of all, look at the trigger and try to understand it.
    Then, look at the reactions to similar triggers and see how they were reacted to.
    If no similar triggers are found, create a new reaction of type "request_approval" in a form:
    - request_approval: Request approval for the reaction. { type: "request_approval", message: "I have no idea what to do" }
  
    If similar triggers are found, look at the reactions to them.
    Based on that, decide on your own reaction.
    Write it in a form of json: {type: "reaction_type", ...metadata}.
  
    Available reaction types:
    - upload_invoice: Upload an invoice. { "type": "upload_invoice", "invoice": "Invoice number" }
    - request_approval: Request approval for the reaction. { "type": "request_approval", "message": "I have no idea what to do" }

    RETURN ONLY THE JSON. DO NOT ADD ANY ADDITIONAL TEXT.

    ie.

    { "type": "request_approval", "message": "I have no idea what to do"}
    `;
  }

  private static formatTriggerMessage({
    trigger,
    reactions,
  }: {
    trigger: ITrigger;
    reactions: IReaction[];
  }) {
    switch (trigger.type) {
      case "email_received":
        return `
          Email from: ${trigger.from}
          Body: ${trigger.body}
  
          ${reactions.length ? "Reactions:" : ""}
          ${reactions.map(this.formatReaction).join("\n")}
          `;
    }
    return "Unknown trigger type";
  }

  private static formatReaction(reaction: IReaction) {
    switch (reaction.type) {
      case "send_log":
        return `send_log: ${reaction.log}`;
      case "upload_invoice":
        return `upload_invoice: ${reaction.invoice}`;
      default:
        return `Unknown reaction type: ${reaction.type}`;
    }
  }
}
