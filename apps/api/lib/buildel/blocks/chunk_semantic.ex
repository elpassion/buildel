defmodule Buildel.Blocks.ChunkSemantic do
  alias Buildel.Blocks.Fields.EditorField
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "chunk_semantic",
      description: "Used to convert a list of elements into a list of chunks.",
      groups: ["file"],
      inputs: [Block.text_input()],
      outputs: [Block.text_output(), Block.text_output("joined_content")],
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
            "required" => ["chunk_size", "chunk_overlap"],
            "properties" =>
              Jason.OrderedObject.new(
                chunk_size: %{
                  "type" => "number",
                  "title" => "Chunk size in characters.",
                  "description" => "The size of the chunks to be created.",
                  "minimum" => 10,
                  "default" => 500,
                  "step" => 1
                },
                chunk_overlap: %{
                  "type" => "number",
                  "title" => "Chunk overlap in characters.",
                  "description" => "The number of characters that will be shared between chunks.",
                  "minimum" => 0,
                  "default" => 50,
                  "step" => 1
                },
                joiner:
                  EditorField.new(%{
                    title: "Chunk joiner.",
                    description:
                      "The string that will be used to join the chunks together for joined content.",
                    default: "\n\n",
                    suggestions: [],
                    editorLanguage: "custom"
                  })
              )
          })
      }
    }
  end

  @impl true
  def handle_input("input", {_name, :text, text, metadata}, state) do
    document_workflow =
      Buildel.DocumentWorkflow.new(%{
        workflow_config: %{
          chunk_size: state.opts.chunk_size,
          chunk_overlap: state.opts.chunk_overlap
        }
      })

    elements =
      text
      |> Jason.decode!(keys: :atoms)
      |> Buildel.DocumentWorkflow.DocumentProcessor.load_elements()

    chunks = Buildel.DocumentWorkflow.build_node_chunks(document_workflow, elements)

    state
    |> output("output", {:text, chunks |> Jason.encode!()}, %{
      metadata: metadata
    })
    |> output(
      "joined_content",
      {:text, chunks |> Buildel.DocumentWorkflow.join(state.opts.joiner)},
      %{
        metadata: metadata
      }
    )
  end
end
