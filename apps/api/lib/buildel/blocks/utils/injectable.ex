defmodule Buildel.Blocks.Utils.Injectable do
  def used_metadata_keys(strings) when is_list(strings) do
    strings
    |> Enum.map(&used_metadata_keys/1)
    |> List.flatten()
    |> Enum.uniq()
  end

  def used_metadata_keys(string) do
    Regex.scan(~r/{{metadata.(.*)}}/U, string)
    |> Enum.map(fn [_, key] -> key end)
  end

  def used_secrets_keys(strings) when is_list(strings) do
    strings
    |> Enum.map(&used_secrets_keys/1)
    |> List.flatten()
    |> Enum.uniq()
  end

  def used_secrets_keys(string) do
    Regex.scan(~r/{{secrets.(.*)}}/U, string)
    |> Enum.map(fn [_, key] -> key end)
  end
end
