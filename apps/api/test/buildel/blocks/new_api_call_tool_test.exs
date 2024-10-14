defmodule Buildel.Blocks.NewApiCallToolTest do
  use Buildel.BlockCase, async: true
  alias Blocks.NewApiCallTool

  describe "ApiCallTool" do
    test "exposes options" do
      assert %{
               type: :api_call_tool,
               description: "Tool used to call HTTP APIs.",
               groups: ["tools", "text"],
               inputs: [_],
               outputs: [_],
               ios: [],
               dynamic_ios: nil
             } = NewApiCallTool.options()
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(NewApiCallTool, %{
                 name: "test",
                 opts: %{
                   method: "GET",
                   url: "https://example.com",
                   parameters: "{\"type\": \"object\", \"properties\": {}, \"required\": []}",
                   headers:
                     "{\"Content-Type\": \"application/json\", \"Accept\": \"application/json\"}"
                 }
               })

      assert {:error, _} = Blocks.validate_block(NewApiCallTool, %{})
    end
  end

  describe "ApiCallTool Run" do
    setup [:create_run]

    test "calls api correctly", %{run: test_run} do
      message = Message.new(:json, %{abc: "abc", id: 1, efg: "hello"})

      url = URI.parse("https://jsonplaceholder.typicode.com/todos/1?abc=abc&efg=hello")

      test_run
      |> BlocksTestRunner.with_api_responding(fn
        %Req.Request{
          url: ^url,
          method: "GET",
          headers: %{
            "content-type" => ["application/json"],
            "accept" => ["application/json"]
          }
        } ->
          {:ok, %Req.Response{status: 200, body: "hello"}}
      end)
      |> BlocksTestRunner.subscribe_to_block("test")
      |> BlocksTestRunner.test_input(message)
      |> assert_receive_message("test", :output, Message.new(:json, "hello"))
    end

    def create_run(_) do
      {:ok, run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            NewApiCallTool.create(%{
              name: "test",
              opts: %{
                method: "GET",
                url: "https://jsonplaceholder.typicode.com/todos/{{id}}?abc={{abc}}&efg={{efg}}",
                parameters: "{\"type\": \"object\", \"properties\": {}, \"required\": []}",
                headers:
                  "{\"Content-Type\": \"application/json\", \"Accept\": \"application/json\"}"
              },
              connections: [
                BlocksTestRunner.test_text_input_connection(:args)
              ]
            })
          ]
        })

      %{run: run}
    end
  end
end
