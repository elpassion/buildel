defmodule Buildel.SrtTest do
  use ExUnit.Case
  alias Buildel.Clients.Utils.Srt

  describe "Srt" do
    test "correctly convert to srt format" do
      data = [
        %{"start" => 0, "end" => 100, "text" => "Hello"},
        %{"start" => 101, "end" => 250, "text" => "World!"}
      ]

      assert Srt.main(data) ==
               "1\n00:00:00,000 --> 00:01:40,000\nHello\n\n2\n00:01:41,000 --> 00:04:10,000\nWorld!"
    end
  end
end
