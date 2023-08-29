defmodule Buildel.Organizations.Membership do
  use Ecto.Schema
  import Ecto.Changeset

  schema "memberships" do

    belongs_to :organization, Buildel.Organizations.Organization
    belongs_to :user, Buildel.Accounts.User

    timestamps()
  end

  @doc false
  def changeset(membership, attrs) do
    membership
    |> cast(attrs, [:organization_id, :user_id])
    |> validate_required([:organization_id, :user_id])
    |> assoc_constraint(:organization)
    |> assoc_constraint(:user)
    |> unique_constraint([:organization_id, :user_id])
  end
end
