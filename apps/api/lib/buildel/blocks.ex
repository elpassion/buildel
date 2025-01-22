defmodule Buildel.Blocks do
  alias Buildel.Blocks.NewFileInput
  alias Buildel.Blocks.NewBrowserTool
  alias Buildel.Blocks.NewCollect
  alias Buildel.Blocks.NewCodeTool

  alias Buildel.Blocks.{
    NewAudioInput,
    NewChat,
    HuggingFaceChat,
    NewSpeechToText,
    NewFileSpeechToText,
    NewTextToSpeech,
    NewTextInput,
    NewTextOutput,
    NewAudioOutput,
    CollectSentences,
    NewCollect,
    BlockValidator,
    NewMap,
    NewSplitText,
    NewDocumentSearch,
    NewWebhookOutput,
    NewIF,
    NewDocumentTool,
    NewApiCallTool,
    CreateBlockTool,
    NewMapList,
    NewTimer,
    NewCSVSearch,
    NewBrowserTool,
    NewFileOutput,
    NewDate,
    Comment,
    WorkflowCall,
    NewDatasetOutput,
    ImageInput,
    NewHuggingFaceImageClassification,
    NewBraveSearch,
    NewFileToText,
    NewImage,
    NewImageOutput,
    Knowledge,
    NewWorkflowCall,
    NewCollectAllAudio,
    SharepointClient,
    Video,
    TextToFile
  }

  @names_to_blocks_map %{
    "text_input" => NewTextInput,
    "audio_input" => NewAudioInput,
    "speech_to_text" => NewSpeechToText,
    "file_speech_to_text" => NewFileSpeechToText,
    "chat" => NewChat,
    "hugging_face_chat" => HuggingFaceChat,
    "text_to_speech" => NewTextToSpeech,
    "text_output" => NewTextOutput,
    "audio_output" => NewAudioOutput,
    "collect_sentences" => CollectSentences,
    "collect_all_text" => NewCollect,
    "map_inputs" => NewMap,
    "split_text" => NewSplitText,
    "file_input" => NewFileInput,
    "webhook_output" => NewWebhookOutput,
    "document_search" => NewDocumentSearch,
    "if" => NewIF,
    "document_tool" => NewDocumentTool,
    "api_call_tool" => NewApiCallTool,
    "create_block_tool" => CreateBlockTool,
    "map_list" => NewMapList,
    "timer" => NewTimer,
    "csv_search" => NewCSVSearch,
    "browser" => NewBrowserTool,
    "file_output" => NewFileOutput,
    "date" => NewDate,
    "comment" => Comment,
    "workflow_call" => NewWorkflowCall,
    "dataset_output" => NewDatasetOutput,
    "image_input" => ImageInput,
    "hf_image_classification" => NewHuggingFaceImageClassification,
    "brave_search" => NewBraveSearch,
    "file_to_text" => NewFileToText,
    "image" => NewImage,
    "image_output" => NewImageOutput,
    "knowledge" => Knowledge,
    "collect_all_audio" => NewCollectAllAudio,
    "sharepoint_client" => SharepointClient,
    "video" => Video,
    "code_interpreter" => NewCodeTool,
    "text_to_file" => TextToFile
  }

  @blocks_to_names_map %{
    TextInput => "text_input",
    NewAudioInput => "audio_input",
    NewSpeechToText => "speech_to_text",
    NewFileSpeechToText => "file_speech_to_text",
    NewChat => "chat",
    HuggingFaceChat => "hugging_face_chat",
    NewTextToSpeech => "text_to_speech",
    TextOutput => "text_output",
    NewAudioOutput => "audio_output",
    CollectSentences => "collect_sentences",
    NewCollect => "collect_all_text",
    NewMap => "map_inputs",
    NewFileInput => "file_input",
    NewSplitText => "split_text",
    NewDocumentSearch => "document_search",
    NewWebhookOutput => "webhook_output",
    NewIF => "if",
    NewDocumentTool => "document_tool",
    NewApiCallTool => "api_call_tool",
    CreateBlockTool => "create_block_tool",
    NewMapList => "map_list",
    NewTimer => "timer",
    NewCSVSearch => "csv_search",
    NewBrowserTool => "browser",
    NewFileOutput => "file_output",
    NewDate => "date",
    Comment => "comment",
    WorkflowCall => "workflow_call",
    NewDatasetOutput => "dataset_output",
    ImageInput => "image_input",
    NewHuggingFaceImageClassification => "hf_image_classification",
    NewBraveSearch => "brave_search",
    NewFileToText => "file_to_text",
    NewImage => "image",
    NewImageOutput => "image_output",
    Knowledge => "knowledge",
    NewCollectAllAudio => "collect_all_audio",
    SharepointClient => "sharepoint_client",
    Video => "video",
    NewCodeTool => "code_interpreter",
    TextToFile => "text_to_file"
  }

  def list_types() do
    @names_to_blocks_map |> Map.values() |> Enum.map(fn block -> block.options() end)
  end

  def list_types_overviews() do
    list_types() |> Enum.map(fn block -> %{type: block.type, description: block.description} end)
  end

  def type(name) when is_binary(name) do
    @names_to_blocks_map[name]
  end

  def type(name) when is_atom(name) do
    @blocks_to_names_map[name]
  end

  def validate_block(block, block_config) do
    BlockValidator.validate(block, block_config)
  end
end
