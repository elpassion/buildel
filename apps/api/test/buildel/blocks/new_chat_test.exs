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
                   prompt_template: "{{TEST_INPUT:output}}",
                   chat_memory_type: "full"
                 }
               })

      assert {:error, _} = Blocks.validate_block(NewChat, %{})
    end
  end

  describe "Chat Run" do
    test "outputs chat response" do
      %{run: test_run} = create_run()

      message = Message.new(:text, "test")

      test_run
      |> BlocksTestRunner.with_secret(fn "key" -> "api_key" end)
      |> BlocksTestRunner.with_chat(fn _opts ->
        nil
      end)
      |> BlocksTestRunner.subscribe_to_block("test")
      |> BlocksTestRunner.test_input(message)
      |> BlocksTestRunner.wait(50)
      |> BlocksTestRunner.stream_through_chat(:content, ["H"])
      |> BlocksTestRunner.stream_through_chat(:content, ["ello!"])
      |> assert_receive_message(
        "test",
        :output,
        message
        |> Message.from_message()
        |> Message.set_type(:text)
        |> Message.set_message("H"),
        stop_stream: :none
      )
      |> assert_receive_message(
        "test",
        :output,
        message
        |> Message.from_message()
        |> Message.set_type(:text)
        |> Message.set_message("ello!"),
        start_stream: :none,
        stop_stream: :none
      )
      |> BlocksTestRunner.stream_through_chat(:end)
      |> assert_receive_stop_stream("test", :output)
    end

    test "collects messages" do
      %{run: test_run} =
        create_run(%{prompt_template: "{{TEST_INPUT:output}} {{TEST_INPUT_2:output}}"})

      message = Message.new(:text, "test")
      message_2 = Message.new(:text, "test_2")

      test_run
      |> BlocksTestRunner.with_secret(fn "key" -> "api_key" end)
      |> BlocksTestRunner.with_chat(fn _opts ->
        raise "Should not be called"
      end)
      |> BlocksTestRunner.subscribe_to_block("test")
      |> BlocksTestRunner.test_input(message)
      |> assert_receive_start_stream("test", :output)
      |> BlocksTestRunner.with_chat(fn opts ->
        assert [
                 %{role: "system", content: "hello"},
                 %{role: "user", content: "hello world"},
                 %{role: "user", content: "test test_2"}
               ] = opts[:messages]

        nil
      end)
      |> BlocksTestRunner.test_input_2(message_2)
      |> BlocksTestRunner.wait()
    end

    test "resets messages" do
      %{run: test_run} =
        create_run(%{prompt_template: "{{TEST_INPUT:output}} {{TEST_INPUT_2:output}}"})

      message = Message.new(:text, "test")
      message_2 = Message.new(:text, "test_2")

      test_run
      |> BlocksTestRunner.with_secret(fn "key" -> "api_key" end)
      |> BlocksTestRunner.with_chat(fn opts ->
        assert [
                 %{role: "system", content: "hello"},
                 %{role: "user", content: "hello world"},
                 %{role: "user", content: "test test_2"}
               ] = opts[:messages]
      end)
      |> BlocksTestRunner.subscribe_to_block("test")
      |> BlocksTestRunner.test_input(message)
      |> BlocksTestRunner.test_input_2(message_2)
      |> BlocksTestRunner.wait()
      |> BlocksTestRunner.stream_through_chat(:content, ["H"])
      |> BlocksTestRunner.stream_through_chat(:end)
      |> assert_receive_stop_stream("test", :output)
      |> BlocksTestRunner.with_chat(fn _opts ->
        raise "Should not run"
      end)
      |> BlocksTestRunner.test_input(message)
      |> BlocksTestRunner.wait()
    end

    test "works with full memory" do
      %{run: test_run} =
        create_run(%{
          chat_memory_type: "full"
        })

      message = Message.new(:text, "test")
      message_2 = Message.new(:text, "test_2")

      test_run
      |> BlocksTestRunner.with_secret(fn "key" -> "api_key" end)
      |> BlocksTestRunner.with_chat(fn _opts ->
        nil
      end)
      |> BlocksTestRunner.subscribe_to_block("test")
      |> BlocksTestRunner.test_input(message)
      |> BlocksTestRunner.wait()
      |> BlocksTestRunner.stream_through_chat(:content, ["H"])
      |> BlocksTestRunner.stream_through_chat(:end)
      |> assert_receive_stop_stream("test", :output)
      |> BlocksTestRunner.with_chat(fn opts ->
        assert [
                 %{role: "system", content: "hello"},
                 %{role: "user", content: "hello world"},
                 %{role: "user", content: "test"},
                 %{role: "assistant", content: "H"},
                 %{role: "user", content: "test_2"}
               ] = opts[:messages]

        nil
      end)
      |> BlocksTestRunner.test_input(message_2)
      |> BlocksTestRunner.wait()
    end

    def create_run(opts \\ %{}) do
      opts =
        Map.merge(
          %{
            api_type: "openai",
            api_key: "key",
            endpoint: "http://example.com",
            model: "gpt-4o-mini",
            temperature: 0.1,
            max_tokens: 0,
            response_format: "text",
            system_message: "hello",
            messages: [%{role: "user", content: "hello world"}],
            prompt_template: "{{TEST_INPUT:output}}",
            chat_memory_type: "off"
          },
          opts
        )

      {:ok, run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            NewChat.create(%{
              name: "test",
              opts: opts,
              connections: [
                BlocksTestRunner.test_text_input_connection(:input),
                BlocksTestRunner.test_text_input_2_connection(:input)
              ]
            })
          ]
        })

      %{run: run}
    end
  end
end
