defmodule Buildel.Blocks.ChatTest do
  use Buildel.BlockCase, async: true
  alias Blocks.Chat

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
                 "chat_memory_type" => "full",
                 "prompt_template" => "Hello, {{input}}!"
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
              api_key: "123",
              metadata: %{}
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
              api_key: "123",
              metadata: %{}
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
