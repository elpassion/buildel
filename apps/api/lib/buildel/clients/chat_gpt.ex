defmodule Buildel.Clients.ChatGPTBehaviour do
  @callback stream_chat(context: map(), on_content: any(), on_end: any(), api_key: String.t(), model: String.t(), temperature: number()) :: :ok
end

defmodule Buildel.Clients.ChatGPT do
  require Logger
  alias Buildel.Clients.ChatGPTBehaviour
  @behaviour ChatGPTBehaviour

  @impl ChatGPTBehaviour
  def stream_chat(context: context, on_content: on_content, on_end: on_end, api_key: api_key, model: model, temperature: temperature) do
    OpenAI.chat_completion(
      [
        model: model,
        messages: context.messages,
        temperature: temperature,
        stream: true
      ],
      config(true, api_key)
    )
    |> Enum.each(fn
      %{"choices" => [%{"finish_reason" => "stop"}]} ->
        on_end.()

      %{"choices" => [%{"delta" => %{"content" => content}}]} ->
        on_content.(content)

      message ->
        Logger.error("Unknown message #{inspect(message)}")
    end)
  end

  def config(stream \\ false, api_key \\ nil) do
    http_options =
      if stream, do: [recv_timeout: :infinity, stream_to: self(), async: :once], else: []

    %OpenAI.Config{
      api_key: api_key || System.get_env("OPENAI_API_KEY"),
      http_options: http_options,
      api_url: "http://localhost/"
    }
  end
end
