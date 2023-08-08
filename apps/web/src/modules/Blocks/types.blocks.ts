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
