import type { EmailTriggerEnhancer } from "./email";
import { type IEnhancedTrigger, type ITrigger } from "../../chain/trigger";

export class TriggerEnhancer {
  private enhancers: { email: EmailTriggerEnhancer };

  constructor(enhancers: { email: EmailTriggerEnhancer }) {
    this.enhancers = enhancers;
  }

  public async enhance(trigger: ITrigger): Promise<IEnhancedTrigger> {
    if (trigger.type === "email_received") {
      return this.enhancers.email.enhance(trigger);
    }

    return trigger;
  }
}
