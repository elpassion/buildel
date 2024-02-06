defmodule BuildelWeb.OrganizationPipelineAliasJSON do
  alias Buildel.Pipelines.Alias

  def index(%{aliases: aliases}) do
    %{data: for(alias <- aliases, do: data(alias))}
  end

  def show(%{alias: alias}) do
    %{data: data(alias)}
  end

  defp data(%Alias{} = alias) do
    %{
      id: alias.id,
      name: alias.name,
      config:
        Map.update(alias.config, "blocks", [], fn blocks ->
          Enum.map(blocks, fn block ->
            case Buildel.Blocks.type(block["type"]) do
              nil ->
                nil

              type ->
                Map.put(
                  block,
                  "block_type",
                  type.options
                )
            end
          end)
          |> Enum.filter(fn
            nil -> false
            _ -> true
          end)
        end),
      interface_config: alias.interface_config
    }
  end
end
