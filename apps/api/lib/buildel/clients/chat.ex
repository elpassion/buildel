defmodule Buildel.Clients.ChatBehaviour do
  @callback stream_chat(%{
              context: map(),
              on_content: any(),
              on_tool_content: any(),
              on_end: any(),
              on_error: any(),
              api_key: String.t(),
              model: String.t(),
              temperature: number(),
              tools: list(any())
            }) :: :ok
end
