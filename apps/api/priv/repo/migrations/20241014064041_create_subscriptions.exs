defmodule Buildel.Repo.Migrations.CreateSubscriptions do
  use Ecto.Migration

  def change do
    create table(:subscriptions) do
      add(:subscription_id, :string)
      add(:customer_id, :string)
      add(:start_date, :utc_datetime)
      add(:end_date, :utc_datetime)
      add(:cancel_at_period_end, :boolean, default: false)
      add(:type, :string)
      add(:interval, :string)
      add(:features, :map)

      add(:organization_id, references(:organizations, on_delete: :delete_all))

      timestamps()
    end

    create unique_index(:subscriptions, [:organization_id])
  end
end
