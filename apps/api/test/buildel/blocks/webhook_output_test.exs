defmodule Buildel.Blocks.WebhookOutputTest do
  use Buildel.BlockCase, async: true
  alias Blocks.WebhookOutput

  test "exposes options" do
    assert WebhookOutput.options() == %{
             type: "webhook_output",
             description:
               "This module is adept at forwarding text data to specified webhook URLs, facilitating seamless external integrations.",
             inputs: [Block.text_input("input")],
             outputs: [],
             schema: WebhookOutput.schema(),
             groups: ["inputs / outputs"],
             ios: []
           }
  end

  test "validates schema correctly" do
    assert :ok =
             Blocks.validate_block(WebhookOutput, %{
               "name" => "test",
               "opts" => %{
                 "url" => "http://localhost:3002/cats"
               },
               "inputs" => []
             })

    assert {:error, _} = Blocks.validate_block(WebhookOutput, %{})
  end

  test "send data to specific url" do
    url = "http://localhost:3002/cats"

    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          BlocksTestRunner.create_test_text_input_block("test_input"),
          WebhookOutput.create(%{
            name: "test",
            opts: %{url: url, metadata: %{}},
            connections: [
              Blocks.Connection.from_connection_string("test_input:output->input", "text")
            ]
          })
        ]
      })

    {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

    text = "HAHAAH"
    test_run |> BlocksTestRunner.Run.input("test_input", "input", {:text, text})

    assert_receive {^topic, :start_stream, nil, _}

    # TODO: Introduce a mock server to test this
    # assert_receive {:webhook_called, ^url,
    # "{\"content\":\"HAHAAH\",\"context\":{\"global\":\"run1\",\"local\":\"run1\",\"parent\":\"run1\"},\"topic\":\"context::run1::block::test::io::output\"}"}

    assert_receive {^topic, :stop_stream, nil, _}
  end
end
