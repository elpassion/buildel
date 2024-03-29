defmodule Buildel.Blocks.Chat do
  require Logger
  alias Buildel.Blocks.Fields.EditorField.Suggestion
  alias Buildel.Blocks.Fields.EditorField
  alias Buildel.Langchain.TokenUsage
  alias Buildel.Blocks.Utils.ChatMemory
  use Buildel.Blocks.Block
  use Buildel.Blocks.Utils.TakeLatest
  alias LangChain.Function
  alias Buildel.Blocks.Utils.Injectable
  alias Buildel.FlattenMap

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :send_message

  @impl true
  def options() do
    %{
      type: "chat",
      description:
        "Large Language Model chat block enabling advanced conversational interactions powered by OpenAI's cutting-edge language models.",
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
              "api_key",
              "api_type",
              "model",
              "endpoint",
              "chat_memory_type",
              "temperature",
              "system_message",
              "messages",
              "prompt_template"
            ],
            "properties" =>
              Jason.OrderedObject.new(
                description: %{
                  "type" => "string",
                  "title" => "Description",
                  "description" => "The description of the chat.",
                  "default" => "Chat with a large language model."
                },
                api_key:
                  secret_schema(%{
                    "title" => "API key",
                    "description" => "OpenAI API key to use for the chat."
                  }),
                api_type: %{
                  "type" => "string",
                  "title" => "Model API type",
                  "description" => "The API type to use for the chat.",
                  "enum" => ["openai", "azure", "google", "mistral"],
                  "enumPresentAs" => "radio",
                  "default" => "openai"
                },
                model: %{
                  "type" => "string",
                  "title" => "Model",
                  "description" => "The model to use for the chat.",
                  "url" =>
                    "/api/organizations/{{organization_id}}/models?api_type={{opts.api_type}}",
                  "presentAs" => "async-select",
                  "minLength" => 1
                },
                endpoint: %{
                  "type" => "string",
                  "title" => "Endpoint",
                  "description" => "The endpoint to use for the chat.",
                  "defaultWhen" => %{
                    "opts.api_type" => %{
                      "openai" => "https://api.openai.com/v1/chat/completions",
                      "azure" =>
                        "https://{resource_name}.openai.azure.com/openai/deployments/{deployment_name}/chat/completions?api-version={api_version}",
                      "google" => "https://generativelanguage.googleapis.com/v1beta/models",
                      "mistral" => "https://api.mistral.ai/v1/chat/completions"
                    }
                  },
                  "minLength" => 1
                },
                chat_memory_type: %{
                  "type" => "string",
                  "title" => "Chat memory type",
                  "description" => "The chat memory type to use for the chat.",
                  "enum" => ["off", "full", "rolling"],
                  "enumPresentAs" => "radio",
                  "default" => "full",
                  "minLength" => 1
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
                call_formatter:
                  EditorField.call_formatter(%{
                    default: "@{{config.block_name}} 🗨️:  {{config.args}}\n"
                  }),
                system_message:
                  EditorField.new(%{
                    title: "System message",
                    description: "The message to start the conversation with.",
                    minLength: 1,
                    default: "You are a helpful assistant.",
                    suggestions: [
                      Suggestion.inputs(),
                      Suggestion.metadata(),
                      Suggestion.secrets(),
                      Suggestion.new(%{
                        type: "test",
                        value: "test.value",
                        title: "Test suggestion"
                      })
                    ]
                  }),
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
                      "content" =>
                        EditorField.new(%{
                          title: "Content",
                          description: "The content of the message.",
                          suggestions: [
                            Suggestion.inputs(),
                            Suggestion.metadata(),
                            Suggestion.secrets()
                          ]
                        })
                    }
                  },
                  "default" => []
                },
                prompt_template:
                  EditorField.new(%{
                    title: "Prompt template",
                    description:
                      "The template to use for the prompt. Pass `{{input_name:output}}` to use the input value.",
                    minLength: 1,
                    default: "{{text_input_1:output}}",
                    suggestions: [
                      Suggestion.inputs(),
                      Suggestion.metadata(),
                      Suggestion.secrets()
                    ]
                  })
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

  defp save_input_and_send_message(pid, {topic, :text, message}) do
    %{block: block, io: output} = Buildel.BlockPubSub.io_from_topic(topic)

    GenServer.cast(
      pid,
      {:save_input, %{block_name: block, message: {:text, message}, output_name: output}}
    )

    GenServer.cast(pid, {:send_message, {:text, message}})
  end

  defp save_text_chunk(pid, chunk) do
    GenServer.cast(pid, {:save_text_chunk, chunk})
  end

  defp finish_chat_message(pid) do
    GenServer.cast(pid, {:finish_chat_message})
  end

  defp save_tool_call(pid, tool_name, arguments) do
    GenServer.cast(pid, {:save_tool_call, tool_name, arguments})
  end

  defp save_tool_result(pid, tool_name, content) do
    GenServer.cast(pid, {:save_tool_result, tool_name, content})
  end

  defp save_usage(pid, usage) do
    GenServer.cast(pid, {:save_usage, usage})
  end

  defp usage(pid) do
    GenServer.call(pid, {:usage})
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

    api_key = block_context().get_secret_from_context(context_id, opts.api_key)

    tool_connections =
      connections
      |> Enum.filter(fn
        %{to: %{type: "controller"}} -> true
        _ -> false
      end)

    memory_type_string = opts |> Map.get(:chat_memory_type, "full")

    memory_type =
      %{"off" => :off, "full" => :full, "rolling" => :rolling} |> Map.get(memory_type_string)

    flattened_metadata =
      FlattenMap.flatten(opts.metadata)

    {:ok,
     state
     |> assign_stream_state
     |> assign_take_latest()
     |> Map.put(
       :input_queue,
       Buildel.Blocks.Utils.InputQueue.new([], fn input ->
         save_input_and_send_message(self(), input)
       end)
     )
     |> Map.put(:prompt_template, opts.prompt_template)
     |> Map.put(:api_key, api_key)
     |> Map.put(:tool_connections, tool_connections)
     |> Map.put(
       :chat_memory,
       ChatMemory.new(%{
         initial_messages: initial_messages(state),
         type: memory_type
       })
     )
     |> Map.put(:usage, Buildel.Langchain.TokenUsage.new!())
     |> Map.put(
       :available_metadata,
       Injectable.used_metadata_keys([opts.prompt_template, opts.system_message])
       |> Enum.reduce(%{}, fn key, acc ->
         acc
         |> Map.put(key, flattened_metadata[key])
       end)
     )
     |> Map.put(
       :available_secrets,
       Injectable.used_secrets_keys([opts.prompt_template, opts.system_message])
       |> Enum.reduce(%{}, fn secret, acc ->
         acc
         |> Map.put(secret, block_context().get_secret_from_context(state.context_id, secret))
       end)
     )}
  end

  @impl true
  def handle_cast({:send_message, {:text, _text}}, state) do
    state = send_stream_start(state)

    content =
      replace_input_strings_with_latest_inputs_values(state, state.prompt_template)

    content = fill_with_available_metadata_and_secrets(state, content)

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
        state = update_in(state.input_queue, &Buildel.Blocks.Utils.InputQueue.pop(&1))
        {:noreply, state}

      {:error, _reason, state} ->
        state = update_in(state.input_queue, &Buildel.Blocks.Utils.InputQueue.pop(&1))
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
  def handle_cast({:save_tool_call, tool_name, arguments}, state) do
    chat_memory =
      ChatMemory.add_tool_call_message(state.chat_memory, %{
        tool_name: tool_name,
        arguments: arguments
      })

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
    state = update_in(state.input_queue, &Buildel.Blocks.Utils.InputQueue.pop(&1))
    {:noreply, state |> send_stream_stop()}
  end

  @impl true
  def handle_cast({:finish_chat_message}, state) do
    state = update_in(state.input_queue, &Buildel.Blocks.Utils.InputQueue.pop(&1))
    {:noreply, state |> send_stream_stop()}
  end

  @impl true
  def handle_cast({:save_usage, usage}, state) do
    {:noreply, %{state | usage: TokenUsage.add(state.usage, usage)}}
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

    {:reply,
     %{
       function: function,
       call_formatter: fn args ->
         args = %{"config.args" => args, "config.block_name" => state.block.name}
         build_call_formatter(state.block.opts.call_formatter, args)
       end,
       response_formatter: fn _response ->
         ""
       end
     }, state}
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
  def handle_call(
        {:chat_completion,
         %{messages: messages, model: _model, stream: true, stream_to: stream_to}},
        _from,
        state
      ) do
    pid = self()

    tools =
      state[:tool_connections]
      |> Enum.map(fn connection ->
        pid = block_context().block_pid(state[:context_id], connection.from.block_name)
        Buildel.Blocks.Block.function(pid, %{block_name: state.block_name})
      end)

    completion_id = "chatcmpl-#{:crypto.strong_rand_bytes(32) |> Base.encode64()}"

    Task.start(fn ->
      {:ok, _chain, last_message} =
        chat().stream_chat(%{
          context: %{messages: messages},
          on_message: fn
            %LangChain.MessageDelta{} = message ->
              message =
                Buildel.Blocks.Utils.ChatCompletionMessageFormatter.format_message_delta(
                  message,
                  completion_id,
                  state[:opts].model
                )

              send(stream_to, {:chat_completion, message})

            %Buildel.Langchain.TokenUsage{} = usage ->
              save_usage(pid, usage)

            _ ->
              nil
          end,
          on_content: fn _content -> nil end,
          on_tool_call: fn _tool_name, _arguments, _message -> nil end,
          on_tool_content: fn _tool_name, _content, _message -> nil end,
          on_cost: fn token_summary ->
            chat_cost = Buildel.Costs.CostCalculator.calculate_chat_cost(token_summary)

            block_context().create_run_cost(
              state[:context_id],
              state[:block_name],
              chat_cost
            )
          end,
          on_end: fn -> nil end,
          on_error: fn _ -> nil end,
          api_key: state[:api_key],
          model: state[:opts].model,
          temperature: state[:opts].temperature,
          tools: tools,
          endpoint: state[:opts].endpoint,
          api_type: state[:opts].api_type
        })

      message =
        Buildel.Blocks.Utils.ChatCompletionMessageFormatter.format_message(
          last_message,
          completion_id,
          state[:opts].model,
          usage(pid)
        )

      send(stream_to, {:chat_end, message})
    end)

    {:reply, {:ok, "streaming"}, state}
  end

  @impl true
  def handle_call({:usage}, _from, state) do
    {:reply, state.usage, state}
  end

  @impl true
  def handle_info({_name, :text, _message} = info, state) do
    state = update_in(state.input_queue, &Buildel.Blocks.Utils.InputQueue.push(&1, info))
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
           chat().stream_chat(%{
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
             on_tool_call: fn tool_name, arguments, message ->
               Buildel.BlockPubSub.broadcast_to_io(
                 state[:context_id],
                 state[:block_name],
                 "output",
                 {:text, message}
               )

               save_tool_call(pid, tool_name, arguments)
             end,
             on_tool_content: fn tool_name, content, message ->
               Buildel.BlockPubSub.broadcast_to_io(
                 state[:context_id],
                 state[:block_name],
                 "output",
                 {:text, message}
               )

               save_tool_result(pid, tool_name, content)
             end,
             on_cost: fn token_summary ->
               chat_cost = Buildel.Costs.CostCalculator.calculate_chat_cost(token_summary)

               block_context().create_run_cost(
                 state[:context_id],
                 state[:block_name],
                 chat_cost
               )
             end,
             on_end: fn ->
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
      |> Enum.map(fn
        %{content: nil} = message ->
          message

        message ->
          update_in(message.content, fn message ->
            message = replace_input_strings_with_latest_inputs_values(state, message)
            fill_with_available_metadata_and_secrets(state, message)
          end)
      end)

    if Enum.all?(messages, &all_inputs_in_string_filled?(&1.content, state.connections)) do
      {:ok, messages}
    else
      {:error, :not_all_inputs_filled}
    end
  end

  defp fill_with_available_metadata_and_secrets(state, string) do
    %{metadata: state.available_metadata, secrets: state.available_secrets}
    |> FlattenMap.flatten()
    |> Enum.reduce(string, fn
      {key, value}, acc when is_number(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string())

      {key, value}, acc when is_binary(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string())

      _, acc ->
        acc
    end)
  end

  defp build_call_formatter(value, args) do
    args
    |> Enum.reduce(value, fn
      {key, value}, acc when is_number(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

      {key, value}, acc when is_binary(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

      {key, value}, acc when is_map(value) ->
        String.replace(acc, "{{#{key}}}", Jason.encode!(value))

      _, acc ->
        acc
    end)
  end

  defp chat() do
    Application.fetch_env!(:buildel, :chat)
  end
end
