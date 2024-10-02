defmodule Buildel.Blocks.AudioInputTest do
  use Buildel.BlockCase, async: true
  alias Blocks.AudioInput

  test "exposes options" do
    assert AudioInput.options() == %{
             description: "A specialized block designed for capturing and streaming audio data.",
             type: "audio_input",
             inputs: [
               Block.audio_input("input", true),
               Block.text_input("mute"),
               Block.audio_input("unmute")
             ],
             outputs: [Block.audio_output("output"), Block.text_output("status", true, false)],
             schema: AudioInput.schema(),
             groups: ["audio", "inputs / outputs"],
             ios: [],
             dynamic_ios: nil
           }
  end

  test "validates schema correctly" do
    assert :ok = Blocks.validate_block(AudioInput, %{"name" => "test", "opts" => %{}})
    assert {:error, _} = Blocks.validate_block(AudioInput, %{})
  end

  test "broadcasts file" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          AudioInput.create(%{
            name: "test",
            opts: %{},
            connections: []
          })
        ]
      })

    {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")
    file = File.read!("test/support/fixtures/real.mp3")
    test_run |> BlocksTestRunner.Run.input("test", "input", {:binary, file})

    assert_receive {^topic, :start_stream, nil, _}
    assert_receive {^topic, :binary, ^file, _}
    assert_receive {^topic, :stop_stream, nil, _}
  end
end
