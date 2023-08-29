defmodule BuildelWeb.ChannelCase do
  use ExUnit.CaseTemplate

  using do
    quote do
      import Phoenix.ChannelTest
      import BuildelWeb.ChannelCase

      @endpoint BuildelWeb.Endpoint
    end
  end

  setup tags do
    Buildel.DataCase.setup_sandbox(tags)
    :ok
  end
end
