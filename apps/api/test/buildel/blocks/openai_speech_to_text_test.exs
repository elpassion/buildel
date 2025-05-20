defmodule Buildel.Blocks.OpenaiSpeechToTextTest do
  use Buildel.BlockCase, async: true
  alias Blocks.OpenaiSpeechToText

  test "exposes options" do
    assert OpenaiSpeechToText.options() == %{
             description:
               "This module expertly transcribes audio content into text, using OpenAI's transcription models.",
             type: "openai_speech_to_text",
             inputs: [Block.audio_input("input")],
             outputs: [
               Block.text_output("output")
             ],
             schema: OpenaiSpeechToText.schema(),
             groups: ["audio", "text"],
             ios: [],
             dynamic_ios: nil
           }
  end

  test "validates schema correctly" do
    assert :ok =
             Blocks.validate_block(OpenaiSpeechToText, %{
               "name" => "test",
               "opts" => %{
                 "api_key" => "test",
                 "language" => "en",
                 "model" => "whisper-1",
                 "endpoint" => "https://api.openai.com/v1/audio/transcriptions"
               },
               "inputs" => []
             })

    assert {:error, _} = Blocks.validate_block(OpenaiSpeechToText, %{})
  end

  test "audio to text works" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          BlocksTestRunner.create_test_audio_input_block("test_input"),
          OpenaiSpeechToText.create(%{
            name: "test",
            opts: %{
              api_key: "test",
              language: "en",
              model: "whisper-1",
              endpoint: "https://api.openai.com/v1/audio/transcriptions"
            },
            connections: [
              Blocks.Connection.from_connection_string("test_input:output->input", "audio")
            ]
          })
        ]
      })

    {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

    file = File.read!("test/support/fixtures/real.mp3")

    test_run
    |> BlocksTestRunner.Run.input("test_input", "input", {:binary, file})

    assert_receive {^topic, :text, "Hello", _}
  end
end
