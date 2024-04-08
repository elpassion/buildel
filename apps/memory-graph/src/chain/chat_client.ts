import OpenAI from "openai";
import { Message, type IMessage } from "./message";

export interface IChatClient {
  generate(messages: IMessage[]): Promise<IMessage>;
}

export class ChatClient implements IChatClient {
  private readonly openAi = new OpenAI({
    apiKey: ChatClient.getOpenAIApiKey(),
  });

  public async generate(messages: IMessage[]): Promise<IMessage> {
    const completion = await this.openAi.chat.completions.create({
      messages: messages,
      model: "qwen:14b",
      response_format: {
        type: "json_object",
      },
      temperature: 0.1,
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

export class OLLAMAChatClient implements IChatClient {
  private readonly openAi = new OpenAI({
    apiKey: "doesntmatter",
    baseURL: "http://127.0.0.1:11434/v1",
  });

  public async generate(messages: IMessage[]): Promise<IMessage> {
    const completion = await this.openAi.chat.completions.create({
      messages: messages,
      model: "qwen:14b",
      response_format: {
        type: "json_object",
      },
      temperature: 0.1,
    });
    const message = completion.choices.at(0);
    if (!message) throw new Error("Chat didn't return a message");
    return Message.parse(message.message);
  }
}
