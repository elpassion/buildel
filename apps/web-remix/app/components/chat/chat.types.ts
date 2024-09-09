import { z } from 'zod';

export type MessageRole = 'ai' | 'user';

export interface IMessage {
  id: string;
  role: MessageRole;
  blockName: string;
  outputName: string;
  blockId: string;
  message: string;
  created_at: Date;
  state: 'generating' | 'done';
}

export const chatSize = z.enum(['sm', 'default']);

export type ChatSize = z.TypeOf<typeof chatSize>;
