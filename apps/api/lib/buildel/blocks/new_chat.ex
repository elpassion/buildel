defmodule Buildel.Blocks.NewChat do
  alias LangChain.Function
  alias Buildel.Blocks.Utils.ChatMemory
  alias Buildel.Blocks.Fields.EditorField
  alias EditorField.Suggestion
  use Buildel.Blocks.NewBlock, tool_controller: true
  import Buildel.Blocks.Utils.Schemas

  defblock(:chat,
    description:
      "Chat block for large language models, enabling advanced conversational interactions powered by cutting-edge language models from various providers.",
    groups: ["llms", "text"]
  )

  definput(:input, schema: %{})

  defoutput(:output, schema: %{})

  defsection(:model, title: "Title", description: "Description") do
    defoption(
      :api_type,
      %{
        "type" => "string",
        "title" => "Model API type",
        "description" => "The API type to use for the chat.",
        "enum" => ["openai", "azure", "google", "mistral", "anthropic"],
        "enumPresentAs" => "radio",
        "default" => "openai",
        "readonly" => true
      }
    )

    defoption(
      :api_key,
      secret_schema(%{
        "title" => "API key",
        "description" => "API key to use for the chat.",
        "descriptionWhen" => %{
          "opts.model.api_type" => %{
            "openai" =>
              "[OpenAI API key](https://platform.openai.com/api-keys) to use for the chat.",
            "azure" => "Azure API key to use for the chat.",
            "google" => "Google API key to use for the chat.",
            "mistral" =>
              "[Mistral API key](https://console.mistral.ai/api-keys/) to use for the chat.",
            "anthropic" =>
              "[Anthropic API key](https://www.anthropic.com/api) to use for the chat."
          }
        },
        "defaultWhen" => %{
          "opts.model.api_type" => %{
            "openai" => "__openai",
            "azure" => "__azure",
            "google" => "__google",
            "mistral" => "__mistral",
            "anthropic" => "__anthropic"
          }
        }
      })
    )

    defoption(:endpoint, %{
      "type" => "string",
      "title" => "Endpoint",
      "description" => "The endpoint to use for the chat.",
      "presentAs" => "resettable-input",
      "defaultWhen" => %{
        "opts.model.api_type" => %{
          "openai" => "https://api.openai.com/v1",
          "azure" =>
            "https://{resource_name}.openai.azure.com/openai/deployments/{deployment_name}",
          "google" => "https://generativelanguage.googleapis.com/v1beta/models",
          "mistral" => "https://api.mistral.ai/v1",
          "anthropic" => "https://api.anthropic.com/v1"
        }
      },
      "minLength" => 1
    })

    defoption(:model, %{
      "type" => "string",
      "title" => "Model",
      "description" => "The model to use for the chat.",
      "url" =>
        "/api/organizations/{{organization_id}}/models?api_type={{opts.model.api_type}}&endpoint={{opts.model.endpoint}}&api_key={{opts.model.api_key}}",
      "presentAs" => "async-select",
      "minLength" => 1,
      "readonly" => true
    })

    defoption(:temperature, %{
      "type" => "number",
      "title" => "Temperature",
      "description" => "The temperature of the chat.",
      "default" => 0.7,
      "minimum" => 0.0,
      "maximum" => 2.0,
      "step" => 0.1,
      "readonly" => true
    })
  end

  deftool(:query,
    description:
      "Search through documents and find text chunks related to the query. If you want to read the whole document a chunk comes from, use the `documents` function.
            CALL IT WITH FORMAT `{ \"query\": \"example query\" }`
            You can also use filters to narrow down the search results. Filters are optional. Apply filters based on the metadata of the documents from previous queries.
            You can use `document_id` property to narrow the search to the specific document.
            DO NOT SET MORE THAN 2 KEYWORDS",
    schema: %{
      "type" => "object",
      "properties" => %{
        "message" => %{
          "type" => "string",
          "description" => "Message to send to the agent."
        }
      },
      "required" => ["message"]
    }
  )

  defoption(:chat_memory_type, %{
    "type" => "string",
    "title" => "Chat memory type",
    "description" => "The chat memory type to use for the chat.",
    "enum" => ["off", "full", "rolling"],
    "enumPresentAs" => "radio",
    "default" => "full",
    "minLength" => 1
  })

  defoption(
    :max_tokens,
    %{
      "type" => "number",
      "title" => "Maximum tokens",
      "description" => "Maximum amount of tokens that can be generated in the chat completion.",
      "minimum" => 0.0,
      "step" => 1,
      "readonly" => true
    },
    required: false
  )

  defoption(:response_format, %{
    "type" => "string",
    "title" => "Chat response format",
    "description" => "The format used by chat to respond.",
    "enum" => ["text", "json"],
    "enumPresentAs" => "radio",
    "default" => "text",
    "minLength" => 1
  })

  defoption(
    :system_message,
    EditorField.new(%{
      readonly: true,
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
    })
  )

  defoption(:messages, %{
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
  })

  defoption(
    :prompt_template,
    EditorField.new(%{
      readonly: true,
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

  def handle_input(:input, %Message{} = message, state) do
    send_stream_start(state, :output, message)

    with {:ok, state} <- save_input_message(state, message),
         {:ok, chat_messages, state} <- fill_chat_messages(state),
         {:ok, state} <- start_chat_completion(state, message, async: true),
         {:ok, state} <- save_chat_message(state, chat_messages |> Enum.at(-1)),
         state <- reset_latest_messages(state) do
      {:ok, state}
    else
      {:error, :not_all_chat_messages_filled, state} ->
        {:ok, state}
    end
  end

  def handle_tool_call(:query, %Message{} = message, state) do
    send_stream_start(state, :output, message)
    response = Message.from_message(message) |> Message.set_type(:tool_response)

    with {:ok, state} <- save_input_message(state, message),
         {:ok, chat_messages, state} <- fill_chat_messages(state),
         {:ok, result, state} <- start_chat_completion(state, message, async: false),
         {:ok, state} <- save_chat_message(state, chat_messages |> Enum.at(-1)),
         state <- reset_latest_messages(state) do
      {:ok, response |> Message.set_message(result), state}
    else
      {:error, :not_all_chat_messages_filled, state} ->
        {:ok, response |> Message.set_message("Fill all messages before sending result"), state}

      {:error, e, state} ->
        {:ok, response |> Message.set_message(to_string(e)), state}
    end
  end

  defp save_input_message(state, message) do
    latest_messages =
      state
      |> Map.get_lazy(:latest_messages, fn -> initial_latest_messages(state) end)
      |> Map.put(message.topic, message)

    {:ok, state |> Map.put(:latest_messages, latest_messages)}
  end

  defp reset_latest_messages(state) do
    state |> Map.put(:latest_messages, initial_latest_messages(state))
  end

  defp initial_latest_messages(state) do
    state.block.connections
    |> Enum.map(fn %{from: %{block_name: block_name, name: name}} ->
      {Buildel.BlockPubSub.io_topic(state.context.context_id, block_name, name), nil}
    end)
    |> Enum.into(%{})
  end

  defp start_chat_completion(state, message, async: false) do
    task = Task.async(chat_completion_task(state, message))
    {:chat_completion, _message, last_message} = Task.await(task, 5 * 60_000)
    {:ok, last_message.content, state}
  end

  defp start_chat_completion(state, message, async: true) do
    Task.start(chat_completion_task(state, message))
    {:ok, state}
  end

  defp chat_completion_task(state, message) do
    pid = self()

    fn ->
      send_stream_start(state, :output, message)

      tools = get_connected_tools(state)
      chat_tools = tools |> then(&chat_tool(state, &1))

      with {:ok, chat_messages, state} <- fill_chat_messages(state),
           {:ok, _, last_message} <-
             chat().stream_chat(
               messages: chat_messages,
               model: option(state, :model),
               api_key: secret(state, option(state, :api_key)),
               temperature: option(state, :temperature),
               endpoint: option(state, :endpoint),
               api_type: option(state, :api_type),
               response_format: option(state, :response_format),
               max_tokens: option(state, :max_tokens),
               tools: chat_tools,
               on_content: fn text_chunk ->
                 send(pid, {:save_chat_chunk, text_chunk})

                 output(
                   state,
                   :output,
                   Message.from_message(message)
                   |> Message.set_type(:text)
                   |> Message.set_message(text_chunk),
                   stream_stop: :none
                 )
               end,
               on_tool_call: fn tool_calls ->
                 tool_calls
                 |> Enum.map(fn tool_call ->
                   tool = tools |> Enum.find(&(Map.get(&1, :name) == tool_call.name))

                   output(
                     state,
                     :output,
                     Message.from_message(message)
                     |> Message.set_type(:text)
                     |> Message.set_message(tool.call_formatter.(tool_call.arguments)),
                     stream_stop: :none
                   )
                 end)
               end,
               on_tool_content: fn tool_results ->
                 tool_results
                 |> Enum.map(fn tool_result ->
                  tool = tools |> Enum.find(&(Map.get(&1, :name) == tool_result.name))

                   output(
                     state,
                     :output,
                     Message.from_message(message)
                     |> Message.set_type(:text)
                     |> Message.set_message(tool.response_formatter.(%{content: tool_result.content})),
                     stream_stop: :none
                   )
                 end)
               end,
               on_end: fn ->
                 send_stream_stop(state, :output, message)
               end,
               on_error: fn
                 error ->
                   send_error(
                     state,
                     Message.from_message(message)
                     |> Message.set_type(:text)
                     |> Message.set_message(error)
                   )

                   send_stream_stop(state, :output, message)
               end
             ) do
        {:chat_completion, message, last_message}
      else
        {:error, :context_length_exceeded} ->
          case state.memory do
            %{type: :full} ->
              send_error(
                state,
                Message.from_message(message)
                |> Message.set_type(:text)
                |> Message.set_message(:context_length_exceeded)
              )

              send_stream_stop(state, :output, message)

            %{type: :rolling} ->
              send(pid, {:remove_latest_message_and_start_chat_completion, message})
          end

        error ->
          error
      end
    end
  end

  defp chat() do
    Application.fetch_env!(:buildel, :chat)
  end

  defp initial_messages(state) do
    [%{role: "system", content: option(state, :system_message)}] ++
      option(state, :messages)
  end

  defp fill_chat_messages(state) do
    state =
      Map.put_new_lazy(state, :memory, fn ->
        ChatMemory.new(%{
          initial_messages: initial_messages(state),
          type: option(state, :chat_memory_type) |> String.to_existing_atom()
        })
      end)

    with filled_chat_messages <-
           state.memory
           |> ChatMemory.get_messages()
           |> Kernel.++([%{role: "user", content: option(state, :prompt_template)}])
           |> Enum.map(&fill_chat_message(latest_messages_to_inputs(state.latest_messages), &1)) do
      if(Enum.member?(filled_chat_messages, :error)) do
        {:error, :not_all_chat_messages_filled, state}
      else
        {:ok, filled_chat_messages, state}
      end
    end
  end

  defp latest_messages_to_inputs(latest_messages) do
    latest_messages
    |> Enum.map(fn {topic, message} ->
      %{block: block, io: output} = Buildel.BlockPubSub.io_from_topic(topic)
      {"#{block}:#{output}", message}
    end)
    |> Enum.into(%{})
  end

  defp fill_chat_message(_, :error) do
    :error
  end

  defp fill_chat_message({input, nil}, chat_message) do
    if String.contains?(chat_message.content, "{{#{input}}}"), do: :error, else: chat_message
  end

  defp fill_chat_message({input, %Message{type: :text} = message}, chat_message) do
    %{
      chat_message
      | content: String.replace(chat_message.content, "{{#{input}}}", message.message)
    }
  end

  defp fill_chat_message({input, %Message{type: :json} = message}, chat_message) do
    %{
      chat_message
      | content:
          String.replace(
            chat_message.content,
            "{{#{input}}}",
            message.message |> Jason.encode!()
          )
    }
  end

  defp fill_chat_message({input, %Message{type: :tool_call} = message}, chat_message) do
    %{
      chat_message
      | content:
          String.replace(
            chat_message.content,
            "{{#{input}}}",
            message.message.args |> Jason.encode!()
          )
    }
  end

  defp fill_chat_message(inputs, chat_message) when is_map(inputs) do
    inputs
    |> Enum.reduce(chat_message, &fill_chat_message/2)
  end

  defp save_chat_message(state, new_chat_message) do
    state = update_in(state.memory, &ChatMemory.add_user_message(&1, new_chat_message))
    {:ok, state}
  end

  defp save_chat_chunk(state, chunk) do
    state = update_in(state.memory, &ChatMemory.add_assistant_chunk(&1, chunk))
    {:ok, state}
  end

  defp chat_tool(state, tools) when is_list(tools) do
    tools
    |> Enum.map(&chat_tool(state, &1))
  end

  defp chat_tool(_state, tool) do
    Function.new!(%{
      name: to_string(tool.name),
      description: tool.description,
      parameters_schema: tool.schema,
      function: fn args, _context ->
        %Message{message: message} = tool.call.(args)
        {:ok, Jason.encode!(message)}
      end
    })
  end

  def handle_info({:save_chat_chunk, chat_message}, state) do
    {:ok, state} = save_chat_chunk(state, chat_message)
    {:noreply, state}
  end

  def handle_info({_, {:chat_completion, _, _}}, state) do
    IO.inspect("COMPLETE")
    {:noreply, state}
  end

  def handle_info({:DOWN, _, _, _, _}, state) do
    IO.inspect("DOWN")
    {:noreply, state}
  end

  def handle_info({:remove_latest_message_and_start_chat_completion, message}, state) do
    with {:ok, memory} <- ChatMemory.drop_first_non_initial_message(state.memory),
         state <- put_in(state.memory, memory),
         {:ok, state} <- start_chat_completion(state, message, async: true) do
      {:noreply, state}
    else
      {:error, :full_chat_memory} ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message(:full_chat_memory)
        )

        send_stream_stop(state, :output, message)
        {:noreply, state}
    end
  end
end
