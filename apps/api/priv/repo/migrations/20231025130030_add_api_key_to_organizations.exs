defmodule Buildel.Repo.Migrations.AddApiKeyToOrganizations do
  use Ecto.Migration

  def change do
    alter table(:organizations) do
      add :api_key, :binary, null: true
      add :api_key_hash, :binary, null: true
    end

    execute(fn ->
      repo().update_all("organizations",
        set: [
          api_key: :crypto.strong_rand_bytes(32),
          api_key_hash: :crypto.hash(:sha256, "api_key")
        ]
      )
    end)

    alter table(:organizations) do
      modify :api_key, :binary, null: false
      modify :api_key_hash, :binary, null: false
    end
  end
end
