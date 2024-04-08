import { z } from "zod";

export class ReactionService {
  constructor(private readonly reaction: IReaction) {}
}

export const ApprovalReaction = z.object({
  type: z.literal("request_approval"),
  message: z.string(),
});

export const LogReaction = z.object({
  type: z.literal("send_log"),
  log: z.string(),
});

export const UploadInvoice = z.object({
  type: z.literal("upload_invoice"),
  invoice: z.string(),
});

export const Reaction = z.union([ApprovalReaction, LogReaction, UploadInvoice]);

export type IReaction = z.infer<typeof Reaction>;
