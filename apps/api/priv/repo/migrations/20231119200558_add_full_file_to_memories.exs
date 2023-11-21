defmodule Buildel.Repo.Migrations.AddFullFileToMemories do
  use Ecto.Migration

  def change do
    alter table(:memories) do
      add :content, :text
    end
  end
end
