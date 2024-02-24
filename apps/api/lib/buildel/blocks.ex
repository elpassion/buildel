defmodule Buildel.Blocks do
  alias Buildel.Blocks.FileInput

  alias Buildel.Blocks.{
    AudioInput,
    Chat,
    HuggingFaceChat,
    SpeechToText,
    FileSpeechToText,
    TextToSpeech,
    TextInput,
    TextOutput,
    AudioOutput,
    CollectSentences,
    CollectAllText,
    TextOutput,
    BlockValidator,
    MapInputs,
    SplitText,
    DocumentSearch,
    WebhookOutput,
    IF,
    DocumentTool,
    ApiCallTool,
    CreateBlockTool,
    MapList
  }

  @names_to_blocks_map %{
    "text_input" => TextInput,
    "audio_input" => AudioInput,
    "speech_to_text" => SpeechToText,
    "file_speech_to_text" => FileSpeechToText,
    "chat" => Chat,
    "hugging_face_chat" => HuggingFaceChat,
    "text_to_speech" => TextToSpeech,
    "text_output" => TextOutput,
    "audio_output" => AudioOutput,
    "collect_sentences" => CollectSentences,
    "collect_all_text" => CollectAllText,
    "map_inputs" => MapInputs,
    "split_text" => SplitText,
    "file_input" => FileInput,
    "webhook_output" => WebhookOutput,
    "document_search" => DocumentSearch,
    "if" => IF,
    "document_tool" => DocumentTool,
    "api_call_tool" => ApiCallTool,
    "create_block_tool" => CreateBlockTool,
    "map_list" => MapList
  }

  @blocks_to_names_map %{
    TextInput => "text_input",
    AudioInput => "audio_input",
    SpeechToText => "speech_to_text",
    FileSpeechToText => "file_speech_to_text",
    Chat => "chat",
    HuggingFaceChat => "hugging_face_chat",
    TextToSpeech => "text_to_speech",
    TextOutput => "text_output",
    AudioOutput => "audio_output",
    CollectSentences => "collect_sentences",
    CollectAllText => "collect_all_text",
    MapInputs => "map_inputs",
    FileInput => "file_input",
    SplitText => "split_text",
    DocumentSearch => "document_search",
    WebhookOutput => "webhook_output",
    IF => "if",
    DocumentTool => "document_tool",
    ApiCallTool => "api_call_tool",
    CreateBlockTool => "create_block_tool",
    MapList => "map_list"
  }

  def list_types() do
    @names_to_blocks_map |> Map.values() |> Enum.map(fn block -> block.options end)
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
