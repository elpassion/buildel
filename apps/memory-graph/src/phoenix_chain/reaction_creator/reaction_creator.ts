import type { IReaction } from "../../chain/reaction";
import type { IEnhancedTrigger } from "../../chain/trigger";
import type { IEnhancedTriggerWithReactions } from "../../types";
import { BaseReactionCreator } from "./base";
import type { EmailReactionCreator } from "./email";
import type { HelpCreator } from "./help";

export class ReactionCreator extends BaseReactionCreator {
  private creators: { email: EmailReactionCreator; help: HelpCreator };

  constructor(creators: { email: EmailReactionCreator; help: HelpCreator }) {
    super();
    this.creators = creators;
  }

  public async create(args: {
    reactionType: IReaction["type"];
    trigger: IEnhancedTrigger;
    relatedTriggersWithReactions: IEnhancedTriggerWithReactions[];
  }): Promise<IReaction> {
    switch (args.reactionType) {
      case "respond_to_email": {
        return this.creators.email.create(args);
      }
      case "ask_for_help": {
        return this.creators.help.create(args);
      }
    }

    throw new Error(`Unknown reaction type ${args.reactionType}`);
  }
}
