defmodule Buildel.Blocks.HuggingFaceChat do
  require Logger
  use Buildel.Blocks.Block
  use Buildel.Blocks.Utils.TakeLatest

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :send_message
  def sentences_output(), do: Block.text_output("sentences_output")

  @impl true
  def options() do
    %{
      type: "hugging_face_chat",
      groups: ["text", "llms"],
      inputs: [Block.text_input()],
      outputs: [
        Block.text_output("output"),
        sentences_output(),
        Block.text_output("message_output")
      ],
      ios: [],
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "inputs", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => [
              "model",
              "temperature",
              "system_message",
              "messages",
              "api_key",
              "stream"
            ],
            "properties" =>
              Jason.OrderedObject.new(
                api_key:
                  secret_schema(%{
                    "title" => "API Key",
                    "description" => "Select from your API keys or enter a new one."
                  }),
                model: %{
                  "type" => "string",
                  "title" => "Model",
                  "description" => "The model to use for the chat.",
                  "default" => "gpt-2"
                },
                stream: %{
                  "type" => "boolean",
                  "title" => "Stream",
                  "description" => "Whether to stream the chat.",
                  "default" => false
                },
                temperature: %{
                  "type" => "number",
                  "title" => "Temperature",
                  "description" => "The temperature of the chat.",
                  "default" => 0.7,
                  "minimum" => 0.0,
                  "maximum" => 2.0,
                  "step" => 0.1
                },
                system_message: %{
                  "type" => "string",
                  "title" => "System message",
                  "description" => "The message to start the conversation with.",
                  "presentAs" => "editor",
                  "minLength" => 1
                },
                messages: %{
                  "type" => "array",
                  "title" => "Messages",
                  "description" => "The messages to start the conversation with.",
                  "minItems" => 0,
                  "items" => %{
                    "type" => "object",
                    "required" => ["role", "content"],
                    "properties" => %{
                      "role" => %{
                        "type" => "string",
                        "title" => "Role",
                        "enum" => ["user", "assistant"],
                        "enumPresentAs" => "radio",
                        "default" => "user"
                      },
                      "content" => %{
                        "type" => "string",
                        "title" => "Content",
                        "presentAs" => "editor"
                      }
                    }
                  },
                  "default" => []
                },
                prompt_template: %{
                  "type" => "string",
                  "title" => "Prompt template",
                  "description" => "The template to use for the prompt.",
                  "presentAs" => "editor",
                  "minLength" => 1
                }
              )
          })
      }
    }
  end

  # Client

  def send_message(pid, {:text, _text} = message) do
    GenServer.cast(pid, {:send_message, message})
  end

  defp save_text_chunk(pid, chunk) do
    GenServer.cast(pid, {:save_text_chunk, chunk})
  end

  defp finish_chat_message(pid) do
    GenServer.cast(pid, {:finish_chat_message})
  end

  defp save_tool_result(pid, tool_name, content) do
    GenServer.cast(pid, {:save_tool_result, tool_name, content})
  end

  # Server

  @impl true
  def init(
        [
          name: _name,
          block_name: _block_name,
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        ] = state
      ) do
    Logger.debug("Starting chat block with opts: #{inspect(opts)}")

    subscribe_to_inputs(context_id, opts.inputs)

    Logger.debug("Chat block subscribed to input")

    api_key =
      block_secrets_resolver().get_secret_from_context(context_id, opts |> Map.get(:api_key))

    tool_blocks = []

    {:ok,
     state
     |> assign_stream_state
     |> assign_take_latest(true)
     |> Keyword.put(:system_message, opts[:system_message])
     |> Keyword.put(:prompt_template, opts[:prompt_template])
     |> Keyword.put(
       :messages,
       [%{role: "system", content: opts[:system_message]}] ++ opts[:messages]
     )
     |> Keyword.put(:api_key, api_key)
     |> Keyword.put(:tool_blocks, tool_blocks)
     |> Keyword.put(:sentences, [])
     |> Keyword.put(:sent_sentences, [])}
  end

  @impl true
  def handle_cast({:send_message, {:text, text}}, state) do
    state = send_stream_start(state)

    Buildel.BlockPubSub.broadcast_to_io(
      state[:context_id],
      state[:block_name],
      "message_output",
      {:text, text}
    )

    messages =
      if List.last(state[:messages])[:role] in ["assistant", "system"] do
        state[:messages] ++ [%{role: "user", content: state[:prompt_template]}]
      else
        state[:messages]
      end

    state = put_in(state[:messages], messages)

    messages =
      state[:messages]
      |> Enum.map(fn message ->
        %{
          message
          | content: state |> replace_inputs_with_take_latest_messages(message.content)
        }
      end)

    if(
      Enum.all?(messages, fn message ->
        message.content |> message_filled?(state[:opts].inputs)
      end)
    ) do
      state = cleanup_messages(state)
      pid = self()

      tools =
        state[:tool_blocks]
        |> Enum.map(fn block ->
          pid = block_context().block_pid(state[:context_id], block["name"])
          Buildel.Blocks.Block.function(pid)
        end)

      Task.start(fn ->
        hugging_face_chat().stream_chat(
          context: %{messages: messages, stream: state[:opts].stream != false},
          on_content: fn text_chunk ->
            Buildel.BlockPubSub.broadcast_to_io(
              state[:context_id],
              state[:block_name],
              "output",
              {:text, text_chunk}
            )

            save_text_chunk(pid, text_chunk)
          end,
          on_tool_content: fn tool_name, content ->
            save_tool_result(pid, tool_name, content)
          end,
          on_end: fn _chat_token_summary ->
            finish_chat_message(pid)
          end,
          on_error: fn error ->
            send_error(state, error)
            finish_chat_message(pid)
          end,
          api_key: state[:api_key],
          model: state[:opts].model,
          temperature: state[:opts].temperature,
          tools: tools
        )
      end)

      {:noreply, state}
    else
      {:noreply, state}
    end
  end

  def handle_cast({:save_text_chunk, chunk}, state) do
    messages = state[:messages]
    last_message = List.last(messages)

    messages =
      case last_message do
        %{role: "assistant"} ->
          List.delete_at(messages, -1) ++
            [
              %{
                role: "assistant",
                content:
                  (last_message.content <> chunk)
                  |> String.trim_leading()
                  |> String.replace("\n", " ")
              }
            ]

        _ ->
          messages ++ [%{role: "assistant", content: chunk}]
      end

    state = put_in(state[:messages], messages)
    existing_sentences = state[:sentences]

    sentences =
      messages
      |> List.last()
      |> Map.get(:content)
      |> Essence.Chunker.sentences()

    state = put_in(state[:sentences], sentences)

    state =
      if Enum.count(sentences) > 1 && Enum.count(sentences) != Enum.count(existing_sentences) do
        sentence = Enum.at(sentences, -2)

        Buildel.BlockPubSub.broadcast_to_io(
          state[:context_id],
          state[:block_name],
          "sentences_output",
          {:text, sentence}
        )

        put_in(state[:sent_sentences], state[:sent_sentences] ++ [sentence])
      else
        state
      end

    {:noreply, state}
  end

  def handle_cast({:finish_chat_message}, state) do
    sentences = state[:sentences]
    sent_sentences = state[:sent_sentences]

    state =
      if sentences != sent_sentences do
        sentence = Enum.at(sentences, -1)

        Buildel.BlockPubSub.broadcast_to_io(
          state[:context_id],
          state[:block_name],
          "sentences_output",
          {:text, sentence}
        )

        put_in(state[:sent_sentences], []) |> put_in([:sentences], [])
      else
        state
      end
      |> send_stream_stop()

    {:noreply, state}
  end

  @impl true
  def handle_info({name, :text, message}, state) do
    state = save_take_latest_message(state, name, message)
    send_message(self(), {:text, message})
    {:noreply, state}
  end

  defp hugging_face_chat() do
    Buildel.Clients.HuggingFaceChat
  end
end
