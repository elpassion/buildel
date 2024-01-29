defmodule Buildel.Pipelines.Pipeline do
  use Ecto.Schema
  import Ecto.Changeset

  schema "pipelines" do
    field(:name, :string)
    field(:config, :map)
    field(:interface_config, :map)

    has_many(:runs, Buildel.Pipelines.Run, on_delete: :delete_all)
    field(:runs_count, :integer, default: 0)

    belongs_to(:organization, Buildel.Organizations.Organization)

    timestamps()
  end

  @doc false
  def changeset(pipeline, attrs) do
    pipeline
    |> cast(attrs, [:name, :config, :interface_config, :organization_id])
    |> validate_required([:name, :config, :organization_id])
    |> assoc_constraint(:organization)
  end
end
