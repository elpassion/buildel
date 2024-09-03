defmodule Buildel.Blocks.Knowledge do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "knowledge",
      description: "A block that can be used to retrieve knowledge base details",
      groups: ["file", "memory"],
      inputs: [],
      outputs: [Block.text_output("documents")],
      ios: [],
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
                }
              )
          })
      }
    }
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

    {:ok, state}
  end

  def handle_cast({:output_on_start, collection_files}, state) do
    state = output(state, "documents", {:text, collection_files})
    {:noreply, state}
  end
end
