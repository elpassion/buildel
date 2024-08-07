defmodule Buildel.Blocks.ApiCallToolTest do
  use Buildel.BlockCase, async: true
  alias Blocks.ApiCallTool

  use ExVCR.Mock, adapter: ExVCR.Adapter.Hackney

  test "exposes options" do
    assert ApiCallTool.options() == %{
             description: "Tool used to call HTTP APIs.",
             groups: ["tools", "text"],
             inputs: [Block.text_input("args")],
             outputs: [Block.text_output("response")],
             ios: [Block.io("tool", "worker")],
             dynamic_ios: nil,
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

  describe "input" do
    test "calls api correctly" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            BlocksTestRunner.create_test_text_input_block("test_input"),
            ApiCallTool.create(%{
              name: "test",
              opts: %{
                method: "GET",
                url: "https://jsonplaceholder.typicode.com/todos/{{id}}?abc={{abc}}&efg={{efg}}",
                description: "description",
                parameters: "{}",
                headers: "{}",
                metadata: %{},
                call_formatter: "",
                jq_filter: "."
              },
              connections: [
                Blocks.Connection.from_connection_string("test_input:output->args", "text")
              ]
            })
          ]
        })

      {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "response")

      use_cassette("example_api_call") do
        test_run
        |> BlocksTestRunner.Run.input(
          "test_input",
          "input",
          {:text, %{id: 1, abc: "abc", efg: %{a: "123"}} |> Jason.encode!()}
        )

        assert_receive({^topic, :text, _, _}, 200)
      end
    end

    test "interpolates metadata" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            BlocksTestRunner.create_test_text_input_block("test_input"),
            ApiCallTool.create(%{
              name: "test",
              opts: %{
                method: "GET",
                url:
                  "https://jsonplaceholder.typicode.com/todos/{{metadata.id}}?abc={{metadata.abc}}&efg={{metadata.efg.a}}",
                description: "description",
                parameters: "{}",
                headers: "{\"test\": \"{{metadata.abc}}\"}",
                metadata: %{"id" => "1", "abc" => "abc", "efg" => %{"a" => "123"}},
                call_formatter: "",
                jq_filter: "."
              },
              connections: [
                Blocks.Connection.from_connection_string("test_input:output->args", "text")
              ]
            })
          ]
        })

      {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "response")

      use_cassette("example_api_call_with_interpolation") do
        test_run
        |> BlocksTestRunner.Run.input("test_input", "input", {:text, "{}"})

        assert_receive({^topic, :text, _, _}, 10000)
      end
    end

    test "interpolates secrets" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            BlocksTestRunner.create_test_text_input_block("test_input"),
            ApiCallTool.create(%{
              name: "test",
              opts: %{
                method: "GET",
                url: "https://jsonplaceholder.typicode.com/todos/{{secrets.id}}",
                description: "description",
                parameters: "{}",
                headers: "{\"test\": \"{{secrets.abc}}\"}",
                metadata: %{},
                call_formatter: "",
                jq_filter: "."
              },
              connections: [
                Blocks.Connection.from_connection_string("test_input:output->args", "text")
              ]
            })
          ]
        })

      {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "response")

      use_cassette("example_api_call_with_secrets") do
        test_run
        |> BlocksTestRunner.Run.input("test_input", "input", {:text, "{}"})

        assert_receive({^topic, :text, _, _}, 10000)
      end
    end

    test "interpolates all available values" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            BlocksTestRunner.create_test_text_input_block("test_input"),
            ApiCallTool.create(%{
              name: "test",
              opts: %{
                method: "GET",
                url: "https://jsonplaceholder.typicode.com/todos/{{secrets.id}}",
                description: "description",
                parameters: "{}",
                headers: "{\"test\": \"{{secrets.abc}}\", \"w\": \"{{metadata.w}}\"}",
                metadata: %{},
                call_formatter: "",
                jq_filter: "."
              },
              connections: [
                Blocks.Connection.from_connection_string("test_input:output->args", "text")
              ]
            })
          ]
        })

      {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "response")

      use_cassette("example_api_partial_call") do
        test_run
        |> BlocksTestRunner.Run.input("test_input", "input", {:text, "{}"})

        assert_receive({^topic, :text, _, _}, 10000)
      end
    end
  end

  describe "function" do
    test "exposes function correctly" do
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
                metadata: %{},
                call_formatter: "{{config.block_name}} API 🖥️: {{config.args}}\n",
                jq_filter: "."
              },
              connections: []
            })
          ]
        })

      function = test_run |> BlocksTestRunner.Run.get_tools("test")

      assert [
               %{
                 function: %{
                   name: "test::request",
                   description: "description"
                 },
                 call_formatter: call_formatter,
                 response_formatter: response_formatter
               }
             ] = function

      args = %{hello: "world"}

      assert "test API 🖥️: #{Jason.encode!(args)}\n" == call_formatter.(args)
      assert "" == response_formatter.("hello")
    end

    @tag :skip
    test "calls API correctly" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            ApiCallTool.create(%{
              name: "test",
              opts: %{
                method: "GET",
                url: "https://jsonplaceholder.typicode.com/todos/{{id}}?abc={{abc}}&efg={{efg}}",
                description: "description",
                parameters: "{}",
                headers: "{}",
                metadata: %{},
                call_formatter: "",
                jq_filter: "."
              },
              connections: []
            })
          ]
        })

      [%{function: %{function: function}}] =
        test_run |> BlocksTestRunner.Run.get_tools("test")

      use_cassette("example_api_call") do
        assert "{\"status\":200,\"body\":\"{\\n  \\\"userId\\\": 1,\\n  \\\"id\\\": 1,\\n  \\\"title\\\": \\\"delectus aut autem\\\",\\n  \\\"completed\\\": false\\n}\"}" =
                 function.(%{id: 1, abc: "abc", efg: %{a: "123"}}, %{})
      end
    end

    @tag :skip
    test "handles errors" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            ApiCallTool.create(%{
              name: "test",
              opts: %{
                method: "GET",
                url: "https://non-existent.com",
                description: "description",
                parameters: "{}",
                headers: "{}",
                metadata: %{},
                call_formatter: "",
                jq_filter: "."
              },
              connections: []
            })
          ]
        })

      [%{function: %{function: function}}] =
        test_run |> BlocksTestRunner.Run.get_tools("test")

      use_cassette("example_api_call_error") do
        assert "Error: connect_timeout" = function.(%{id: "lol"}, %{})
      end
    end

    @tag :skip
    test "adds authorization header" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            ApiCallTool.create(%{
              name: "test",
              opts: %{
                method: "GET",
                url: "https://jsonplaceholder.typicode.com/todos/{{id}}",
                description: "description",
                parameters: "{}",
                headers: "{}",
                metadata: %{},
                authorize: true,
                call_formatter: "",
                jq_filter: "."
              },
              connections: []
            })
          ]
        })

      [%{function: %{function: function}}] =
        test_run |> BlocksTestRunner.Run.get_tools("test")

      use_cassette("example_api_call_with_auth_headers") do
        assert "{\"status\":200,\"body\":\"{\\n  \\\"userId\\\": 1,\\n  \\\"id\\\": 1,\\n  \\\"title\\\": \\\"delectus aut autem\\\",\\n  \\\"completed\\\": false\\n}\"}" =
                 function.(%{id: 1}, %{})
      end
    end
  end
end
