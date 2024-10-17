defmodule Buildel.Blocks.NewChatTest do
  use Buildel.BlockCase, async: true
  alias Blocks.NewChat

  describe "Chat" do
    test "exposes options" do
      assert %{
               type: :chat,
               description:
                 "Chat block for large language models, enabling advanced conversational interactions powered by cutting-edge language models from various providers.",
               inputs: [_],
               outputs: [_],
               groups: ["llms", "text"],
               ios: [],
               dynamic_ios: nil
             } = NewChat.options()
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(NewChat, %{
                 name: "test",
                 opts: %{
                   api_type: "openai",
                   api_key: "key",
                   endpoint: "http://example.com",
                   model: "gpt-4o-mini",
                   temperature: 0.1,
                   max_tokens: 0,
                   response_format: "text",
                   system_message: "hello",
                   messages: [%{role: "user", content: "hello world"}],
                   prompt_template: "{{TEST_INPUT:output}}"
                 }
               })

      assert {:error, _} = Blocks.validate_block(NewChat, %{})
    end
  end

  describe "Chat Run" do
    setup [:create_run]

    test "outputs chat response", %{run: test_run} do
      message = Message.new(:text, "test")

      test_run
      |> BlocksTestRunner.with_secret(fn "key" -> "api_key" end)
      |> BlocksTestRunner.with_chat(fn _opts ->
        nil
      end)
      |> BlocksTestRunner.subscribe_to_block("test")
      |> BlocksTestRunner.test_input(message)
      |> BlocksTestRunner.wait()
      |> BlocksTestRunner.stream_through_chat(:content, ["Hello!"])
      |> BlocksTestRunner.stream_through_chat(:end)
      |> assert_receive_message(
        "test",
        :output,
        message
        |> Message.from_message()
        |> Message.set_type(:text)
        |> Message.set_message("Hello!")
      )
    end

    def create_run(_) do
      {:ok, run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            NewChat.create(%{
              name: "test",
              opts: %{
                api_type: "openai",
                api_key: "key",
                endpoint: "http://example.com",
                model: "gpt-4o-mini",
                temperature: 0.1,
                max_tokens: 0,
                response_format: "text",
                system_message: "hello",
                messages: [%{role: "user", content: "hello world"}],
                prompt_template: "{{TEST_INPUT:output}}"
              },
              connections: [
                BlocksTestRunner.test_text_input_connection(:input)
              ]
            })
          ]
        })

      %{run: run}
    end
  end
end
