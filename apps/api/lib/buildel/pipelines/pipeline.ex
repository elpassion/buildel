defmodule Buildel.Pipelines.Pipeline do
  alias Buildel.Pipelines.Pipeline
  use Ecto.Schema
  import Ecto.Changeset

  schema "visible_pipelines" do
    field(:name, :string)
    field(:config, :map)
    field(:interface_config, :map)
    field(:budget_limit, :decimal)
    field(:logs_enabled, :boolean, default: false)

    has_many(:runs, Buildel.Pipelines.Run, on_delete: :delete_all)
    has_many(:pipeline_aliases, Buildel.Pipelines.Alias, on_delete: :delete_all)
    field(:runs_count, :integer, default: 0)

    belongs_to(:organization, Buildel.Organizations.Organization)

    field(:deleted_at, :utc_datetime)
    timestamps()
  end

  @doc false
  def changeset(pipeline, attrs) do
    pipeline
    |> cast(attrs, [
      :name,
      :config,
      :interface_config,
      :organization_id,
      :budget_limit,
      :logs_enabled
    ])
    |> validate_required([:name, :config, :organization_id])
    |> assoc_constraint(:organization)
  end

  def ios(%Pipeline{} = pipeline, public: true) do
    %{inputs: inputs, outputs: outputs} = ios(pipeline)

    %{
      inputs: inputs |> Enum.filter(& &1.input.public),
      outputs: outputs |> Enum.filter(& &1.output.public)
    }
  end

  def ios(%Pipeline{} = pipeline) do
    blocks =
      Map.get(pipeline.config, "blocks", [])
      |> Enum.map(fn block ->
        case Buildel.Blocks.type(block["type"]) do
          nil -> nil
          type -> Map.put(type.options(), :name, block["name"])
        end
      end)
      |> Enum.filter(fn
        nil -> false
        _ -> true
      end)

    outputs =
      blocks
      |> Enum.flat_map(fn block ->
        block.outputs
        |> Enum.map(fn output ->
          %{
            block_name: block.name,
            output: output
          }
        end)
      end)

    inputs =
      blocks
      |> Enum.flat_map(fn block ->
        block.inputs
        |> Enum.map(fn input ->
          %{
            block_name: block.name,
            input: input
          }
        end)
      end)

    %{inputs: inputs, outputs: outputs}
  end
end
