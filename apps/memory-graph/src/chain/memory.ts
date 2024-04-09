import type { IMessage } from "./message";

export class Memory {
  public readonly messages: IMessage[] = [];
  constructor() {}
  getMessages(): IMessage[] {
    return this.messages;
  }

  addMessage(newMessage: IMessage) {
    this.messages.push(newMessage);
  }

  clearMessages() {
    this.messages.length = 0;
  }

  dropLastMessage() {
    this.messages.pop();
  }
}
