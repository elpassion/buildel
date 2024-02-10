defmodule Buildel.Blocks.SpeechToTextTest do
  use Buildel.BlockCase
  alias Blocks.SpeechToText

  test "exposes options" do
    assert SpeechToText.options() == %{
             description:
               "This module is adept at transcribing audio data into text, offering outputs in both plain text and JSON formats.",
             type: "speech_to_text",
             inputs: [Block.audio_input("input")],
             outputs: [Block.text_output("output"), Block.text_output("json_output")],
             schema: SpeechToText.schema(),
             groups: ["audio", "text"],
             ios: []
           }
  end

  test "validates schema correctly" do
    assert :ok =
             Blocks.validate_block(SpeechToText, %{
               "name" => "test",
               "opts" => %{
                 "api_key" => "test",
                 "language" => "en"
               },
               "inputs" => []
             })

    assert {:error, _} = Blocks.validate_block(SpeechToText, %{})
  end

  test "audio to text works through broadcasting" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          BlocksTestRunner.create_test_audio_input_block("audio_test"),
          SpeechToText.create(%{
            name: "test",
            opts: %{api_key: "test"},
            connections: [
              Blocks.Connection.from_connection_string("audio_test:output->input", "audio")
            ]
          })
        ]
      })

    {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

    file = File.read!("test/support/fixtures/real.mp3")
    test_run |> BlocksTestRunner.Run.input("audio_test", "input", {:binary, file})

    assert_receive {^topic, :start_stream, nil}
    assert_receive {^topic, :text, "Hello"}
    assert_receive {^topic, :stop_stream, nil}
  end
end
