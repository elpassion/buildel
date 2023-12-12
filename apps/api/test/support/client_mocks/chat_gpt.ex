defmodule Buildel.ClientMocks.ChatGPT do
  alias Buildel.Clients.ChatBehaviour
  @behaviour ChatBehaviour

  @impl ChatBehaviour
  def stream_chat(
        context: _,
        on_content: on_content,
        on_tool_content: _on_tool_content,
        on_end: on_end,
        on_error: _on_error,
        api_key: _,
        model: _,
        temperature: _,
        tools: _
      ) do
    on_content.("Hell")
    on_content.("o!")
    on_content.(" How are you?")
    on_end.(%{})
  end
end
