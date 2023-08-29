defmodule Buildel.BlockTypes.BlockType do
  use Ecto.Schema
  import Ecto.Changeset

  schema "block_types" do


    timestamps()
  end

  @doc false
  def changeset(block_type, attrs) do
    block_type
    |> cast(attrs, [])
    |> validate_required([])
  end
end
