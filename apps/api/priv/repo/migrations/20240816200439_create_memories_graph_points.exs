defmodule Buildel.Repo.Migrations.CreateMemoriesGraphPoints do
  use Ecto.Migration

  def change do
    create table(:memories_graph_points, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("gen_random_uuid()"), null: false
      add :graph_name, :string, null: false
      add :point, {:array, :float}
    end
  end
end
