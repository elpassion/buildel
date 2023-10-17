defmodule BuildelWeb.SecretJSON do
  alias Buildel.Secrets.Secret

  def index(%{secrets: secrets}) do
    %{data: for(secret <- secrets, do: data(secret))}
  end

  def show(%{secret: secret}) do
    %{data: data(secret)}
  end

  defp data(%Secret{} = secret) do
    %{
      id: secret.id,
      name: secret.name,
      created_at: secret.inserted_at
    }
  end
end
