defmodule Buildel.Repo.Migrations.AddMarketingAgreementToUser do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :marketing_agreement, :boolean
    end
  end
end
