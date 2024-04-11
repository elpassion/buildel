import { z } from "zod";

export class ReactionService {
  constructor(private readonly reaction: IReaction) {}
}

export const AskForHelpReaction = z.object({
  type: z.literal("ask_for_help"),
  reason: z.string(),
  message: z.string(),
});

export type IAskForHelpReaction = z.infer<typeof AskForHelpReaction>;

export const ArchiveReaction = z.object({
  type: z.literal("archive_email"),
  reason: z.string(),
});

export type IArchiveReaction = z.infer<typeof ArchiveReaction>;

export const LogReaction = z.object({
  type: z.literal("send_log"),
  reason: z.string(),
  log: z.string(),
});

export type ILogReaction = z.infer<typeof LogReaction>;

export const UploadInvoiceReaction = z.object({
  type: z.literal("upload_invoice"),
  reason: z.string(),
  invoice: z.string(),
});

export type IUploadInvoiceReaction = z.infer<typeof UploadInvoiceReaction>;

export const SendEmailReaction = z.object({
  type: z.literal("respond_to_email"),
  reason: z.string(),
  email: z.string(),
  subject: z.string(),
  body: z.string(),
});

export type ISendEmailReaction = z.infer<typeof SendEmailReaction>;

export const Reaction = z.discriminatedUnion("type", [
  AskForHelpReaction,
  LogReaction,
  UploadInvoiceReaction,
  ArchiveReaction,
  SendEmailReaction,
]);

export type IReaction = z.infer<typeof Reaction>;
