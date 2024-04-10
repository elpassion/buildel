defmodule Buildel.Invitations do
  import Ecto.Query, warn: false
  alias Buildel.Repo
  alias Buildel.Organizations.Invitation
  alias Buildel.Accounts.UserNotifier

  @hash_algorithm :sha256
  @rand_size 32

  def get_invitation_by_id(id) do
    case Repo.get(Invitation, id) do
      nil -> {:error, :not_found}
      invitation -> {:ok, invitation}
    end
  end

  def list_organization_invitations(organization_id) do
    from(i in Invitation, where: i.organization_id == ^organization_id) |> Repo.all()
  end

  def delete_invitation(%Invitation{} = invitation) do
    Repo.delete(invitation)
  end

  def deliver_user_invitation_instructions(
        email,
        confirmation_url_fun,
        organization_id,
        user_id \\ nil
      )
      when is_function(confirmation_url_fun, 1) do
    {encoded_token, invitation_token} = build_hashed_token(email, organization_id, user_id)

    invitation =
      create_invitation(invitation_token)

    UserNotifier.deliver_invitation_instructions(email, confirmation_url_fun.(encoded_token))

    invitation
  end

  def create_invitation(attrs \\ %{}) do
    case %Invitation{}
         |> Invitation.changeset(attrs)
         |> Repo.insert() do
      {:ok, invitation} -> {:ok, invitation |> Repo.preload([:organization, :user])}
      {:error, changeset} -> {:error, changeset}
    end
  end

  def build_hashed_token(email, organization_id, user_id) do
    token = :crypto.strong_rand_bytes(@rand_size)
    hashed_token = :crypto.hash(@hash_algorithm, token)

    {Base.url_encode64(token, padding: false),
     %{
       token: hashed_token,
       email: email,
       organization_id: organization_id,
       user_id: user_id,
       expires_at: DateTime.utc_now() |> DateTime.add(1, :day) |> DateTime.truncate(:second)
     }}
  end

  def resolve_invitation(%Invitation{} = invitation) do
    case Repo.delete(invitation) do
      {:ok, _} -> {:ok, invitation}
      {:error, _} -> {:error, :not_found}
    end
  end

  def get_invitation_by_token(token) do
    case Repo.get_by(Invitation, token: token) do
      nil -> {:error, :not_found}
      invitation -> {:ok, invitation}
    end
  end

  def verify_invitation(%Invitation{} = invitation) do
    case DateTime.utc_now() do
      now when now < invitation.expires_at -> {:ok, invitation}
      _ -> {:error, :invitation_expired}
    end
  end

  def verify_token(token) do
    case Base.url_decode64(token, padding: false) do
      {:ok, decoded_token} ->
        hashed_token = :crypto.hash(@hash_algorithm, decoded_token)

        {:ok, hashed_token}

      :error ->
        {:error, :invalid_token}
    end
  end
end
