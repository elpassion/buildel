defmodule Buildel.ClientMocks.ChatGPT do
  alias Buildel.Clients.ChatGPTBehaviour
  @behaviour ChatGPTBehaviour

  @impl ChatGPTBehaviour
  def stream_chat(context: _, on_content: on_content, on_end: on_end, api_key: _) do
    on_content.("Hell")
    on_content.("o!")
    on_content.(" How are you?")
    on_end.()
  end
end
