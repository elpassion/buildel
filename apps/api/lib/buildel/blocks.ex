defmodule Buildel.Blocks do
  alias Buildel.Blocks.ImageOutput
  alias Buildel.Blocks.DatasetOutput
  alias Buildel.Blocks.FileInput

  alias Buildel.Blocks.{
    AudioInput,
    NewChat,
    HuggingFaceChat,
    SpeechToText,
    FileSpeechToText,
    TextToSpeech,
    NewTextInput,
    NewTextOutput,
    AudioOutput,
    CollectSentences,
    CollectAllText,
    BlockValidator,
    NewMap,
    SplitText,
    DocumentSearch,
    WebhookOutput,
    IF,
    DocumentTool,
    NewApiCallTool,
    CreateBlockTool,
    MapList,
    Timer,
    CSVSearch,
    Browser,
    FileOutput,
    NewDate,
    Comment,
    WorkflowCall,
    DatasetOutput,
    ImageInput,
    HuggingFaceImageClassification,
    BraveSearch,
    FileToText,
    Image,
    ImageOutput,
    Knowledge
  }

  @names_to_blocks_map %{
    "text_input" => NewTextInput,
    "audio_input" => AudioInput,
    "speech_to_text" => SpeechToText,
    "file_speech_to_text" => FileSpeechToText,
    "chat" => NewChat,
    "hugging_face_chat" => HuggingFaceChat,
    "text_to_speech" => TextToSpeech,
    "text_output" => NewTextOutput,
    "audio_output" => AudioOutput,
    "collect_sentences" => CollectSentences,
    "collect_all_text" => CollectAllText,
    "map_inputs" => NewMap,
    "split_text" => SplitText,
    "file_input" => FileInput,
    "webhook_output" => WebhookOutput,
    "document_search" => DocumentSearch,
    "if" => IF,
    "document_tool" => DocumentTool,
    "api_call_tool" => NewApiCallTool,
    "create_block_tool" => CreateBlockTool,
    "map_list" => MapList,
    "timer" => Timer,
    "csv_search" => CSVSearch,
    "browser" => Browser,
    "file_output" => FileOutput,
    "date" => NewDate,
    "comment" => Comment,
    "workflow_call" => WorkflowCall,
    "dataset_output" => DatasetOutput,
    "image_input" => ImageInput,
    "hf_image_classification" => HuggingFaceImageClassification,
    "brave_search" => BraveSearch,
    "file_to_text" => FileToText,
    "image" => Image,
    "image_output" => ImageOutput,
    "knowledge" => Knowledge
  }

  @blocks_to_names_map %{
    TextInput => "text_input",
    AudioInput => "audio_input",
    SpeechToText => "speech_to_text",
    FileSpeechToText => "file_speech_to_text",
    NewChat => "chat",
    HuggingFaceChat => "hugging_face_chat",
    TextToSpeech => "text_to_speech",
    TextOutput => "text_output",
    AudioOutput => "audio_output",
    CollectSentences => "collect_sentences",
    CollectAllText => "collect_all_text",
    NewMap => "map_inputs",
    FileInput => "file_input",
    SplitText => "split_text",
    DocumentSearch => "document_search",
    WebhookOutput => "webhook_output",
    IF => "if",
    DocumentTool => "document_tool",
    NewApiCallTool => "api_call_tool",
    CreateBlockTool => "create_block_tool",
    MapList => "map_list",
    Timer => "timer",
    CSVSearch => "csv_search",
    Browser => "browser",
    FileOutput => "file_output",
    NewDate => "date",
    Comment => "comment",
    WorkflowCall => "workflow_call",
    DatasetOutput => "dataset_output",
    ImageInput => "image_input",
    HuggingFaceImageClassification => "hf_image_classification",
    BraveSearch => "brave_search",
    FileToText => "file_to_text",
    Image => "image",
    ImageOutput => "image_output",
    Knowledge => "knowledge"
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
