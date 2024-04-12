defmodule Buildel.Blocks.AudioOutputTest do
  use Buildel.BlockCase, async: true
  alias Blocks.AudioOutput

  test "exposes options" do
    assert AudioOutput.options() == %{
             type: "audio_output",
             description:
               "It's designed to work seamlessly with other audio-related blocks in Buildel, ensuring smooth and flexible audio output capabilities in applications.",
             inputs: [Block.audio_output("input")],
             outputs: [Block.audio_output("output", true)],
             schema: AudioOutput.schema(),
             groups: ["audio", "inputs / outputs"],
             ios: []
           }
  end

  test "validates schema correctly" do
    assert :ok =
             Blocks.validate_block(AudioOutput, %{
               "name" => "test",
               "opts" => %{},
               "inputs" => []
             })

    assert {:error, _} = Blocks.validate_block(AudioOutput, %{})
  end

  test "broadcasts audio" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          BlocksTestRunner.create_test_audio_input_block("test_input"),
          AudioOutput.create(%{
            name: "test",
            opts: %{},
            connections: [
              Blocks.Connection.from_connection_string("test_input:output->input", "audio")
            ]
          })
        ]
      })

    {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

    file = File.read!("test/support/fixtures/real.mp3")
    test_run |> BlocksTestRunner.Run.input("test_input", "input", {:binary, file})

    assert_receive {^topic, :start_stream, nil}
    assert_receive {^topic, :binary, ^file}
    assert_receive {^topic, :stop_stream, nil}
  end
end
