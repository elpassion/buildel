import { z } from "zod";

export class TriggerService {
  constructor(private readonly trigger: ITrigger) {}
}

export const EmailTrigger = z.object({
  type: z.literal("email_received"),
  from: z.string(),
  title: z.string(),
  body: z.string(),
});

export const FeedbackTrigger = z.object({
  type: z.literal("feedback_received"),
});

export const Trigger = z.union([EmailTrigger, FeedbackTrigger]);

export type ITrigger = z.infer<typeof Trigger>;
