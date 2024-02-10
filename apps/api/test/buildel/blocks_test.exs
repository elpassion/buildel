defmodule Buildel.BlocksTest do
  alias Buildel.Blocks
  alias Buildel.BlockPubSub
  alias Buildel.BlocksTestRunner
  use Buildel.DataCase

  alias Buildel.Blocks.{
    SpeechToText,
    FileSpeechToText,
    FileSpeechToText,
    TextToSpeech,
    Chat,
    Block,
    AudioOutput,
    CollectSentences,
    CollectAllText,
    TakeLatest
  }

  describe "AudioOutput" do
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

  describe "SpeechToText" do
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

  describe "FileSpeechToText" do
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

  describe "TextToSpeech" do
    test "exposes options" do
      assert TextToSpeech.options() == %{
               type: "text_to_speech",
               description:
                 "This module enables seamless conversion of textual data into audio format, leveraging the ElevenLabs API",
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

  describe "Chat" do
    test "exposes options" do
      assert Chat.options() == %{
               description:
                 "Large Language Model chat block enabling advanced conversational interactions powered by OpenAI's cutting-edge language models.",
               type: "chat",
               inputs: [Block.text_input("input")],
               outputs: [
                 Block.text_output("output"),
                 Block.text_output("message_output")
               ],
               schema: Chat.schema(),
               groups: ["text", "llms"],
               ios: [
                 %{name: "tool", public: false, type: "controller"},
                 %{name: "chat", public: false, type: "worker"}
               ]
             }
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(Chat, %{
                 "name" => "test",
                 "opts" => %{
                   "name" => "name",
                   "description" => "description",
                   "api_key" => "test",
                   "model" => "gpt-4",
                   "temperature" => 0.5,
                   "system_message" => "You are a helpful assistant.",
                   "messages" => [
                     %{"role" => "system", "content" => "You are a helpful assistant."}
                   ],
                   "endpoint" => nil,
                   "api_type" => "openai",
                   "chat_memory_type" => "full"
                 },
                 "inputs" => []
               })

      assert {:error, _} = Blocks.validate_block(Chat, %{})
    end

    test "chat works through input" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            BlocksTestRunner.create_test_text_input_block("test_input"),
            Chat.create(%{
              name: "test",
              opts: %{
                name: "name",
                description: "description",
                system_message: "You are a helpful assistant.",
                messages: [],
                prompt_template: "{{test_input:output}}",
                model: "gpt-3.5",
                temperature: 0.7,
                knowledge: nil,
                endpoint: nil,
                api_type: "openai",
                api_key: "123"
              },
              connections: [
                Blocks.Connection.from_connection_string("test_input:output->input", "text")
              ]
            })
          ]
        })

      {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

      {:ok, messages_topic} =
        test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "message_output")

      text = "Hello darkness my old friend."
      test_run |> BlocksTestRunner.Run.input("test_input", "input", {:text, text})

      assert_receive({^messages_topic, :text, "Hello darkness my old friend."})
      assert_receive({^topic, :text, "Hell"})
      assert_receive({^topic, :text, "o!"})
      assert_receive({^topic, :text, " How are you?"})
    end

    test "interpolates inputs" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            BlocksTestRunner.create_test_text_input_block("test_input"),
            Chat.create(%{
              name: "test",
              opts: %{
                system_message: "You are a helpful assistant. {{test_input:output}}",
                messages: [],
                prompt_template: "{{test_input:output}}",
                model: "gpt-3.5",
                temperature: 0.7,
                knowledge: nil,
                endpoint: nil,
                api_type: "openai",
                api_key: "123"
              },
              connections: [
                Blocks.Connection.from_connection_string("test_input:output->input", "text")
              ]
            })
          ]
        })

      {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

      test_run
      |> BlocksTestRunner.Run.input(
        "test_input",
        "input",
        {:text, "Hello darkness my old friend."}
      )

      assert_receive({^topic, :text, " How are you?"})
    end
  end

  describe "TakeLatest" do
    test "exposes options" do
      assert TakeLatest.options() == %{
               description:
                 "This module specializes in aggregating the latest inputs and combining them based on a specified template.",
               type: "take_latest",
               inputs: [Block.text_input("input")],
               outputs: [Block.text_output("output")],
               schema: TakeLatest.schema(),
               groups: ["text", "utils"],
               ios: []
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
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            Buildel.BlocksTestRunner.create_test_text_input_block("text_input"),
            TakeLatest.create(%{
              name: "test",
              opts: %{
                template: "dupa",
                reset: false
              },
              connections: [
                Blocks.Connection.from_connection_string("text_input:output->input", "text")
              ]
            })
          ]
        })

      {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

      test_run
      |> BlocksTestRunner.Run.input(
        "text_input",
        "input",
        {:text, "Hello darkness my old friend."}
      )

      assert_receive({^topic, :start_stream, nil})
      assert_receive({^topic, :text, "dupa"})
      assert_receive({^topic, :stop_stream, nil})
    end

    test "outputs value inside template" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            Buildel.BlocksTestRunner.create_test_text_input_block("text_input"),
            TakeLatest.create(%{
              name: "test",
              opts: %{
                template: "dupa {{text_input:output}}",
                reset: false
              },
              connections: [
                Blocks.Connection.from_connection_string("text_input:output->input", "text")
              ]
            })
          ]
        })

      {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

      test_run
      |> BlocksTestRunner.Run.input(
        "text_input",
        "input",
        {:text, "Hello darkness my old friend."}
      )

      assert_receive({^topic, :start_stream, nil})
      assert_receive({^topic, :text, "dupa Hello darkness my old friend."})
      assert_receive({^topic, :stop_stream, nil})
    end

    test "waits for all templates to be filled before emitting" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            Buildel.BlocksTestRunner.create_test_text_input_block("text_input"),
            Buildel.BlocksTestRunner.create_test_text_input_block("text_input_2"),
            TakeLatest.create(%{
              name: "test",
              opts: %{
                template: "dupa {{text_input:output}} {{text_input_2:output}}"
              },
              connections: [
                Blocks.Connection.from_connection_string(
                  "text_input:output->input?reset=false",
                  "text"
                ),
                Blocks.Connection.from_connection_string(
                  "text_input_2:output->input?reset=false",
                  "text"
                )
              ]
            })
          ]
        })

      {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

      test_run |> BlocksTestRunner.Run.input("text_input", "input", {:text, "Hello"})
      assert_receive({^topic, :start_stream, nil})
      refute_received({^topic, :text, _message})
      refute_received({^topic, :stop_stream, nil})
      test_run |> BlocksTestRunner.Run.input("text_input_2", "input", {:text, "World"})
      assert_receive({^topic, :text, "dupa Hello World"})
      assert_receive({^topic, :stop_stream, nil})
      test_run |> BlocksTestRunner.Run.input("text_input_2", "input", {:text, "World 2"})
      assert_receive({^topic, :text, "dupa Hello World 2"})
      assert_receive({^topic, :stop_stream, nil})
    end

    test "resets after emitting if reset is true" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            Buildel.BlocksTestRunner.create_test_text_input_block("text_input"),
            Buildel.BlocksTestRunner.create_test_text_input_block("text_input_2"),
            TakeLatest.create(%{
              name: "test",
              opts: %{
                template: "dupa {{text_input:output}} {{text_input_2:output}}",
                reset: true
              },
              connections: [
                Blocks.Connection.from_connection_string("text_input:output->input", "text"),
                Blocks.Connection.from_connection_string("text_input_2:output->input", "text")
              ]
            })
          ]
        })

      {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

      test_run |> BlocksTestRunner.Run.input("text_input", "input", {:text, "Hello"})
      test_run |> BlocksTestRunner.Run.input("text_input_2", "input", {:text, "World"})
      assert_receive({^topic, :text, "dupa Hello World"})
      assert_receive({^topic, :stop_stream, nil})
      test_run |> BlocksTestRunner.Run.input("text_input_2", "input", {:text, "World 2"})
      refute_receive({^topic, :text, "dupa Hello World 2"})
      test_run |> BlocksTestRunner.Run.input("text_input", "input", {:text, "Hello 2"})
      assert_receive({^topic, :text, "dupa Hello 2 World 2"})
    end
  end

  describe "CollectSentences" do
    test "exposes options" do
      assert CollectSentences.options() == %{
               type: "collect_sentences",
               description:
                 "This module segmenting and extracting individual sentences from continuous text streams.",
               inputs: [Block.text_input("input")],
               outputs: [Block.text_output("sentences_output")],
               schema: CollectSentences.schema(),
               groups: ["text", "utils"],
               ios: []
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
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            Buildel.BlocksTestRunner.create_test_text_input_block("text_input"),
            CollectSentences.create(%{
              name: "test",
              opts: %{},
              connections: [
                Blocks.Connection.from_connection_string("text_input:output->input", "text")
              ]
            })
          ]
        })

      {:ok, sentences_topic} =
        test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "sentences_output")

      test_run
      |> BlocksTestRunner.Run.input(
        "text_input",
        "input",
        {:text, "Hello darkness my old friend."}
      )

      assert_receive({^sentences_topic, :start_stream, nil})
      assert_receive({^sentences_topic, :text, "Hello darkness my old friend."})
      assert_receive({^sentences_topic, :stop_stream, nil})
    end

    @tag :skip
    test "does not output not finished sentence" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            Buildel.BlocksTestRunner.create_test_text_input_block("text_input"),
            CollectSentences.create(%{
              name: "test",
              opts: %{},
              connections: [
                Blocks.Connection.from_connection_string("text_input:output->input", "text")
              ]
            })
          ]
        })

      {:ok, sentences_topic} =
        test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "sentences_output")

      test_run |> BlocksTestRunner.Run.input("text_input", "input", {:text, "Hello darkness my"})
      test_run |> BlocksTestRunner.Run.input("text_input", "input", {:text, " old friend."})

      assert_receive({^sentences_topic, :start_stream, nil})
      refute_receive({^sentences_topic, :text, "Hello darkness my"})
      assert_receive({^sentences_topic, :text, "Hello darkness my old friend."})
      assert_receive({^sentences_topic, :stop_stream, nil})
    end

    @tag :skip
    test "works with 2 separate inputs" do
      {:ok, pid} =
        CollectSentences.start_link(%{
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{},
          connections: [
            Blocks.Connection.from_connection_string("text_test:output->input", "text")
          ]
        })

      {:ok, sentences_topic} = BlockPubSub.subscribe_to_io("run1", "test", "sentences_output")

      pid |> CollectSentences.cast({:text, "Hello darkness my"})
      pid |> CollectSentences.cast({:text, " old friend."})
      BlockPubSub.broadcast_to_io("run1", "text_test", "output", {:stop_stream, nil})
      pid |> CollectSentences.cast({:text, "I've come to talk"})
      pid |> CollectSentences.cast({:text, " with you again."})
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

    @tag :skip
    test "correctly splits single input with multiple sentences" do
      {:ok, pid} =
        CollectSentences.start_link(%{
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{},
          connections: [
            Blocks.Connection.from_connection_string("text_test:output->input", "text")
          ]
        })

      {:ok, sentences_topic} = BlockPubSub.subscribe_to_io("run1", "test", "sentences_output")

      pid
      |> CollectSentences.cast(
        {:text, "Hello darkness my old friend. I've come to talk with you again."}
      )

      BlockPubSub.broadcast_to_io("run1", "text_test", "output", {:stop_stream, nil})

      assert_receive({^sentences_topic, :start_stream, nil})
      assert_receive({^sentences_topic, :text, "Hello darkness my old friend."})
      assert_receive({^sentences_topic, :text, "I've come to talk with you again."})
      assert_receive({^sentences_topic, :stop_stream, nil})
    end
  end

  describe "CollectAllText" do
    test "exposes options" do
      assert CollectAllText.options() == %{
               type: "collect_all_text",
               description:
                 "This module specializes in accumulating and consolidating text input from streaming sources.",
               inputs: [Block.text_input("input")],
               outputs: [Block.text_output("output")],
               schema: CollectAllText.schema(),
               groups: ["text", "utils"],
               ios: []
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

    @tag :skip
    test "works with 2 separate inputs" do
      {:ok, pid} =
        CollectSentences.start_link(%{
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{},
          connections: [
            Blocks.Connection.from_connection_string("text_test:output->input", "text")
          ]
        })

      {:ok, sentences_topic} = BlockPubSub.subscribe_to_io("run1", "test", "sentences_output")

      pid |> CollectSentences.cast({:text, "Hello darkness my"})
      pid |> CollectSentences.cast({:text, " old friend."})
      pid |> CollectSentences.cast({:text, "Another sentence."})
      pid |> CollectSentences.cast({:text, "And another!"})
      BlockPubSub.broadcast_to_io("run1", "text_test", "output", {:stop_stream, nil})

      pid |> CollectSentences.cast({:text, "I've come to talk"})
      pid |> CollectSentences.cast({:text, " with you again."})
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
