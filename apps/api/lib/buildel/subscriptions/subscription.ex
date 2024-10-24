defmodule Buildel.Subscriptions.Subscription do
  alias Buildel.Subscriptions.Subscription
  use Ecto.Schema
  import Ecto.Changeset

  schema "subscriptions" do
    field(:subscription_id, :string)
    field(:customer_id, :string)
    field(:plan_id, :string)
    field(:start_date, :utc_datetime)
    field(:end_date, :utc_datetime)
    field(:cancel_at_period_end, :boolean, default: false)
    field(:type, :string)
    field(:interval, :string)
    field(:features, :map)
    field(:usage, :map, default: %{})
    field(:split, :integer, default: 1)

    belongs_to(:organization, Buildel.Organizations.Organization)

    timestamps()
  end

  def changeset(subscription, attrs) do
    subscription
    |> cast(attrs, [
      :subscription_id,
      :customer_id,
      :plan_id,
      :organization_id,
      :start_date,
      :end_date,
      :cancel_at_period_end,
      :type,
      :interval,
      :features,
      :usage,
      :split
    ])
    |> validate_required([
      :organization_id,
      :start_date,
      :end_date,
      :type,
      :interval,
      :features
    ])
    |> unique_constraint(:organization_id)
  end

  def status(%Subscription{} = subscription) do
    now = DateTime.utc_now() |> DateTime.to_unix()
    end_date = subscription.end_date |> DateTime.to_unix()

    case subscription do
      %Subscription{} when end_date < now ->
        :expired

      %Subscription{cancel_at_period_end: canceled}
      when end_date > now and canceled ->
        :canceled

      %Subscription{} when end_date > now ->
        :active
    end
  end
end
