defmodule Buildel.Blocks.Chat do
  require Logger
  alias Buildel.Blocks.Utils.ChatMemory
  use Buildel.Blocks.Block
  use Buildel.Blocks.Utils.TakeLatest
  alias LangChain.Function

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :send_message

  @impl true
  def options() do
    %{
      type: "chat",
      description: "Large Language Model chat block enabling advanced conversational interactions powered by OpenAI's cutting-edge language models.",
      groups: ["text", "llms"],
      inputs: [Block.text_input()],
      outputs: [
        Block.text_output("output"),
        Block.text_output("message_output")
      ],
      ios: [Block.io("tool", "controller"), Block.io("chat", "worker")],
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
              "description",
              "model",
              "chat_memory_type",
              "temperature",
              "system_message",
              "messages",
              "api_key",
              "endpoint",
              "api_type"
            ],
            "properties" =>
              Jason.OrderedObject.new(
                description: %{
                  "type" => "string",
                  "title" => "Description",
                  "description" => "The description of the chat."
                },
                api_key:
                  secret_schema(%{
                    "title" => "API key",
                    "description" => "OpenAI API key to use for the chat."
                  }),
                model: %{
                  "type" => "string",
                  "title" => "Model",
                  "description" => "The model to use for the chat.",
                  "enum" => ["gpt-3.5-turbo", "gpt-4", "gpt-3.5-turbo-1106", "gpt-4-1106-preview"],
                  "enumPresentAs" => "radio",
                  "default" => "gpt-3.5-turbo"
                },
                endpoint: %{
                  "type" => "string",
                  "title" => "Endpoint",
                  "description" => "The endpoint to use for the chat.",
                  "default" => "https://api.openai.com/v1/chat/completions"
                },
                api_type: %{
                  "type" => "string",
                  "title" => "API type",
                  "description" => "The API type to use for the chat.",
                  "enum" => ["openai", "azure"],
                  "enumPresentAs" => "radio",
                  "default" => "openai"
                },
                chat_memory_type: %{
                  "type" => "string",
                  "title" => "Chat memory type",
                  "description" => "The chat memory type to use for the chat.",
                  "enum" => ["off", "full", "rolling"],
                  "enumPresentAs" => "radio",
                  "default" => "full"
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
                  "editorLanguage" => "custom",
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
                        "presentAs" => "editor",
                        "editorLanguage" => "custom",
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

  def send_message_sync(pid, {:text, _text} = message, %{block_name: block_name}) do
    GenServer.cast(
      pid,
      {:save_input, %{block_name: block_name, message: message, output_name: "tool"}}
    )

    GenServer.call(pid, {:send_message, message}, 5 * 60_000)
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
        %{
          context_id: context_id,
          type: __MODULE__,
          opts: opts,
          connections: connections
        } = state
      ) do
    subscribe_to_connections(context_id, connections)

    api_key = block_secrets_resolver().get_secret_from_context(context_id, opts.api_key)

    tool_connections =
      connections
      |> Enum.filter(fn
        %{to: %{type: "controller"}} -> true
        _ -> false
      end)

    memory_type_string = opts |> Map.get(:chat_memory_type, "full")

    memory_type =
      %{"off" => :off, "full" => :full, "rolling" => :rolling} |> Map.get(memory_type_string)

    {:ok,
     state
     |> assign_stream_state
     |> assign_take_latest()
     |> Map.put(:prompt_template, opts.prompt_template)
     |> Map.put(:api_key, api_key)
     |> Map.put(:tool_connections, tool_connections)
     |> Map.put(
       :chat_memory,
       ChatMemory.new(%{
         initial_messages: initial_messages(state),
         type: memory_type
       })
     )}
  end

  @impl true
  def handle_cast({:send_message, {:text, _text}}, state) do
    state = send_stream_start(state)

    content =
      replace_input_strings_with_latest_inputs_values(state, state.prompt_template)

    Buildel.BlockPubSub.broadcast_to_io(
      state.context_id,
      state.block_name,
      "message_output",
      {:text, content}
    )

    state = update_in(state.chat_memory, &ChatMemory.add_user_message(&1, %{content: content}))

    with {:ok, _message, state} <- chat_task(state) do
      {:noreply, cleanup_inputs(state)}
    else
      {:error, :not_all_inputs_filled, state} ->
        {:noreply, state}

      {:error, _reason, state} ->
        {:noreply, state}
    end
  end

  @impl true
  def handle_cast(
        {:save_input,
         %{block_name: block_name, message: {:text, text}, output_name: output_name}},
        state
      ) do
    topic = BlockPubSub.io_topic(state[:context_id], block_name, output_name)
    {:noreply, save_latest_input_value(state, topic, text)}
  end

  @impl true
  def handle_cast({:save_text_chunk, chunk}, state) do
    chat_memory = ChatMemory.add_assistant_chunk(state.chat_memory, chunk)
    {:noreply, %{state | chat_memory: chat_memory}}
  end

  @impl true
  def handle_cast({:save_tool_result, tool_name, content}, state) do
    chat_memory =
      ChatMemory.add_tool_result_message(state.chat_memory, %{
        tool_name: tool_name,
        content: content
      })

    {:noreply, %{state | chat_memory: chat_memory}}
  end

  @impl true
  def handle_cast({:finish_chat_message}, %{chat_memory: %ChatMemory{type: :off}} = state) do
    state = update_in(state.chat_memory, &ChatMemory.reset(&1))
    {:noreply, state |> send_stream_stop()}
  end

  @impl true
  def handle_cast({:finish_chat_message}, state) do
    {:noreply, state |> send_stream_stop()}
  end

  @impl true
  def handle_call({:function, %{block_name: block_name}}, _, state) do
    pid = self()

    function =
      Function.new!(%{
        name: state.block.name,
        description: state.opts.description,
        parameters_schema: %{
          type: "object",
          properties: %{
            message: %{
              type: "string",
              description: "Message to send to the agent."
            }
          },
          required: ["message"]
        },
        function: fn %{"message" => message} = _args, _context ->
          send_message_sync(pid, {:text, message}, %{block_name: block_name})
        end
      })

    {:reply, function, state}
  end

  def handle_call({:send_message, {:text, _text}}, _from, state) do
    state = send_stream_start(state)

    content =
      replace_input_strings_with_latest_inputs_values(state, state.prompt_template)

    Buildel.BlockPubSub.broadcast_to_io(
      state[:context_id],
      state[:block_name],
      "message_output",
      {:text, content}
    )

    state = update_in(state.chat_memory, &ChatMemory.add_user_message(&1, %{content: content}))

    with {:ok, message, state} <- chat_task(state) do
      {:reply, message.content, cleanup_inputs(state)}
    else
      {:error, :not_all_inputs_filled, state} ->
        {:reply, "ERROR: Not ready to answer question, some of input values are missing.", state}

      _ ->
        {:reply, "ERROR: Something went wrong.", state}
    end
  end

  @impl true
  def handle_info({name, :text, message}, state) do
    state = save_latest_input_value(state, name, message)
    send_message(self(), {:text, message})
    {:noreply, state}
  end

  defp chat_task(state) do
    tools =
      state[:tool_connections]
      |> Enum.map(fn connection ->
        pid = block_context().block_pid(state[:context_id], connection.from.block_name)
        Buildel.Blocks.Block.function(pid, %{block_name: state.block_name})
      end)

    pid = self()

    with {:ok, messages} <- fill_messages(state),
         {:ok, _, message} <-
           chat_gpt().stream_chat(%{
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
             on_tool_content: &save_tool_result(pid, &1, &2),
             on_end: fn chat_token_summary ->
               cost =
                 Buildel.Costs.CostCalculator.calculate_chat_cost(chat_token_summary)

               block_context().create_run_cost(
                 state[:context_id],
                 state[:block_name],
                 cost
               )

               finish_chat_message(pid)
             end,
             on_error: fn
               :context_length_exceeded ->
                 send_error(state, "Context length exceeded")
                 nil

               error ->
                 send_error(state, error)
                 finish_chat_message(pid)
             end,
             api_key: state[:api_key],
             model: state[:opts].model,
             temperature: state[:opts].temperature,
             tools: tools,
             endpoint: state[:opts].endpoint,
             api_type: state[:opts].api_type
           }) do
      {:ok, message, state}
    else
      {:error, :not_all_inputs_filled} ->
        {:error, :not_all_inputs_filled, state}

      {:error, :context_length_exceeded} ->
        with {:ok, chat_memory} <- ChatMemory.drop_first_non_initial_message(state.chat_memory) do
          state = state |> Map.put(:chat_memory, chat_memory)
          chat_task(state)
        else
          {:error, :full_chat_memory} ->
            send_error(state, "Chat memory is full")
            {:error, :full_chat_memory, state}

          _ ->
            send_error(state, "Initial messages were too long")
            {:error, :context_length_exceeded, state}
        end

      {:error, reason} ->
        {:error, reason, state}
    end
  end

  defp initial_messages(state) do
    [%{role: "system", content: state.opts.system_message}] ++ state.opts.messages
  end

  defp fill_messages(state) do
    messages =
      state.chat_memory
      |> ChatMemory.get_messages()
      |> Enum.map(fn message ->
        update_in(message.content, &replace_input_strings_with_latest_inputs_values(state, &1))
      end)

    if Enum.all?(messages, &all_inputs_in_string_filled?(&1.content, state.connections)) do
      {:ok, messages}
    else
      {:error, :not_all_inputs_filled}
    end
  end

  defp chat_gpt() do
    Application.fetch_env!(:buildel, :chat_gpt)
  end
end
