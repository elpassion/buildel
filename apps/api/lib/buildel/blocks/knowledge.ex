defmodule Buildel.Blocks.Knowledge do
  alias Buildel.Blocks.Fields.EditorField
  use Buildel.Blocks.Block
  use Buildel.Blocks.Tool

  @impl true
  def options() do
    %{
      type: "knowledge",
      description: "A block that can be used to retrieve knowledge base details",
      groups: ["file", "memory"],
      inputs: [],
      outputs: [Block.text_output("documents")],
      ios: [Block.io("tool", "worker")],
      dynamic_ios: nil,
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "inputs", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => ["knowledge", "output_on_start"],
            "properties" =>
              Jason.OrderedObject.new(
                knowledge:
                  memory_schema(%{
                    "readonly" => true,
                    "title" => "Knowledge",
                    "description" => "The knowledge to use for retrieval.",
                    "default" => ""
                  }),
                output_on_start: %{
                  "type" => "boolean",
                  "title" => "Output on start",
                  "description" => "Whether to send output signals on workflow start",
                  "default" => true
                },
                call_formatter:
                  EditorField.call_formatter(%{
                    description: "The formatter to use when retrieving data from DB.",
                    default: "Database 📑: Document {{config.args}}\n",
                    display_when: %{
                      connections: %{
                        tool_worker: %{
                          min: 1
                        }
                      }
                    }
                  })
              )
          })
      }
    }
  end

  @impl true
  def tools(state) do
    [
      %{
        function: %{
          name: "documents",
          description: "Retrieve documents list from knowledge base.",
          parameters_schema: %{
            type: "object",
            properties: %{},
            required: []
          }
        },
        call_formatter: fn args ->
          args = %{"config.args" => args, "config.block_name" => state.block.name}
          build_call_formatter(state.block.opts.call_formatter, args)
        end,
        response_formatter: fn _response ->
          ""
        end
      }
    ]
  end

  @impl true
  def setup(
        %{
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        } = state
      ) do
    %{global: organization_id} = block_context().context_from_context_id(context_id)
    organization = Buildel.Organizations.get_organization!(organization_id)

    {:ok, collection, _collection_name} =
      block_context().get_global_collection(context_id, opts.knowledge)

    collection_files =
      Buildel.Memories.list_organization_collection_memories(organization, collection)
      |> Enum.map(fn memory ->
        %{
          file_name: memory.file_name,
          id: memory.file_uuid
        }
      end)

    if opts[:output_on_start] == "on" do
      GenServer.cast(self(), {:output_on_start, Jason.encode!(collection_files)})
    end

    {:ok, state |> Map.put(:collection_files, collection_files)}
  end

  def handle_cast({:output_on_start, collection_files}, state) do
    state = output(state, "documents", {:text, collection_files})
    {:noreply, state}
  end

  @impl true
  def handle_tool("tool", "documents", {_topic, :text, _args, _}, state) do
    state = state |> send_stream_start()

    {state.collection_files |> Jason.encode!(), state}
  end

  defp build_call_formatter(value, args) do
    args
    |> Enum.reduce(value, fn
      {key, value}, acc when is_number(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

      {key, value}, acc when is_binary(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

      {key, value}, acc when is_map(value) ->
        String.replace(acc, "{{#{key}}}", Jason.encode!(value))

      _, acc ->
        acc
    end)
  end
end
