defmodule Buildel.Clients.HuggingFaceChat do
  require Logger
  alias Buildel.Clients.ChatBehaviour
  @behaviour ChatBehaviour

  @impl ChatBehaviour
  def stream_chat(%{
        context: context,
        on_content: on_content,
        on_tool_content: _on_tool_content,
        on_end: on_end,
        on_error: _on_error,
        api_key: api_key,
        on_cost: _on_cost,
        model: model,
        temperature: _temperature,
        tools: _tools
      }) do
    messages =
      ((context.messages |> Enum.map(fn %{role: role, content: text} -> "#{role}: #{text}" end)) ++
         ["ANSWER:"])
      |> Enum.join("\n\n")

    Buildel.Clients.HuggingFace.text_generation(
      model,
      messages,
      %{api_key: api_key, stream: context |> Map.get(:stream, false)}
    )
    |> Enum.each(fn
      %{"token" => %{"text" => content}, "generated_text" => nil} ->
        on_content.(content)

      %{"token" => %{"text" => content}, "generated_text" => _text} ->
        on_content.(content)
        on_end.()

      %{"generated_text" => content} ->
        on_content.(content)
        on_end.()

      message ->
        Logger.error("Unknown message #{inspect(message)}")
    end)
  end
end
