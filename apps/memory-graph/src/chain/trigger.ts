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

export type IEmailTrigger = z.infer<typeof EmailTrigger>;

export const EmailTriggerWithSummary = EmailTrigger.extend({
  summary: z.string(),
});

export type IEmailTriggerWithSummary = z.infer<typeof EmailTriggerWithSummary>;

export const FeedbackTrigger = z.object({
  type: z.literal("feedback_received"),
});

export const Trigger = z.union([EmailTrigger, FeedbackTrigger]);

export type ITrigger = z.infer<typeof Trigger>;

export const EnhancedTrigger = z.union([
  EmailTriggerWithSummary,
  FeedbackTrigger,
]);

export type IEnhancedTrigger = z.infer<typeof EnhancedTrigger>;
