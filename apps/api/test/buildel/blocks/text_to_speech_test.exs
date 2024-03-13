defmodule Buildel.Blocks.TextToSpeechTest do
  use Buildel.BlockCase
  alias Blocks.TextToSpeech

  test "exposes options" do
    assert TextToSpeech.options() == %{
             type: "text_to_speech",
             description:
               "This module enables seamless conversion of textual data into audio format, leveraging the ElevenLabs API.",
             inputs: [Block.text_input("input")],
             outputs: [Block.audio_output("output")],
             schema: TextToSpeech.schema(),
             groups: ["text", "audio"],
             ios: []
           }
  end

  test "validates schema correctly" do
    assert :ok =
             Blocks.validate_block(TextToSpeech, %{
               "name" => "test",
               "opts" => %{
                 "api_key" => "test"
               },
               "inputs" => []
             })

    assert {:error, _} = Blocks.validate_block(TextToSpeech, %{})
  end

  test "text to audio works through input" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          BlocksTestRunner.create_test_text_input_block("test_input"),
          TextToSpeech.create(%{
            name: "test",
            opts: %{api_key: "test"},
            connections: [
              Blocks.Connection.from_connection_string("test_input:output->input", "text")
            ]
          })
        ]
      })

    {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

    text = "Hello darkness my old friend."
    test_run |> BlocksTestRunner.Run.input("test_input", "input", {:text, text})

    assert_receive({^topic, :binary, _})
  end
end
