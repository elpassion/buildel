import type { z } from "zod";
import type { IChatClient } from "./chat_client";
import type { Memory } from "./memory";
import type { IMessage } from "./message";

export class Chat {
  private readonly memory: Memory;
  private readonly chatClient: IChatClient;
  private retryCount = 0;

  constructor({ memory, chat }: { memory: Memory; chat: IChatClient }) {
    this.memory = memory;
    this.chatClient = chat;
  }

  public async addMessage(message: IMessage) {
    this.memory.addMessage(message);
  }

  public async generate(outputSchema?: z.ZodSchema): Promise<any> {
    console.log(this.memory.getMessages());

    const newMessage = await this.chatClient.generate(
      this.memory.getMessages()
    );

    this.memory.addMessage(newMessage);

    console.log("Generated message:", newMessage.content.trim());

    if (outputSchema) {
      const parseResult = outputSchema.safeParse(
        JSON.parse(newMessage.content.trim())
      );

      if (!parseResult.success) {
        this.retryCount++;

        if (this.retryCount > 3) throw new Error("Failed to parse response");

        this.memory.dropLastMessage();

        return this.generate(outputSchema);
      }
    }

    return newMessage;
  }
}
