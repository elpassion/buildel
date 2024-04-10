import type { Chat } from "./chain/chat";
import { Reaction, type IReaction } from "./chain/reaction";
import type { ITrigger } from "./chain/trigger";
import type { TriggerEnhancer } from "./phoenix_chain/trigger_enhancer/trigger_enhancer";
import type { TriggerFilter } from "./phoenix_chain/trigger_filter/trigger_filter";
import type { MemoryGraph } from "./memory_graph/memory_graph";
import type { ReactionTypePicker } from "./phoenix_chain/reaction_type_picker/reaction_type_picker";
import type { ReactionCreator } from "./phoenix_chain/reaction_creator/reaction_creator";
import { Logger } from "./logger";

export class Phoenix {
  constructor(
    private readonly memoryGraph: MemoryGraph,
    private readonly chat: Chat,
    private readonly triggerEnhancer: TriggerEnhancer,
    private readonly triggerFilter: TriggerFilter,
    private readonly reactionTypePicker: ReactionTypePicker,
    private readonly reactionCreator: ReactionCreator
  ) {}

  public async handleTrigger(trigger: ITrigger) {
    const enhancedTrigger = await this.triggerEnhancer.enhance(trigger);
    const triggerToSave = await this.memoryGraph.saveTrigger(enhancedTrigger);

    const results = await this.memoryGraph.searchForTriggersWithReactions(
      enhancedTrigger,
      3
    );
    const filteredTriggersWithReactions =
      await this.triggerFilter.filterMultiple(
        enhancedTrigger,
        results.triggersWithReactions
      );
    const reactionType = await this.reactionTypePicker.pickReactionType(
      enhancedTrigger,
      filteredTriggersWithReactions
    );
    const reaction = await this.reactionCreator.create({
      reactionType: reactionType.type,
      trigger: enhancedTrigger,
      relatedTriggersWithReactions: filteredTriggersWithReactions,
    });

    const reactionId = await this.memoryGraph.saveReactionToTrigger({
      triggerId: triggerToSave.id,
      reaction: reaction,
    });

    await this.memoryGraph.connectTriggerWithQuery({
      queryId: results.queryId,
      triggerId: triggerToSave.id,
    });

    await this.invokeReaction(reaction);

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

    await this.invokeReaction(reaction);

    return {
      reactionId: id,
    };
  }

  private async invokeReaction(parsedReaction: IReaction) {
    Logger.debug(`Invoking reaction ${parsedReaction}`);

    await fetch(
      "http://127.0.0.1:5678/webhook/0a94951a-f93f-4617-9489-2867251b8ce3",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedReaction),
      }
    )
      .then((response) => Logger.debug(`Reaction invoked: ${response.status}`))
      .catch(console.error);
  }
}
