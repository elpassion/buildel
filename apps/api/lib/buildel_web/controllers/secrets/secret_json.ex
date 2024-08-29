defmodule BuildelWeb.SecretJSON do
  alias Buildel.Secrets.Secret

  def index(%{secrets: secrets}) do
    %{data: for(secret <- secrets, do: data(secret))}
  end

  def show(%{secret: secret}) do
    %{data: data(secret)}
  end

  def aliases(%{aliases: aliases}) do
    %{data: Enum.map(aliases, fn alias -> %{id: alias, name: alias} end)}
  end

  defp data(%Secret{} = secret) do
    %{
      id: secret.name,
      name: secret.name,
      alias: secret.alias,
      created_at: secret.inserted_at,
      updated_at: secret.updated_at
    }
  end
end
