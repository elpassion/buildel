defmodule Buildel.Blocks.NewChat do
  alias Buildel.Blocks.Fields.EditorField
  alias EditorField.Suggestion
  use Buildel.Blocks.NewBlock
  import Buildel.Blocks.Utils.Schemas

  defblock(:chat,
    description:
      "Chat block for large language models, enabling advanced conversational interactions powered by cutting-edge language models from various providers.",
    groups: ["llms", "text"]
  )

  definput(:input, schema: %{})

  defoutput(:output, schema: %{})

  defoption(:api_type, %{
    "type" => "string",
    "title" => "Model API type",
    "description" => "The API type to use for the chat.",
    "enum" => ["openai", "azure", "google", "mistral", "anthropic"],
    "enumPresentAs" => "radio",
    "default" => "openai",
    "readonly" => true
  })

  defoption(
    :api_key,
    secret_schema(%{
      "title" => "API key",
      "description" => "API key to use for the chat.",
      "descriptionWhen" => %{
        "opts.api_type" => %{
          "openai" =>
            "[OpenAI API key](https://platform.openai.com/api-keys) to use for the chat.",
          "azure" => "Azure API key to use for the chat.",
          "google" => "Google API key to use for the chat.",
          "mistral" =>
            "[Mistral API key](https://console.mistral.ai/api-keys/) to use for the chat.",
          "anthropic" => "[Anthropic API key](https://www.anthropic.com/api) to use for the chat."
        }
      },
      "defaultWhen" => %{
        "opts.api_type" => %{
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
    "defaultWhen" => %{
      "opts.api_type" => %{
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
      "/api/organizations/{{organization_id}}/models?api_type={{opts.api_type}}&endpoint={{opts.endpoint}}&api_key={{opts.api_key}}",
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

  defoption(:max_tokens, %{
    "type" => "number",
    "title" => "Maximum tokens",
    "description" => "Maximum amount of tokens that can be generated in the chat completion.",
    "minimum" => 0.0,
    "step" => 1,
    "readonly" => true,
    "default" => 10_000
  })

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
         {:ok, _chat_messages, state} <- fill_chat_messages(state),
         {:ok, state} <- start_chat_completion(state, message) do
      state = reset_latest_messages(state)
      {:ok, state}
    else
      {:error, :not_all_chat_messages_filled, state} ->
        {:ok, state}
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

  defp start_chat_completion(state, message) do
    Task.start(chat_completion_task(state, message))
    {:ok, state}
  end

  defp chat_completion_task(state, message) do
    fn ->
      send_stream_start(state, :output, message)

      {:ok, chat_messages, state} = fill_chat_messages(state)

      chat().stream_chat(
        messages: chat_messages,
        model: option(state, :model),
        api_key: secret(state, option(state, :api_key)),
        temperature: option(state, :temperature),
        endpoint: option(state, :endpoint),
        api_type: option(state, :api_type),
        response_format: option(state, :response_format),
        max_tokens: option(state, :max_tokens),
        on_content: fn text_chunk ->
          output(
            state,
            :output,
            Message.from_message(message)
            |> Message.set_type(:text)
            |> Message.set_message(text_chunk),
            stream_stop: :none
          )
        end,
        on_end: fn ->
          send_stream_stop(state, :output, message)
        end,
        on_error: fn error ->
          send_error(state, error)
          send_stream_stop(state, :output, message)
        end
      )
    end
  end

  defp chat() do
    Application.fetch_env!(:buildel, :chat)
  end

  defp initial_messages(state) do
    [%{role: "system", content: option(state, :system_message)}] ++
      option(state, :messages) ++
      [%{role: "user", content: option(state, :prompt_template)}]
  end

  defp fill_chat_messages(state) do
    with filled_chat_messages <-
           initial_messages(state)
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

  defp fill_chat_message(inputs, chat_message) do
    inputs
    |> Enum.reduce(chat_message, &fill_chat_message/2)
  end
end
