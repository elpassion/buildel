import type { IReaction } from "../../chain/reaction";
import type { IEnhancedTrigger } from "../../chain/trigger";
import type { IEnhancedTriggerWithReactions } from "../../types";

export abstract class BaseReactionCreator {
  abstract create(args: {
    reactionType: IReaction["type"];
    trigger: IEnhancedTrigger;
    relatedTriggersWithReactions: IEnhancedTriggerWithReactions[];
  }): Promise<IReaction>;
}
