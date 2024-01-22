defmodule Buildel.Blocks.Chat do
  require Logger
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
                temperature: %{
                  "type" => "number",
                  "title" => "Temperature",
                  "description" => "The temperature of the chat.",
                  "default" => 0.7,
                  "minimum" => 0.0,
                  "maximum" => 1.0,
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

    api_key =
      block_secrets_resolver().get_secret_from_context(context_id, opts |> Map.get(:api_key))

    tool_connections =
      connections
      |> Enum.filter(fn
        %{to: %{type: "controller"}} -> true
        _ -> false
      end)

    {:ok,
     state
     |> assign_stream_state
     |> assign_take_latest()
     |> Map.put(:system_message, opts.system_message)
     |> Map.put(:prompt_template, opts.prompt_template)
     |> Map.put(:messages, initial_messages(state))
     |> Map.put(:api_key, api_key)
     |> Map.put(:tool_connections, tool_connections)}
  end

  defp initial_messages(state) do
    [%{role: "system", content: state.opts.system_message}] ++ state.opts.messages
  end

  @impl true
  def handle_cast({:send_message, {:text, text}}, state) do
    state = send_stream_start(state)

    Buildel.BlockPubSub.broadcast_to_io(
      state.context_id,
      state.block_name,
      "message_output",
      {:text, text}
    )

    state = %{
      state
      | messages:
          state.messages ++
            [
              %{
                role: "user",
                content:
                  replace_input_strings_with_latest_inputs_values(state, state.prompt_template)
              }
            ]
    }

    messages =
      state.messages
      |> Enum.map(fn message ->
        %{
          message
          | content: replace_input_strings_with_latest_inputs_values(state, message.content)
        }
      end)

    if(Enum.all?(messages, &all_inputs_in_string_filled?(&1.content, state.connections))) do
      chat_task(%{messages: messages, state: state})
      {:noreply, cleanup_inputs(state)}
    else
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
    {:noreply, save_take_latest_message(state, topic, text)}
  end

  @impl true
  def handle_cast({:save_input, _}, state) do
    {:noreply, state}
  end

  def handle_call({:send_message, {:text, text}}, _from, state) do
    state = send_stream_start(state)

    Buildel.BlockPubSub.broadcast_to_io(
      state[:context_id],
      state[:block_name],
      "message_output",
      {:text, text}
    )

    state = %{
      state
      | messages:
          state.messages ++
            [
              %{
                role: "user",
                content:
                  replace_input_strings_with_latest_inputs_values(state, state.prompt_template)
              }
            ]
    }

    messages =
      state.messages
      |> Enum.map(fn message ->
        %{
          message
          | content: replace_input_strings_with_latest_inputs_values(state, message.content)
        }
      end)

    if(Enum.all?(messages, &all_inputs_in_string_filled?(&1.content, state.connections))) do
      {:ok, _chain, message} =
        chat_task(%{
          messages: messages,
          state: state
        })

      {:reply, message.content, cleanup_inputs(state)}
    else
      {:reply, "ERROR: Not ready to answer question, some of input values are missing.", state}
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

    {:noreply, state}
  end

  def handle_cast({:save_tool_result, tool_name, content}, state) do
    messages = state[:messages] ++ [%{role: "tool", content: content, tool_name: tool_name}]
    state = put_in(state[:messages], messages)
    {:noreply, state}
  end

  def handle_cast({:finish_chat_message}, state) do
    {:noreply, state |> send_stream_stop()}
  end

  defp chat_task(%{messages: messages, state: state}) do
    tools =
      state[:tool_connections]
      |> Enum.map(fn connection ->
        pid = block_context().block_pid(state[:context_id], connection.from.block_name)
        Buildel.Blocks.Block.function(pid, %{block_name: state.block_name})
      end)

    with {:ok, _, _} = result <-
           call_chat(%{
             messages: messages,
             tools: tools,
             state: state
           }) do
      result
    else
      {:error, :context_length_exceeded} ->
        with {:ok, messages} <- remove_last_non_initial_message(state) do
          state = put_in(state[:messages], messages)

          chat_task(%{
            messages: messages,
            tools: tools,
            state: state
          })
        else
          _ ->
            send_error(state, "Initial messages were too long")
        end
    end
  end

  defp call_chat(%{messages: messages, tools: tools, state: state}) do
    pid = self()

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
      on_tool_content: fn tool_name, content ->
        save_tool_result(pid, tool_name, content)
      end,
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
    })
  end

  defp remove_last_non_initial_message(state) do
    if Enum.count(state[:messages]) == Enum.count(initial_messages(state)) do
      {:error, :initial_messages_too_long}
    else
      {:ok, state[:messages] |> List.delete_at(initial_messages(state) |> Enum.count())}
    end
  end

  @impl true
  def handle_info({name, :text, message}, state) do
    state = save_take_latest_message(state, name, message)
    send_message(self(), {:text, message})
    {:noreply, state}
  end

  @impl true
  def handle_call({:function, %{block_name: block_name}}, _, state) do
    pid = self()

    function =
      Function.new!(%{
        name: state.opts.name,
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

  defp chat_gpt() do
    Application.fetch_env!(:buildel, :chat_gpt)
  end
end
