import { z } from "zod";

export class ReactionService {
  constructor(private readonly reaction: IReaction) {}
}

const ApprovalReaction = z.object({
  type: z.literal("request_approval"),
});

const LogReaction = z.object({
  type: z.literal("send_log"),
});

const Reaction = z.union([ApprovalReaction, LogReaction]);

export type IReaction = z.infer<typeof Reaction>;
