defmodule Buildel.Pipelines.Pipeline do
  use Ecto.Schema
  import Ecto.Changeset

  schema "pipelines" do
    field :name, :string
    field :config, :map
    has_many :runs, Buildel.Pipelines.Run, on_delete: :delete_all

    timestamps()
  end

  @doc false
  def changeset(pipeline, attrs) do
    pipeline
    |> cast(attrs, [:name, :config])
    |> validate_required([:name, :config])
  end
end
