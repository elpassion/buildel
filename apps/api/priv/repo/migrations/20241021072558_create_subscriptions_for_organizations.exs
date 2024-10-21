defmodule Buildel.Repo.Migrations.CreateSubscriptionsForOrganizations do
  import Ecto.Query
  use Ecto.Migration

  def change do
    organizations =
      from(o in Buildel.Organizations.Organization, select: o.id)
      |> Buildel.Repo.all()

    {:ok, features} = Buildel.Subscriptions.Plan.get_features("free")

    subscriptions =
      Enum.map(organizations, fn organization_id ->
        %{
          organization_id: organization_id,
          start_date:
            NaiveDateTime.utc_now()
            |> DateTime.from_naive!("Etc/UTC")
            |> DateTime.truncate(:second),
          end_date:
            NaiveDateTime.utc_now()
            |> NaiveDateTime.add(31, :day)
            |> DateTime.from_naive!("Etc/UTC")
            |> DateTime.truncate(:second),
          type: "free",
          interval: "month",
          features: features,
          usage: %{
            runs_limit: 0
          },
          inserted_at:
            NaiveDateTime.utc_now()
            |> NaiveDateTime.truncate(:second),
          updated_at:
            NaiveDateTime.utc_now()
            |> NaiveDateTime.truncate(:second)
        }
      end)

    Buildel.Repo.insert_all(Buildel.Subscriptions.Subscription, subscriptions)
  end
end
