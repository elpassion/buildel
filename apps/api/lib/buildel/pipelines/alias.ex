defmodule Buildel.Pipelines.Alias do
  use Ecto.Schema
  import Ecto.Changeset

  schema "pipeline_aliases" do
    field(:name, :string)
    field(:config, :map)
    field(:interface_config, :map)

    belongs_to(:pipeline, Buildel.Pipelines.Pipeline)

    timestamps()
  end

  @doc false
  def changeset(pipeline_alias, attrs) do
    pipeline_alias
    |> cast(attrs, [:name, :config, :interface_config, :pipeline_id])
    |> validate_required([:name, :config, :interface_config, :pipeline_id])
    |> assoc_constraint(:pipeline)
  end
end
