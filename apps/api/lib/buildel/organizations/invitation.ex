defmodule Buildel.Organizations.Invitation do
  use Ecto.Schema
  import Ecto.Changeset

  schema "invitations" do
    field(:email, :string)
    field(:token, :binary)
    field(:expires_at, :utc_datetime)

    belongs_to(:organization, Buildel.Organizations.Organization)
    belongs_to(:user, Buildel.Accounts.User)

    timestamps()
  end

  @doc false
  def changeset(invitation, attrs) do
    invitation
    |> cast(attrs, [:organization_id, :user_id, :email, :token, :expires_at])
    |> validate_required([:organization_id, :email, :token, :expires_at])
    |> assoc_constraint(:organization)
    |> assoc_constraint(:user)
    |> unique_constraint([:organization_id, :email])
  end
end
