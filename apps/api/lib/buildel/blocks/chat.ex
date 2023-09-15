defmodule Buildel.Blocks.Chat do
  require Logger
  use Buildel.Blocks.Block
  use Buildel.Blocks.Utils.TakeLatest

  # Config

  @impl true
  defdelegate input(pid, chunk), to: __MODULE__, as: :send_message
  defdelegate text_output(name), to: Block
  defdelegate text_input(), to: Block
  def sentences_output(), do: text_output("sentences_output")

  @impl true
  def options() do
    %{
      type: "chat",
      inputs: [text_input()],
      outputs: [text_output("output"), sentences_output(), text_output("message_output")],
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
            "required" => ["model", "temperature", "messages", "api_key"],
            "properties" => %{
              "api_key" => %{
                "type" => "string",
                "title" => "API Key",
                "description" => "OpenAI Api key",
                "minLength" => 1,
                "presentAs" => "password"
              },
              "model" => %{
                "type" => "string",
                "title" => "Model",
                "description" => "The model to use for the chat.",
                "enum" => ["gpt-3.5-turbo", "gpt-4"],
                "enumPresentAs" => "radio"
              },
              "temperature" => %{
                "type" => "number",
                "title" => "Temperature",
                "description" => "The temperature of the chat.",
                "default" => 0.7,
                "minimum" => 0.0,
                "maximum" => 1.0,
                "step" => 0.1
              },
              "messages" => %{
                "type" => "array",
                "title" => "Messages",
                "description" => "The messages to start the conversation with.",
                "minItems" => 1,
                "items" => %{
                  "type" => "object",
                  "required" => ["role", "content"],
                  "properties" => %{
                    "role" => %{
                      "type" => "string",
                      "title" => "Role",
                      "enum" => ["user", "assistant", "system"],
                      "enumPresentAs" => "radio"
                    },
                    "content" => %{
                      "type" => "string",
                      "title" => "Content",
                      "presentAs" => "editor"
                    }
                  }
                }
              }
            }
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

    {:ok,
     state
     |> assign_stream_state
     |> assign_take_latest(true)
     |> Keyword.put(:messages, opts[:messages])
     |> Keyword.put(:api_key, opts |> Map.get(:api_key))
     |> Keyword.put(:sentences, [])
     |> Keyword.put(:sent_sentences, [])}
  end

  @impl true
  def handle_cast({:send_message, {:text, text}}, state) do
    state = send_stream_start(state)
    state = put_in(state[:messages], state[:messages] ++ [%{role: "user", content: text}])

    Buildel.BlockPubSub.broadcast_to_io(
      state[:context_id],
      state[:block_name],
      "message_output",
      {:text, text}
    )

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

      Task.start(fn ->
        chat_gpt().stream_chat(
          context: %{messages: messages},
          on_content: fn text_chunk ->
            Buildel.BlockPubSub.broadcast_to_io(
              state[:context_id],
              state[:block_name],
              "output",
              {:text, text_chunk}
            )

            save_text_chunk(pid, text_chunk)
          end,
          on_end: fn ->
            finish_chat_message(pid)
          end,
          api_key: state[:api_key]
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
                content: (last_message.content <> chunk) |> String.replace("\n", " ")
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

  defp chat_gpt() do
    Application.get_env(:bound, :chat_gpt, Buildel.Clients.ChatGPT)
  end
end
