defmodule BuildelWeb.PipelineSocketTest do
  use BuildelWeb.ChannelCase

  describe "connect" do
    test "connects and assigns id to user" do
      id = UUID.uuid4()
      {:ok, %Phoenix.Socket{id: ^id}} = BuildelWeb.PipelineSocket |> connect(%{ id: id })
    end
  end
end
