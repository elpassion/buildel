defmodule Buildel.ClientMocks.Chat do
  alias Buildel.ClientMocks
  use ClientMocks.ClientMock

  def stream_chat(opts) do
    pid =
      Process.get()
      |> Keyword.get(:"$ancestors")
      |> Enum.at(-1)

    set_mock(:on_content, opts[:on_content], pid)
    set_mock(:on_end, opts[:on_end], pid)
    set_mock(:on_error, opts[:on_error], pid)
    get_mock(:stream_chat).(opts)
  end
end
