defmodule Buildel.Blocks do
  alias Buildel.Blocks.FileInput

  alias Buildel.Blocks.{
    AudioInput,
    Chat,
    HuggingFaceChat,
    SpeechToText,
    TextToSpeech,
    TextInput,
    TextOutput,
    AudioOutput,
    CollectSentences,
    CollectAllText,
    TextOutput,
    BlockValidator,
    TakeLatest,
    # VectorDB,
    DocumentSearch,
    IF
  }

  @names_to_blocks_map %{
    "text_input" => TextInput,
    "audio_input" => AudioInput,
    "speech_to_text" => SpeechToText,
    "chat" => Chat,
    "hugging_face_chat" => HuggingFaceChat,
    "text_to_speech" => TextToSpeech,
    "text_output" => TextOutput,
    "audio_output" => AudioOutput,
    "collect_sentences" => CollectSentences,
    "collect_all_text" => CollectAllText,
    "take_latest" => TakeLatest,
    # "vector_db" => VectorDB,
    "file_input" => FileInput,
    "document_search" => DocumentSearch,
    "if" => IF,
    "memory_search_tool" => Buildel.Blocks.MemorySearchTool
  }

  @blocks_to_names_map %{
    TextInput => "text_input",
    AudioInput => "audio_input",
    SpeechToText => "speech_to_text",
    Chat => "chat",
    HuggingFaceChat => "hugging_face_chat",
    TextToSpeech => "text_to_speech",
    TextOutput => "text_output",
    AudioOutput => "audio_output",
    CollectSentences => "collect_sentences",
    CollectAllText => "collect_all_text",
    TakeLatest => "take_latest",
    # VectorDB => "vector_db",
    FileInput => "file_input",
    DocumentSearch => "document_search",
    IF => "if",
    Buildel.Blocks.MemorySearchTool => "memory_search_tool"
  }

  def list_types() do
    @names_to_blocks_map |> Map.values() |> Enum.map(fn block -> block.options end)
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
