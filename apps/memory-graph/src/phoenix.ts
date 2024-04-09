import type { Chat } from "./chain/chat";
import { Reaction, type IReaction } from "./chain/reaction";
import type { ITrigger } from "./chain/trigger";
import type { TriggerEnhancer } from "./chain/trigger_enhancer";
import type { TriggerFilter } from "./chain/trigger_filter";
import type { MemoryGraph } from "./memory_graph/memory_graph";

export class Phoenix {
  constructor(
    private readonly memoryGraph: MemoryGraph,
    private readonly chat: Chat,
    private readonly triggerEnhancer: TriggerEnhancer,
    private readonly triggerFilter: TriggerFilter
  ) {}

  public async handleTrigger(trigger: ITrigger) {
    console.log("Searching for triggers with similar reactions");
    const results = await this.memoryGraph.searchForTriggersWithReactions(
      this.memoryGraph.formatTrigger(trigger),
      3
    );

    console.log("Enhancing trigger");
    trigger = await this.triggerEnhancer.enhance(trigger);

    console.log("Filtering triggers similar to the trigger");
    const filteredTriggersWithReactions = [];
    for (const triggerWithReactions of results.triggersWithReactions) {
      if (
        !(await this.triggerFilter.filter(
          trigger,
          triggerWithReactions.trigger
        ))
      )
        continue;
      filteredTriggersWithReactions.push(triggerWithReactions);
    }

    await this.chat.addMessage({
      content: Phoenix.systemMessage(),
      role: "system",
    });

    await this.chat.addMessage({
      content: Phoenix.userMessage(trigger, filteredTriggersWithReactions),
      role: "user",
    });

    console.log("Generating reaction");

    const response = await this.chat.generate(Reaction);

    const reaction = JSON.parse(response.content);

    const parsedReaction = Reaction.parse(reaction);

    console.log("Saving reaction");

    const triggerToSave = await this.memoryGraph.saveTrigger(trigger);

    const reactionId = await this.memoryGraph.saveReactionToTrigger({
      triggerId: triggerToSave.id,
      reaction: parsedReaction,
    });

    await this.memoryGraph.connectTriggerWithQuery({
      queryId: results.queryId,
      triggerId: triggerToSave.id,
    });

    return {
      reactionId,
      triggerId: triggerToSave.id,
    };
  }

  public async resolveAskForHelp(reactionId: string, reaction: IReaction) {
    const { id } = await this.memoryGraph.saveReactionToHelpReaction({
      reactionId,
      reaction,
    });

    return {
      reactionId: id,
    };
  }

  protected static userMessage(
    trigger: ITrigger,
    similarTriggersWithReactions?: {
      trigger: ITrigger;
      reactions: { id: string; metadata: IReaction }[];
    }[]
  ) {
    return `
$$$$$ Trigger $$$$$

${Phoenix.formatTriggerMessage({ trigger: trigger })}

${Phoenix.formatSimilarTriggersWithReactions(similarTriggersWithReactions)}
  `.trim();
  }

  protected static systemMessage() {
    return `
You are my personal assistant. Your job is to react to triggers I send you.

You will receive a trigger in a form: { type: "trigger_type", ...metadata }

Your job is to react to the trigger.
  
First of all, look at the trigger and try to understand it.
Then, look at the reactions to similar triggers and see how they were reacted to.
If no similar triggers are found, create a new reaction of type "ask_for_help".

If similar triggers ARE found, look at the reactions given for them.
Based on that, decide on your own reaction.
Write it in a form of json: {type: "reaction_type", ...metadata}.

ONLY AVAILABLE REACTIONS ARE:
- upload_invoice: Upload an invoice. Use only if you have an invoice to upload. ie. { "type": "upload_invoice", "invoice": "Invoice number" }. 
- archive_email: This deletes the email. DO NOT ARCHIVE IF YOU DID NOT SEE IT DONE PREVIOUSLY WITH SIMILAR MESSAGES. ie. { "type": "archive_email", "reason": "Reason for archiving" }. 
- ask_for_help: Ask for help for the reaction because you don't know what to do. ie. { "type": "ask_for_help", "message": "I have no idea what to do" }

If you want to perform an action just do it. Do not ask for permission or if you should proceed.

DO NOT USE ANY REACTIONS OTHER THEN THE ONES ABOVE: ["upload_invoice", "archive_email", "ask_for_help"].

RETURN ONLY THE JSON. DO NOT ADD ANY ADDITIONAL TEXT.
`.trim();
  }

  private static formatTriggerMessage({
    trigger,
    reactions,
  }: {
    trigger: ITrigger;
    reactions?: { id: string; metadata: IReaction }[];
  }) {
    switch (trigger.type) {
      case "email_received":
        const summary = "summary" in trigger ? trigger.summary : "No summary";
        return (
          JSON.stringify({
            type: trigger.type,
            from: trigger.from,
            title: trigger.title,
            summary,
          }) +
          "\n" +
          Phoenix.formatReactions(reactions)
        );
    }
    return "Unknown trigger type";
  }

  private static formatReactions(
    reactions?: { id: string; metadata: IReaction }[]
  ) {
    let reactionsString = "";
    if (!reactions) return reactionsString;
    if (!reactions.length)
      return reactionsString + "\nDid not find any reactions";
    reactionsString += "\n$$$$$ Reactions to this trigger: $$$$$\n\n";
    return reactionsString + reactions.map(this.formatReaction).join("\n");
  }

  private static formatSimilarTriggersWithReactions(
    similarTriggersWithReactions?: {
      trigger: ITrigger;
      reactions: { id: string; metadata: IReaction }[];
    }[]
  ) {
    if (!similarTriggersWithReactions) return "";
    if (!similarTriggersWithReactions.length) return "";
    const similarReactions = similarTriggersWithReactions.flatMap(
      (triggerWithReactions) =>
        triggerWithReactions.reactions.map(Phoenix.formatReaction)
    );
    const reactionsString = similarReactions.length
      ? "$$$$$ Reactions to similar triggers $$$$$\n\n"
      : "$$$$$ No reactions to similar triggers found $$$$$\n\n";
    return reactionsString + similarReactions.join("\n");
  }

  private static formatReaction(reaction: { id: string; metadata: IReaction }) {
    return JSON.stringify(reaction.metadata);
  }
}
