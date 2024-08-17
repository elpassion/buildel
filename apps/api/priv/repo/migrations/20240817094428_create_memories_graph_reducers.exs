defmodule Buildel.Repo.Migrations.CreateMemoriesGraphReducers do
  use Ecto.Migration

  def change do
    create table(:memories_graph_reducers) do
      add :graph_name, :string, null: false
      add :reducer, :bytea, null: false
    end

    create unique_index(:memories_graph_reducers, [:graph_name])
  end
end
