import type { ChatClient } from "./chat_client";
import type { Memory } from "./memory";

export class Chat {
  private readonly memory: Memory;
  private readonly chatClient: ChatClient;
  constructor({ memory, chat }: { memory: Memory; chat: ChatClient }) {
    this.memory = memory;
    this.chatClient = chat;
  }

  public async generate() {
    const newMessage = await this.chatClient.generate(
      this.memory.getMessages()
    );

    this.memory.addMessage(newMessage);

    return newMessage;
  }
}
