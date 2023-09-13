defmodule BuildelWeb.PipelineSocketTest do
  use BuildelWeb.ChannelCase

  describe "connect" do
    test "connects and assigns id to user" do
      {:ok, %Phoenix.Socket{id: id}} = BuildelWeb.PipelineSocket |> connect(%{})
      assert id != nil
    end
  end
end
