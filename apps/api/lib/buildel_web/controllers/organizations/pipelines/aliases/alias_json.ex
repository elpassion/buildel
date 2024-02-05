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
      config: alias.config,
      interface_config: alias.interface_config
    }
  end
end
