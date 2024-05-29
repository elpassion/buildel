defmodule Buildel.Clients.ChatBehaviour do
  @callback stream_chat(%{
              context: map(),
              on_content: any(),
              on_tool_content: any(),
              on_tool_call: any(),
              on_cost: any(),
              on_end: any(),
              on_error: any(),
              api_key: String.t(),
              model: String.t(),
              temperature: number(),
              tools: list(any()),
              messages: list(map())
            }) :: :ok
end

defmodule Buildel.Clients.Chat do
  require Logger
  alias Buildel.Langchain.TokenUsage
  alias Buildel.Langchain.ChatModels.ChatMistralAI
  alias Buildel.LangChain.ChatModels.ChatGoogleAI
  alias Buildel.Clients.ChatBehaviour
  alias Buildel.LangChain.Chains.LLMChain
  alias Buildel.LangChain.ChatModels.ChatOpenAI
  alias LangChain.Message
  alias LangChain.MessageDelta

  @behaviour ChatBehaviour

  @impl ChatBehaviour
  def stream_chat(
        %{
          context: context,
          on_content: on_content,
          on_tool_content: on_tool_content,
          on_tool_call: on_tool_call,
          on_end: on_end,
          on_error: on_error,
          on_cost: on_cost,
          model: model,
          tools: tools
        } = opts
      ) do
    opts =
      opts
      |> Map.put_new(:on_message, fn _ -> nil end)
      |> Map.put_new(:api_type, "openai")
      |> Map.put_new(:endpoint, "https://api.openai.com/v1")
      |> Map.put_new(:response_format, "text")

    llm = get_llm(opts)

    messages =
      context.messages
      |> Enum.map(fn
        %{role: "assistant"} = message ->
          Message.new_assistant!(message.content)

        %{role: "system"} = message ->
          Message.new_system!(message.content)

        %{role: "user"} = message ->
          Message.new_user!(message.content)

        %{role: "tool"} = message ->
          Message.new_function!(message.tool_name, message.content)

        %{role: "tool_call"} = message ->
          Message.new_function_call!(message.tool_name, Jason.encode!(message.arguments))
      end)

    callback_fn = fn
      %MessageDelta{content: nil} ->
        nil

      %MessageDelta{} = data ->
        on_content.(data.content)

      %Message{function_name: nil} ->
        nil

      %Message{function_name: function_name, content: content, arguments: nil}
      when is_binary(function_name) and is_binary(content) ->
        %{response_formatter: response_formatter} =
          tools |> Enum.find(fn tool -> tool.function.name == function_name end)

        on_tool_content.(function_name, content, response_formatter.(content))

      %Message{function_name: function_name, arguments: arguments}
      when is_binary(function_name) ->
        case tools |> Enum.find(fn tool -> tool.function.name == function_name end) do
          nil ->
            Logger.debug("Tool not found: #{function_name}")
            nil

          %{call_formatter: call_formatter} ->
            on_tool_call.(function_name, arguments, call_formatter.(arguments))
        end

      %Message{} ->
        nil

      %TokenUsage{} = usage ->
        token_summary = %Buildel.Langchain.ChatTokenSummary{
          input_tokens: usage.prompt_tokens,
          output_tokens: usage.completion_tokens,
          model: model,
          endpoint: llm.endpoint
        }

        on_cost.(token_summary)
        nil

      {:error, reason} ->
        on_error.(reason)
        nil
    end

    with {:ok, chain, message} <-
           LLMChain.new!(%{
             llm: llm,
             custom_context: context
           })
           |> LLMChain.add_functions(tools |> Enum.map(& &1.function))
           |> LLMChain.add_messages(messages)
           |> LLMChain.run(
             while_needs_response: true,
             callback_fn: fn message ->
               opts.on_message.(message)
               callback_fn.(message)
             end
           ) do
      on_end.()

      {:ok, chain, message}
    else
      {:error, "context_length_exceeded"} ->
        on_error.(:context_length_exceeded)
        {:error, :context_length_exceeded}

      {:error, reason} ->
        on_error.(reason)
        {:error, reason}
    end
  end

  def get_models(%{api_type: "openai"} = opts) do
    with {:ok, %HTTPoison.Response{status_code: status_code, body: body}}
         when status_code >= 200 and status_code < 400 <-
           HTTPoison.get(opts.endpoint <> "/models", Authorization: "Bearer #{opts.api_key}") do
      body
      |> Jason.decode!()
      |> Map.get("data")
      |> Enum.map(fn model ->
        %{id: model["id"], name: model["id"], api_type: "openai"}
      end)
    else
      _ ->
        []
    end
  end

  def get_models(%{api_type: "mistral"} = opts) do
    with {:ok, %HTTPoison.Response{status_code: status_code, body: body}}
         when status_code >= 200 and status_code < 400 <-
           HTTPoison.get(opts.endpoint <> "/models", Authorization: "Bearer #{opts.api_key}") do
      body
      |> Jason.decode!()
      |> Map.get("data")
      |> Enum.map(fn model ->
        %{id: model["id"], name: model["id"], api_type: "mistral"}
      end)
    else
      _ ->
        []
    end
  end

  def get_models(%{api_type: "google"} = opts) do
    with {:ok, %HTTPoison.Response{status_code: status_code, body: body}}
         when status_code >= 200 and status_code < 400 <-
           HTTPoison.get(opts.endpoint <> "?key=#{opts.api_key}") do
      body
      |> Jason.decode!()
      |> Map.get("models")
      |> Enum.map(fn model ->
        %{
          id: model["name"] |> String.split("/") |> Enum.at(1),
          name: model["displayName"],
          api_type: "google"
        }
      end)
    else
      _e ->
        []
    end
  end

  def get_models(_) do
    []
  end

  defp get_llm(%{api_type: "mistral"} = opts) do
    ChatMistralAI.new!(%{
      model: opts.model,
      temperature: opts.temperature,
      stream: true,
      api_key: opts.api_key,
      endpoint: opts.endpoint <> "/chat/completions",
      json_response: opts.response_format == "json"
    })
  end

  defp get_llm(%{api_type: "openai"} = opts) do
    ChatOpenAI.new!(%{
      model: opts.model,
      temperature: opts.temperature,
      stream: true,
      api_key: opts.api_key,
      api_type: opts.api_type,
      endpoint: opts.endpoint <> "/chat/completions",
      json_response: opts.response_format == "json"
    })
  end

  defp get_llm(%{api_type: "azure"} = opts) do
    ChatOpenAI.new!(%{
      model: opts.model,
      temperature: opts.temperature,
      stream: true,
      api_key: opts.api_key,
      api_type: opts.api_type,
      endpoint: opts.endpoint <> "/chat/completions?version=2024-02-01",
      json_response: opts.response_format == "json"
    })
  end

  defp get_llm(%{api_type: "google"} = opts) do
    ChatGoogleAI.new!(%{
      api_key: opts.api_key,
      model: opts.model,
      stream: true,
      temperature: opts.temperature,
      endpoint: opts.endpoint
    })
  end
end
