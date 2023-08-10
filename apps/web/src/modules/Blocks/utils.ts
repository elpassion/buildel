import { Channel } from 'phoenix';

// |> add_block(start_block("audio_input", name: "audio_input", opts: %{}, forward_outputs: []))
export const audioInputBlock = {
  name: 'audio_input',
  opts: {},
  forward_outputs: [],
} as const;

// |> add_block(start_block("text_to_speech", name: "text_to_speech", opts: %{ input: "chat_sentences_output"}, forward_outputs: ["output"]))
export const textToSpeechBlock = {
  name: 'text_to_speech',
  opts: {
    input: 'chat_sentences_output',
  },
  forward_outputs: ['output'],
} as const;

// |> add_block(start_block("speech_to_text", name: "speech_to_text", opts: %{ input: "audio_input_output"}, forward_outputs: ["output"]))
export const speechToTextBlock = {
  name: 'speech_to_text',
  opts: {
    input: 'audio_input_output',
  },
  forward_outputs: ['output'],
} as const;

// |> add_block(start_block("chat", name: "chat", opts: %{ input: "speech_to_text_output", messages: [%{role: "system", content: "You are a helpful assistant. Always answer in not more than 2 sentences! It's very important!"}] }, forward_outputs: ["sentences_output"]))
export const chatBlock = {
  name: 'chat',
  opts: {
    input: 'speech_to_text_output',
    messages: [
      {
        role: 'system',
        content: '',
      },
    ],
  },
  forward_outputs: ['sentences_output'],
} as const;

// ================================================================

export function ppush(channel: Channel, event: string, payload: any) {
  return new Promise((resolve, reject) => {
    console.log("ppush '%s' payload:", event, payload);
    channel
      .push(event, payload)
      .receive('ok', (resp: any) => {
        console.log('received ok: ', resp);
        resolve(resp);
      })
      .receive('error', (resp: any) => {
        console.log('received error: ', resp);
        reject(resp);
      });
  });
}
