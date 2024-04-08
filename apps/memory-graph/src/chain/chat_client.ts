import OpenAI from "openai";
import { Message, type IMessage } from "./message";

interface IChatClient {
  generate(messages: IMessage[]): Promise<IMessage>;
}

export class ChatClient implements IChatClient {
  private readonly openAi = new OpenAI({
    apiKey: ChatClient.getOpenAIApiKey(),
  });

  public async generate(messages: IMessage[]): Promise<IMessage> {
    const completion = await this.openAi.chat.completions.create({
      messages: messages,
      model: "gpt-3.5-turbo",
    });
    const message = completion.choices.at(0);
    if (!message) throw new Error("OpenAI didn't return a message");
    return Message.parse(message.message);
  }

  private static getOpenAIApiKey(): string {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Provide env OPENAI_API_KEY");
    return apiKey;
  }
}
