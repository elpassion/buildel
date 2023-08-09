// const get_blocks = [
//   { name: 'audio_input', type: 'AudioInput' },
//   { name: 'speech_to_text', type: 'SpeechToText', input: 'audio_input_output' },
//   {
//     name: 'chat',
//     type: 'Chat',
//     input: 'speech_to_text_output',
//     messages: [{ role: 'system', content: 'You are a helpful assistant' }],
//   },
//   {
//     name: 'text_to_speech',
//     type: 'TextToSpeech',
//     input: 'chat_sentences_output',
//   },
// ];

// |> add_block(start_block("audio_input", name: "audio_input", opts: %{}, forward_outputs: []))
// |> add_block(start_block("speech_to_text", name: "speech_to_text", opts: %{ input: "audio_input_output"}, forward_outputs: ["output"]))
// |> add_block(start_block("chat", name: "chat", opts: %{ input: "speech_to_text_output", messages: [%{role: "system", content: "You are a helpful assistant. Always answer in not more than 2 sentences! It's very important!"}] }, forward_outputs: ["sentences_output"]))
// |> add_block(start_block("text_to_speech", name: "text_to_speech", opts: %{ input: "chat_sentences_output"}, forward_outputs: ["output"]))

export type AudioInputBlock = {
  name: 'audio_input';
  type: 'AudioInput';
};

export type TextToSpeechBlock = {
  name: 'text_to_speech';
  type: 'TextToSpeech';
  input: 'chat_sentences_output';
};

export type SpeechToTextBlock = {
  name: 'speech_to_text';
  type: 'SpeechToText';
  input: 'audio_input_output';
};

export type ChatBlock = {
  name: 'chat';
  type: 'Chat';
  input: 'speech_to_text_output';
  messages: { role: 'system'; content: string }[];
};

export type IBlock =
  | AudioInputBlock
  | TextToSpeechBlock
  | SpeechToTextBlock
  | ChatBlock;

// ================================================================

export type BlockBase = {
  enabled: boolean;
};
