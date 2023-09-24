defmodule Buildel.BlocksTest do
  alias Buildel.Blocks
  alias Buildel.Blocks.TextOutput
  alias Buildel.BlockPubSub
  use Buildel.DataCase

  alias Buildel.Blocks.{
    AudioInput,
    TextInput,
    SpeechToText,
    TextToSpeech,
    Chat,
    Block,
    TextOutput,
    AudioOutput,
    CollectSentences,
    CollectAllText,
    TakeLatest
  }

  describe "TextInput" do
    test "exposes options" do
      assert TextInput.options() == %{
               type: "text_input",
               inputs: [Block.text_input("input", true)],
               outputs: [Block.text_output("output")],
               schema: TextInput.schema(),
               groups: ["text", "inputs / outputs"]
             }
    end

    test "validates schema correctly" do
      assert :ok = Blocks.validate_block(TextInput, %{"name" => "test", "opts" => %{}})
      assert {:error, _} = Blocks.validate_block(TextInput, %{})
    end

    test "broadcasts text" do
      {:ok, pid} =
        TextInput.start_link(
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{inputs: []}
        )

      {:ok, topic} = BlockPubSub.subscribe_to_io("run1", "test", "output")

      text = "text"
      pid |> TextInput.input({:text, text})

      assert_receive {^topic, :start_stream, nil}
      assert_receive {^topic, :text, ^text}
      assert_receive {^topic, :stop_stream, nil}
    end
  end

  describe "AudioInput" do
    test "exposes options" do
      assert AudioInput.options() == %{
               type: "audio_input",
               inputs: [Block.audio_input("input", true)],
               outputs: [Block.audio_output("output")],
               schema: AudioInput.schema(),
               groups: ["audio", "inputs / outputs"]
             }
    end

    test "validates schema correctly" do
      assert :ok = Blocks.validate_block(AudioInput, %{"name" => "test", "opts" => %{}})
      assert {:error, _} = Blocks.validate_block(AudioInput, %{})
    end

    test "broadcasts file" do
      {:ok, pid} =
        AudioInput.start_link(name: "test", block_name: "test", context_id: "run1", opts: %{})

      {:ok, topic} = BlockPubSub.subscribe_to_io("run1", "test", "output")

      file = File.read!("test/support/fixtures/real.mp3")
      pid |> AudioInput.input({:binary, file})

      assert_receive {^topic, :start_stream, nil}
      assert_receive {^topic, :binary, ^file}
      assert_receive {^topic, :stop_stream, nil}
    end
  end

  describe "TextOutput" do
    test "exposes options" do
      assert TextOutput.options() == %{
               type: "text_output",
               inputs: [Block.text_input("input")],
               outputs: [Block.text_output("output", true)],
               schema: TextOutput.schema(),
               groups: ["text", "inputs / outputs"]
             }
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(TextOutput, %{
                 "name" => "test",
                 "opts" => %{},
                 "inputs" => []
               })

      assert {:error, _} = Blocks.validate_block(TextOutput, %{})
    end

    test "broadcasts text" do
      {:ok, pid} =
        TextOutput.start_link(
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{inputs: []}
        )

      {:ok, topic} = BlockPubSub.subscribe_to_io("run1", "test", "output")

      text = "text"
      pid |> TextOutput.input({:text, text})

      assert_receive {^topic, :start_stream, nil}
      assert_receive {^topic, :text, ^text}
      assert_receive {^topic, :stop_stream, nil}
    end
  end

  describe "AudioOutput" do
    test "exposes options" do
      assert AudioOutput.options() == %{
               type: "audio_output",
               inputs: [Block.audio_output("input")],
               outputs: [Block.audio_output("output", true)],
               schema: AudioOutput.schema(),
               groups: ["audio", "inputs / outputs"]
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
      {:ok, pid} =
        AudioOutput.start_link(
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{inputs: []}
        )

      {:ok, topic} = BlockPubSub.subscribe_to_io("run1", "test", "output")

      file = File.read!("test/support/fixtures/real.mp3")
      pid |> AudioOutput.input({:binary, file})

      assert_receive {^topic, :start_stream, nil}
      assert_receive {^topic, :binary, ^file}
      assert_receive {^topic, :stop_stream, nil}
    end
  end

  describe "SpeechToText" do
    test "exposes options" do
      assert SpeechToText.options() == %{
               type: "speech_to_text",
               inputs: [Block.audio_input("input")],
               outputs: [Block.text_output("output")],
               schema: SpeechToText.schema(),
               groups: ["audio", "text"]
             }
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(SpeechToText, %{
                 "name" => "test",
                 "opts" => %{
                   "api_key" => "test"
                 },
                 "inputs" => []
               })

      assert {:error, _} = Blocks.validate_block(SpeechToText, %{})
    end

    test "audio to text works through direct calling" do
      {:ok, _input_pid} =
        AudioInput.start_link(
          name: "audio_test",
          block_name: "audio_test",
          context_id: "run1",
          opts: %{inputs: []}
        )

      {:ok, pid} =
        SpeechToText.start_link(
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{inputs: ["audio_test:output"]}
        )

      {:ok, topic} = BlockPubSub.subscribe_to_io("run1", "test", "output")

      file = File.read!("test/support/fixtures/real.mp3")
      pid |> SpeechToText.input({:binary, file})

      assert_receive {^topic, :start_stream, nil}
      assert_receive {^topic, :text, "Hello"}
      assert_receive {^topic, :stop_stream, nil}
    end

    test "audio to text works through broadcasting through input" do
      {:ok, input_pid} =
        AudioInput.start_link(
          name: "audio_test",
          block_name: "text_test",
          context_id: "run1",
          opts: %{inputs: []}
        )

      {:ok, _pid} =
        SpeechToText.start_link(
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{inputs: ["text_test:output->input"]}
        )

      {:ok, topic} = BlockPubSub.subscribe_to_io("run1", "test", "output")

      file = File.read!("test/support/fixtures/real.mp3")
      input_pid |> AudioInput.send_audio({:binary, file})

      assert_receive {^topic, :text, "Hello"}
    end
  end

  describe "TextToSpeech" do
    test "exposes options" do
      assert TextToSpeech.options() == %{
               type: "text_to_speech",
               inputs: [Block.text_input("input")],
               outputs: [Block.audio_output("output")],
               schema: TextToSpeech.schema(),
               groups: ["text", "audio"]
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

    test "text to audio works through direct calling" do
      {:ok, _input_pid} =
        TextInput.start_link(
          name: "text_test",
          block_name: "text_test",
          context_id: "run1",
          opts: %{inputs: []}
        )

      {:ok, pid} =
        TextToSpeech.start_link(
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{inputs: ["text_test:output"]}
        )

      {:ok, topic} = BlockPubSub.subscribe_to_io("run1", "test", "output")

      pid |> TextToSpeech.input({:text, "Hello darkness my old friend."})

      assert_receive {^topic, :start_stream, nil}
      assert_receive {^topic, :binary, _}
      assert_receive {^topic, :stop_stream, nil}
    end

    test "text to audio works through input" do
      {:ok, input_pid} =
        TextInput.start_link(
          name: "text_test",
          block_name: "text_test",
          context_id: "run1",
          opts: %{inputs: []}
        )

      {:ok, _pid} =
        TextToSpeech.start_link(
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{inputs: ["text_test:output"]}
        )

      {:ok, topic} = BlockPubSub.subscribe_to_io("run1", "test", "output")

      input_pid |> TextInput.input({:text, "Hello darkness my old friend."})

      assert_receive({^topic, :binary, _})
    end
  end

  describe "Chat" do
    test "exposes options" do
      assert Chat.options() == %{
               type: "chat",
               inputs: [Block.text_input("input")],
               outputs: [
                 Block.text_output("output"),
                 Block.text_output("sentences_output"),
                 Block.text_output("message_output")
               ],
               schema: Chat.schema(),
               groups: ["text", "llms"]
             }
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(Chat, %{
                 "name" => "test",
                 "opts" => %{
                   "api_key" => "test",
                   "model" => "gpt-4",
                   "temperature" => 0.5,
                   "messages" => [
                     %{"role" => "system", "content" => "You are a helpful assistant."}
                   ]
                 },
                 "inputs" => []
               })

      assert {:error, _} = Blocks.validate_block(Chat, %{})
    end

    test "chat works through input" do
      {:ok, input_pid} =
        TextInput.start_link(
          name: "text_test",
          block_name: "text_test",
          context_id: "run1",
          opts: %{inputs: []}
        )

      {:ok, _pid} =
        Chat.start_link(
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{
            inputs: ["text_test:output"],
            messages: [%{role: "system", content: "You are a helpful assistant."}],
            model: "gpt-3.5",
            temperature: 0.7
          }
        )

      {:ok, sentences_topic} = BlockPubSub.subscribe_to_io("run1", "test", "sentences_output")
      {:ok, topic} = BlockPubSub.subscribe_to_io("run1", "test", "output")
      {:ok, messages_topic} = BlockPubSub.subscribe_to_io("run1", "test", "message_output")

      input_pid |> TextInput.input({:text, "Hello darkness my old friend."})

      assert_receive({^messages_topic, :text, "Hello darkness my old friend."})
      assert_receive({^sentences_topic, :text, "Hello!"})
      assert_receive({^sentences_topic, :text, "How are you?"})
      assert_receive({^topic, :text, "Hell"})
      assert_receive({^topic, :text, "o!"})
      assert_receive({^topic, :text, " How are you?"})
    end

    test "interpolates inputs" do
      {:ok, input_pid} =
        TextInput.start_link(
          name: "text_test",
          block_name: "text_test",
          context_id: "run1",
          opts: %{inputs: []}
        )

      {:ok, _pid} =
        Chat.start_link(
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{
            inputs: ["text_test:output"],
            messages: [
              %{role: "system", content: "You are a helpful assistant. {{text_test:output}}"}
            ],
            model: "gpt-3.5",
            temperature: 0.7
          }
        )

      {:ok, topic} = BlockPubSub.subscribe_to_io("run1", "test", "output")

      input_pid |> TextInput.input({:text, "Hello darkness my old friend."})

      assert_receive({^topic, :text, " How are you?"})
    end
  end

  describe "TakeLatest" do
    test "exposes options" do
      assert TakeLatest.options() == %{
               type: "take_latest",
               inputs: [Block.text_input("input")],
               outputs: [Block.text_output("output")],
               schema: TakeLatest.schema(),
               groups: ["text", "utils"]
             }
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(TakeLatest, %{
                 "name" => "test",
                 "opts" => %{
                   "template" => "{{text_output:output}}",
                   "reset" => false
                 },
                 "inputs" => []
               })

      assert {:error, _} = Blocks.validate_block(TakeLatest, %{})
    end

    test "outputs value when pushed to if template does not have any input used" do
      {:ok, input_pid} =
        TextInput.start_link(
          name: "text_test",
          block_name: "text_test",
          context_id: "run1",
          opts: %{inputs: []}
        )

      {:ok, _pid} =
        TakeLatest.start_link(
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{
            inputs: ["text_test:output"],
            template: "dupa",
            reset: false
          }
        )

      {:ok, topic} = BlockPubSub.subscribe_to_io("run1", "test", "output")

      input_pid |> TextInput.input({:text, "Hello darkness my old friend."})

      assert_receive({^topic, :start_stream, nil})
      assert_receive({^topic, :text, "dupa"})
      assert_receive({^topic, :stop_stream, nil})
    end

    test "outputs value inside template" do
      {:ok, input_pid} =
        TextInput.start_link(
          name: "text_test",
          block_name: "text_test",
          context_id: "run1",
          opts: %{inputs: []}
        )

      {:ok, _pid} =
        TakeLatest.start_link(
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{
            inputs: ["text_test:output"],
            template: "dupa {{text_test:output}}",
            reset: false
          }
        )

      {:ok, topic} = BlockPubSub.subscribe_to_io("run1", "test", "output")

      input_pid |> TextInput.input({:text, "Hello darkness my old friend."})

      assert_receive({^topic, :start_stream, nil})
      assert_receive({^topic, :text, "dupa Hello darkness my old friend."})
      assert_receive({^topic, :stop_stream, nil})
    end

    test "waits for all templates to be filled before emitting" do
      {:ok, input_pid} =
        TextInput.start_link(
          name: "text_test",
          block_name: "text_test",
          context_id: "run1",
          opts: %{inputs: []}
        )

      {:ok, input_2_pid} =
        TextInput.start_link(
          name: "text_test_2",
          block_name: "text_test_2",
          context_id: "run1",
          opts: %{inputs: []}
        )

      {:ok, _pid} =
        TakeLatest.start_link(
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{
            inputs: ["text_test:output", "text_test_2:output"],
            template: "dupa {{text_test:output}} {{text_test_2:output}}",
            reset: false
          }
        )

      {:ok, topic} = BlockPubSub.subscribe_to_io("run1", "test", "output")

      input_pid |> TextInput.input({:text, "Hello"})
      assert_receive({^topic, :start_stream, nil})
      refute_received({^topic, :text, _message})
      refute_received({^topic, :stop_stream, nil})
      input_2_pid |> TextInput.input({:text, "World"})
      assert_receive({^topic, :text, "dupa Hello World"})
      assert_receive({^topic, :stop_stream, nil})
      input_2_pid |> TextInput.input({:text, "World 2"})
      assert_receive({^topic, :text, "dupa Hello World 2"})
      assert_receive({^topic, :stop_stream, nil})
    end

    test "resets after emitting if reset is true" do
      {:ok, input_pid} =
        TextInput.start_link(
          name: "text_test",
          block_name: "text_test",
          context_id: "run1",
          opts: %{inputs: []}
        )

      {:ok, input_2_pid} =
        TextInput.start_link(
          name: "text_test_2",
          block_name: "text_test_2",
          context_id: "run1",
          opts: %{inputs: []}
        )

      {:ok, _pid} =
        TakeLatest.start_link(
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{
            inputs: ["text_test:output", "text_test_2:output"],
            template: "dupa {{text_test:output}} {{text_test_2:output}}",
            reset: true
          }
        )

      {:ok, topic} = BlockPubSub.subscribe_to_io("run1", "test", "output")

      input_pid |> TextInput.input({:text, "Hello"})
      input_2_pid |> TextInput.input({:text, "World"})
      assert_receive({^topic, :text, "dupa Hello World"})
      assert_receive({^topic, :stop_stream, nil})
      input_2_pid |> TextInput.input({:text, "World 2"})
      refute_receive({^topic, :text, "dupa Hello World 2"})
      input_pid |> TextInput.input({:text, "Hello 2"})
      assert_receive({^topic, :text, "dupa Hello 2 World 2"})
    end
  end

  describe "CollectSentences" do
    test "exposes options" do
      assert CollectSentences.options() == %{
               type: "collect_sentences",
               inputs: [Block.text_input("input")],
               outputs: [Block.text_output("sentences_output")],
               schema: CollectSentences.schema(),
               groups: ["text", "utils"]
             }
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(CollectSentences, %{
                 "name" => "test",
                 "opts" => %{},
                 "inputs" => []
               })

      assert {:error, _} = Blocks.validate_block(CollectSentences, %{})
    end

    test "outputs full sentence" do
      {:ok, input_pid} =
        TextInput.start_link(
          name: "text_test",
          block_name: "text_test",
          context_id: "run1",
          opts: %{inputs: []}
        )

      {:ok, _pid} =
        CollectSentences.start_link(
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{
            inputs: ["text_test:output"]
          }
        )

      {:ok, sentences_topic} = BlockPubSub.subscribe_to_io("run1", "test", "sentences_output")

      input_pid |> TextInput.input({:text, "Hello darkness my old friend."})

      assert_receive({^sentences_topic, :start_stream, nil})
      assert_receive({^sentences_topic, :text, "Hello darkness my old friend."})
      assert_receive({^sentences_topic, :stop_stream, nil})
    end

    test "does not output not finished sentence" do
      {:ok, pid} =
        CollectSentences.start_link(
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{
            inputs: ["text_test:output"]
          }
        )

      {:ok, sentences_topic} = BlockPubSub.subscribe_to_io("run1", "test", "sentences_output")

      pid |> CollectSentences.input({:text, "Hello darkness my"})
      pid |> CollectSentences.input({:text, " old friend."})
      send(pid, {"", :stop_stream, "sentences_output"})

      assert_receive({^sentences_topic, :start_stream, nil})
      refute_receive({^sentences_topic, :text, "Hello darkness my"})
      assert_receive({^sentences_topic, :text, "Hello darkness my old friend."})
      assert_receive({^sentences_topic, :stop_stream, nil})
    end
  end

  test "works with 2 separate inputs" do
    {:ok, pid} =
      CollectSentences.start_link(
        name: "test",
        block_name: "test",
        context_id: "run1",
        opts: %{
          inputs: ["text_test:output"]
        }
      )

    {:ok, sentences_topic} = BlockPubSub.subscribe_to_io("run1", "test", "sentences_output")

    pid |> CollectSentences.input({:text, "Hello darkness my"})
    pid |> CollectSentences.input({:text, " old friend."})
    BlockPubSub.broadcast_to_io("run1", "text_test", "output", {:stop_stream, nil})
    pid |> CollectSentences.input({:text, "I've come to talk"})
    pid |> CollectSentences.input({:text, " with you again."})
    BlockPubSub.broadcast_to_io("run1", "text_test", "output", {:stop_stream, nil})

    assert_receive({^sentences_topic, :start_stream, nil})
    refute_receive({^sentences_topic, :text, "Hello darkness my"})
    assert_receive({^sentences_topic, :text, "Hello darkness my old friend."})
    assert_receive({^sentences_topic, :stop_stream, nil})
    assert_receive({^sentences_topic, :start_stream, nil})
    refute_receive({^sentences_topic, :text, "Hello darkness my old friend."})
    refute_receive({^sentences_topic, :text, "I've come to talk"})
    assert_receive({^sentences_topic, :text, "I've come to talk with you again."})
    assert_receive({^sentences_topic, :stop_stream, nil})
  end

  test "correctly splits single input with multiple sentences" do
    {:ok, pid} =
      CollectSentences.start_link(
        name: "test",
        block_name: "test",
        context_id: "run1",
        opts: %{
          inputs: ["text_test:output"]
        }
      )

    {:ok, sentences_topic} = BlockPubSub.subscribe_to_io("run1", "test", "sentences_output")

    pid
    |> CollectSentences.input(
      {:text, "Hello darkness my old friend. I've come to talk with you again."}
    )

    BlockPubSub.broadcast_to_io("run1", "text_test", "output", {:stop_stream, nil})

    assert_receive({^sentences_topic, :start_stream, nil})
    assert_receive({^sentences_topic, :text, "Hello darkness my old friend."})
    assert_receive({^sentences_topic, :text, "I've come to talk with you again."})
    assert_receive({^sentences_topic, :stop_stream, nil})
  end

  describe "CollectAllText" do
    test "exposes options" do
      assert CollectAllText.options() == %{
               type: "collect_all_text",
               inputs: [Block.text_input("input")],
               outputs: [Block.text_output("output")],
               schema: CollectAllText.schema(),
               groups: ["text", "utils"]
             }
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(CollectAllText, %{
                 "name" => "test",
                 "opts" => %{},
                 "inputs" => []
               })

      assert {:error, _} = Blocks.validate_block(CollectAllText, %{})
    end

    test "works with 2 separate inputs" do
      {:ok, pid} =
        CollectSentences.start_link(
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{
            inputs: ["text_test:output"]
          }
        )

      {:ok, sentences_topic} = BlockPubSub.subscribe_to_io("run1", "test", "sentences_output")

      pid |> CollectSentences.input({:text, "Hello darkness my"})
      pid |> CollectSentences.input({:text, " old friend."})
      pid |> CollectSentences.input({:text, "Another sentence."})
      pid |> CollectSentences.input({:text, "And another!"})
      BlockPubSub.broadcast_to_io("run1", "text_test", "output", {:stop_stream, nil})

      pid |> CollectSentences.input({:text, "I've come to talk"})
      pid |> CollectSentences.input({:text, " with you again."})
      BlockPubSub.broadcast_to_io("run1", "text_test", "output", {:stop_stream, nil})

      assert_receive({^sentences_topic, :start_stream, nil})
      refute_receive({^sentences_topic, :text, "Hello darkness my"})

      assert_receive(
        {^sentences_topic, :text, "Hello darkness my old friend.Another sentence.And another!"}
      )

      assert_receive({^sentences_topic, :stop_stream, nil})
      assert_receive({^sentences_topic, :start_stream, nil})
      refute_receive({^sentences_topic, :text, "Hello darkness my old friend."})
      refute_receive({^sentences_topic, :text, "I've come to talk"})
      assert_receive({^sentences_topic, :text, "I've come to talk with you again."})
      assert_receive({^sentences_topic, :stop_stream, nil})
    end
  end
end
