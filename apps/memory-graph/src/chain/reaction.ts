import { z } from "zod";

export class ReactionService {
  constructor(private readonly reaction: IReaction) {}
}

export const AskForHelpReaction = z.object({
  type: z.literal("ask_for_help"),
  message: z.string(),
});

export const ArchiveReaction = z.object({
  type: z.literal("archive_email"),
  reason: z.string(),
});

export const LogReaction = z.object({
  type: z.literal("send_log"),
  log: z.string(),
});

export const UploadInvoiceReaction = z.object({
  type: z.literal("upload_invoice"),
  invoice: z.string(),
});

export const SendEmailReaction = z.object({
  type: z.literal("respond_to_email"),
  email: z.string(),
  subject: z.string(),
  body: z.string(),
});

export const Reaction = z.discriminatedUnion("type", [
  AskForHelpReaction,
  LogReaction,
  UploadInvoiceReaction,
  ArchiveReaction,
  SendEmailReaction,
]);

export type IReaction = z.infer<typeof Reaction>;
