defmodule Buildel.Blocks.FileSpeechToTextTest do
  use Buildel.BlockCase
  alias Blocks.FileSpeechToText

  test "exposes options" do
    assert FileSpeechToText.options() == %{
             description:
               "This module expertly transcribes audio content into text, offering multiple output formats including plain text, JSON, and SRT.",
             type: "file_speech_to_text",
             inputs: [Block.audio_input("input")],
             outputs: [
               Block.text_output("output"),
               Block.text_output("json_output"),
               Block.text_output("srt_output")
             ],
             schema: FileSpeechToText.schema(),
             groups: ["audio", "text"],
             ios: []
           }
  end

  test "validates schema correctly" do
    assert :ok =
             Blocks.validate_block(FileSpeechToText, %{
               "name" => "test",
               "opts" => %{
                 "api_key" => "test",
                 "language" => "en"
               },
               "inputs" => []
             })

    assert {:error, _} = Blocks.validate_block(FileSpeechToText, %{})
  end

  test "audio to text works through broadcasting" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          BlocksTestRunner.create_test_audio_input_block("test_input"),
          FileSpeechToText.create(%{
            name: "test",
            opts: %{api_key: "test"},
            connections: [
              Blocks.Connection.from_connection_string("test_input:output->input", "audio")
            ]
          })
        ]
      })

    {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

    file = File.read!("test/support/fixtures/real.mp3")
    test_run |> BlocksTestRunner.Run.input("test_input", "input", {:binary, file})

    assert_receive {^topic, :text, "Hello"}
  end
end
