defmodule Buildel.Blocks.BrowserTest do
  use Buildel.BlockCase, async: true
  alias Blocks.Browser

  use ExVCR.Mock, adapter: ExVCR.Adapter.Hackney

  test "exposes options" do
    assert Browser.options() == %{
             type: "browser",
             description: "Used for browsing a website and extracting information",
             groups: ["tools"],
             inputs: [
               Block.text_input("url")
             ],
             outputs: [Block.text_output(), Block.file_output("file_output")],
             ios: [Block.io("tool", "worker")],
             schema: Browser.schema()
           }
  end

  test "validates schema correctly" do
    assert :ok =
             Blocks.validate_block(Browser, %{
               "name" => "test",
               "opts" => %{}
             })

    assert {:error, _} = Blocks.validate_block(Browser, %{})
  end

  describe "function" do
    test "exposes function correctly" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            BlocksTestRunner.create_test_text_input_block("test_input"),
            Browser.create(%{
              name: "test",
              opts: %{
                call_formatter: "custom formatter {{config.args}}\n"
              },
              connections: [
                Blocks.Connection.from_connection_string("test_input:output->url", "text")
              ]
            })
          ]
        })

      function = test_run |> BlocksTestRunner.Run.get_tools("test")

      assert [
               %{
                 function: %{
                   name: "test::url"
                 },
                 call_formatter: call_formatter
               }
             ] = function

      args = %{hello: "world"}

      assert "custom formatter #{Jason.encode!(args)}\n" == call_formatter.(args)
    end

    test "handles errors" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            BlocksTestRunner.create_test_text_input_block("test_input"),
            Browser.create(%{
              name: "test",
              opts: %{},
              connections: [
                Blocks.Connection.from_connection_string("test_input:output->url", "text")
              ]
            })
          ]
        })

      {:ok, text_topic} = test_run |> BlocksTestRunner.Run.subscribe_to_block("test")

      use_cassette("browser_api_call_error_url") do
        test_run
        |> BlocksTestRunner.Run.input(
          "test_input",
          "input",
          {:text, "invalid_url"}
        )

        assert_receive({^text_topic, :error, [:invalid_url], _})
      end

      use_cassette("browser_api_call_error_content") do
        test_run
        |> BlocksTestRunner.Run.input(
          "test_input",
          "input",
          {:text, "https://reddit.com"}
        )

        assert_receive({^text_topic, :error, ["No content found"], _})
      end

      use_cassette("browser_api_call_error_other") do
        test_run
        |> BlocksTestRunner.Run.input(
          "test_input",
          "input",
          {:text, "https://thereisnosuchwebsiteeee.com"}
        )

        assert_receive({^text_topic, :error, _, _})
      end
    end
  end

  describe "outputs" do
    test "outputs text and file" do
      use_cassette("browser_api_call_outputs") do
        {:ok, test_run} =
          BlocksTestRunner.start_run(%{
            blocks: [
              BlocksTestRunner.create_test_text_input_block("test_input"),
              Browser.create(%{
                name: "test",
                opts: %{},
                connections: [
                  Blocks.Connection.from_connection_string("test_input:output->url", "text")
                ]
              })
            ]
          })

        {:ok, text_topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

        {:ok, file_topic} =
          test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "file_output")

        test_run
        |> BlocksTestRunner.Run.input(
          "test_input",
          "input",
          {:text, "https://jsonplaceholder.typicode.com/todos/1"}
        )

        assert_receive({^text_topic, :text, _, _}, 200)

        assert_receive(
          {^file_topic, :binary, _,
           %{
             file_id: _,
             file_name: _,
             file_type: _
           }},
          200
        )
      end
    end
  end
end
