defmodule Buildel.Blocks.ApiCallToolTest do
  use Buildel.BlockCase
  alias Blocks.ApiCallTool

  test "exposes options" do
    assert ApiCallTool.options() == %{
             description: "Tool used to call HTTP APIs.",
             groups: ["text", "tools"],
             inputs: [],
             outputs: [],
             ios: [Block.io("tool", "worker")],
             schema: ApiCallTool.schema(),
             type: "api_call_tool"
           }
  end

  test "validates schema correctly" do
    assert :ok =
             Blocks.validate_block(ApiCallTool, %{
               "name" => "test",
               "opts" => %{
                 "method" => "GET",
                 "url" => "http://example.com",
                 "description" => "test",
                 "parameters" => "{}",
                 "headers" => "{}"
               }
             })

    assert {:error, _} = Blocks.validate_block(ApiCallTool, %{})
  end

  test "exposes function" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          ApiCallTool.create(%{
            name: "test",
            opts: %{
              method: "GET",
              url: "http://example.com",
              description: "description",
              parameters: "{}",
              headers: "{}",
              metadata: %{}
            },
            connections: []
          })
        ]
      })

    function = test_run |> BlocksTestRunner.Run.get_block_function("test")

    assert %{
             function: %{
               name: "test",
               description: "description"
             },
             call_formatter: call_formatter,
             response_formatter: response_formatter
           } = function

    args = %{hello: "world"}

    assert "test API 🖥️: #{Jason.encode!(args)}\n" == call_formatter.(args)
    assert "" == response_formatter.("hello")
  end
end
