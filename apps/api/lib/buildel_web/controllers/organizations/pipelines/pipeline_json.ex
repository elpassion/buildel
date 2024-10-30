defmodule BuildelWeb.OrganizationPipelineJSON do
  alias Buildel.Pipelines.Pipeline

  def index(%{
        pipelines: pipelines,
        params: %Buildel.Pipelines.ListParams{} = params,
        total: total
      }) do
    params =
      case params do
        %{page: nil, per_page: nil} ->
          %Buildel.Pipelines.ListParams{page: 1, per_page: total}

        params ->
          params
      end

    %{
      data: for(pipeline <- pipelines, do: data(pipeline)),
      meta: %{
        total: total,
        page: params.page,
        per_page: params.per_page
      }
    }
  end

  def show(%{pipeline: pipeline}) do
    %{data: data(pipeline)}
  end

  def details(%{total_cost: total_cost}) do
    %{
      data: %{
        total_cost: total_cost
      }
    }
  end

  def ios(%{pipeline: %Pipeline{} = pipeline}) do
    blocks_opts =
      Map.get(pipeline.config, "blocks", [])
      |> Enum.map(fn block ->
        case Buildel.Blocks.type(block["type"]) do
          nil -> nil
          type -> Map.put(type.options(), :name, block["name"])
        end
      end)
      |> Enum.filter(fn
        nil -> false
        _ -> true
      end)

    %{
      data:
        Enum.reduce(blocks_opts, %{inputs: [], outputs: [], ios: []}, fn item, acc ->
          %{
            inputs: acc.inputs ++ concat_block_name(item.inputs, item.name),
            outputs: acc.outputs ++ concat_block_name(item.outputs, item.name),
            ios: acc.ios ++ concat_block_name(item.ios, item.name)
          }
        end)
    }
  end

  defp concat_block_name(block_types, block_name) do
    Enum.map(block_types, fn block_type ->
      Map.update!(block_type, :name, fn name -> block_name <> ":" <> to_string(name) end)
    end)
  end

  defp data(%Pipeline{} = pipeline) do
    %{
      id: pipeline.id,
      name: pipeline.name,
      budget_limit: pipeline.budget_limit,
      logs_enabled: pipeline.logs_enabled,
      favorite: pipeline.favorite,
      organization_id: pipeline.organization_id,
      interface_config: pipeline.interface_config,
      runs_count: pipeline.runs_count,
      config:
        Map.update(pipeline.config, "blocks", [], fn blocks ->
          Enum.map(blocks, fn block ->
            case Buildel.Blocks.type(block["type"]) do
              nil -> nil
              _type -> block |> Map.delete("block_type")
            end
          end)
          |> Enum.filter(fn
            nil -> false
            _ -> true
          end)
        end)
    }
  end
end
