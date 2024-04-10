import type { IEnhancedTrigger, ITrigger } from "../../chain/trigger";

export abstract class BaseTriggerEnhancer {
  abstract enhance(trigger: ITrigger): Promise<IEnhancedTrigger>;
}
