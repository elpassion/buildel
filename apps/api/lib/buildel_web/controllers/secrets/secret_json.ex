defmodule BuildelWeb.SecretJSON do
  alias Buildel.Secrets.Secret

  def index(%{secrets: secrets, include_aliases: true}) do
    data =
      secrets
      |> Enum.flat_map(fn secret ->
        if secret.alias == nil do
          [data(secret)]
        else
          [
            data(secret),
            %{
              id: "__" <> secret.alias,
              name: "Default for #{secret.alias} (#{secret.name})",
              alias: nil,
              created_at: secret.inserted_at,
              updated_at: secret.updated_at
            }
          ]
        end
      end)
      |> Enum.sort_by(&{:desc, &1.id |> String.downcase()})

    %{data: data}
  end

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
      hidden_value: value(secret.value),
      alias: secret.alias,
      created_at: secret.inserted_at,
      updated_at: secret.updated_at
    }
  end

  defp value(secret_value) do
    "#{secret_value |> String.slice(0, 4)}...#{secret_value |> String.slice(-4, 4)}"
  end
end
