defmodule Buildel.Blocks.NewBrowserTest do
  use Buildel.BlockCase, async: true
  alias Blocks.NewBrowserTool

  test "exposes options" do
    assert %{
             type: :browser,
             description: "Used for browsing a website and extracting information",
             groups: ["tools"],
             inputs: [_],
             outputs: [_],
             ios: [],
             dynamic_ios: nil
           } = NewBrowserTool.options()
  end

  test "validates schema correctly" do
    assert :ok =
             Blocks.validate_block(NewBrowserTool, %{
               name: "test",
               opts: %{}
             })

    assert {:error, _} = Blocks.validate_block(NewBrowserTool, %{})
  end

  describe "Browser Run" do
    setup [:create_run]

    test "calls api correctly", %{run: test_run} do
      message = Message.new(:text, "https://jsonplaceholder.typicode.com/todos/1")

      url = URI.parse("https://jsonplaceholder.typicode.com/todos/1")

      test_run
      |> BlocksTestRunner.with_api_responding(fn
        %Req.Request{
          url: ^url,
          method: "GET"
        } ->
          {:ok, %Req.Response{status: 200, body: "hello"}}
      end)
      |> BlocksTestRunner.subscribe_to_block("test")
      |> BlocksTestRunner.test_input(message)
      |> assert_receive_message(
        "test",
        :output,
        Message.from_message(message)
        |> Message.set_type(:json)
        |> Message.set_message(" Para1 header1 li11 li12 header2 li2 header3")
      )
    end

    def create_run(_) do
      {:ok, run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            NewBrowserTool.create(%{
              name: "test",
              opts: %{},
              connections: [
                BlocksTestRunner.test_text_input_connection(:url)
              ]
            })
          ]
        })

      %{run: run}
    end
  end
end
