import type { EmailTriggerEnhancer } from "./email";
import { type IEnhancedTrigger, type ITrigger } from "../../chain/trigger";
import { BaseTriggerEnhancer } from "./base";

export class TriggerEnhancer extends BaseTriggerEnhancer {
  private enhancers: { email: EmailTriggerEnhancer };

  constructor(enhancers: { email: EmailTriggerEnhancer }) {
    super();
    this.enhancers = enhancers;
  }

  public async enhance(trigger: ITrigger): Promise<IEnhancedTrigger> {
    if (trigger.type === "email_received") {
      return this.enhancers.email.enhance(trigger);
    }

    return trigger;
  }
}
