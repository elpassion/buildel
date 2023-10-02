import { Icon } from "@elpassion/taco";
import React from "react";
import { IBlockConfig } from "../pipeline.types";
import { AiChatSpark } from "~/icons/AiChatSpark";
import { SoundRecognition } from "~/icons/SoundRecognition";
import { VoiceMailBubble } from "~/icons/VoiceMailBubble";

export const generateTemplates = (templates: typeof sampleTemplates) =>
  templates.map((template, index) => ({
    ...template,
    id: index + 1,
  }));
export const sampleTemplates = [
  {
    name: "AI Chat",
    icon: <AiChatSpark />,
    blocks: [
      generateTextInput({
        position: { x: 0, y: -500 },
      }),
      generateChat({
        inputs: ["text_input_1:output->input"],
        position: { x: 400, y: -500 },
      }),
      generateTextOutput({
        inputs: ["chat_1:output->input"],
        position: { x: 800, y: -500 },
      }),
    ],
  },
  {
    name: "Speech To Text",
    icon: <SoundRecognition />,
    blocks: [
      generateAudioInput({ position: { x: 0, y: -500 } }),
      generateSpeechToText({
        inputs: ["audio_input_1:output->input"],
        position: { x: 400, y: -500 },
      }),
      generateTextOutput({
        inputs: ["speech_to_text_1:output->input"],
        position: { x: 800, y: -500 },
      }),
    ],
  },
  {
    name: "Text To Speech",
    icon: <VoiceMailBubble />,
    blocks: [
      generateTextInput({
        position: { x: 0, y: -500 },
      }),
      generateTextToSpeech({
        inputs: ["text_input_1:output->input"],
        position: { x: 400, y: -500 },
      }),
      generateAudioOutput({
        position: { x: 800, y: -500 },
        inputs: ["text_to_speech_1:output->input"],
      }),
    ],
  },
  {
    name: "Knowledge Search To Text",
    icon: <Icon iconName="search" />,
    blocks: [
      generateTextInput({
        position: { x: 0, y: -500 },
      }),
      generateDocumentSearch({
        inputs: ["text_input_1:output->input"],
        position: { x: 400, y: -500 },
      }),
      generateTextOutput({
        inputs: ["document_search_1:output->input"],
        position: { x: 800, y: -500 },
      }),
    ],
  },
];

function generateAudioOutput(
  overrides?: Partial<Omit<IBlockConfig, "block_type">>
) {
  return generateBlockConfig({
    name: "audio_output_1",
    type: "audio_output",
    ...overrides,
  });
}
function generateAudioInput(
  overrides?: Partial<Omit<IBlockConfig, "block_type">>
) {
  return generateBlockConfig({
    name: "audio_input_1",
    type: "audio_input",
    ...overrides,
  });
}

function generateTextToSpeech(
  overrides?: Partial<Omit<IBlockConfig, "block_type">>
) {
  return generateBlockConfig({
    name: "text_to_speech_1",
    type: "text_to_speech",
    ...overrides,
  });
}
function generateSpeechToText(
  overrides?: Partial<Omit<IBlockConfig, "block_type">>
) {
  return generateBlockConfig({
    name: "speech_to_text_1",
    type: "speech_to_text",
    ...overrides,
  });
}

function generateTextOutput(
  overrides?: Partial<Omit<IBlockConfig, "block_type">>
): Partial<IBlockConfig> {
  return generateBlockConfig({
    name: "text_output_1",
    type: "text_output",
    ...overrides,
  });
}

function generateTextInput(
  overrides?: Partial<Omit<IBlockConfig, "block_type">>
): Partial<IBlockConfig> {
  return generateBlockConfig({
    name: "text_input_1",
    type: "text_input",
    ...overrides,
  });
}

function generateChat(
  overrides?: Partial<Omit<IBlockConfig, "block_type">>
): Partial<IBlockConfig> {
  return generateBlockConfig({
    name: "chat_1",
    type: "chat",
    ...overrides,
  });
}

function generateDocumentSearch(
  overrides?: Partial<Omit<IBlockConfig, "block_type">>
): Partial<IBlockConfig> {
  return generateBlockConfig({
    name: "document_search_1",
    type: "document_search",
    ...overrides,
  });
}
function generateBlockConfig(
  overrides?: Partial<Omit<IBlockConfig, "block_type">>
) {
  return {
    position: { x: 800, y: -500 },
    inputs: [],
    opts: {},
    ...overrides,
  };
}
