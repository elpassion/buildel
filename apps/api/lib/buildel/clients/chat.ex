defmodule Buildel.Clients.ChatBehaviour do
  @callback stream_chat(context: map(), on_content: any(), on_end: any(), api_key: String.t(), model: String.t(), temperature: number()) :: :ok
end
  