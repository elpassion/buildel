defmodule Buildel.Pipelines do
  import Ecto.Query, warn: false
  alias Buildel.Pipelines.Alias
  alias Buildel.Costs.Cost
  alias Buildel.Pipelines.RunCost
  alias Buildel.Repo

  alias Buildel.Pipelines.Pipeline
  alias Buildel.Organizations.Organization

  def list_pipelines do
    Repo.all(Pipeline)
  end

  def get_pipeline!(id), do: Repo.get!(Pipeline, id)
  def get_pipeline(id), do: Repo.get(Pipeline, id)

  def create_pipeline(attrs \\ %{}) do
    %Pipeline{}
    |> Pipeline.changeset(attrs)
    |> Repo.insert()
  end

  def update_pipeline(%Pipeline{} = pipeline, attrs) do
    pipeline
    |> Pipeline.changeset(attrs)
    |> Repo.update()
  end

  def delete_pipeline(%Pipeline{} = pipeline) do
    Repo.delete(pipeline)
  end

  def change_pipeline(%Pipeline{} = pipeline, attrs \\ %{}) do
    Pipeline.changeset(pipeline, attrs)
  end

  def list_organization_pipelines(%Organization{} = organization) do
    from(p in Pipeline, where: p.organization_id == ^organization.id, order_by: [desc: p.id])
    |> Repo.all()
  end

  def get_organization_pipeline(%Organization{} = organization, id) do
    case from(p in Pipeline, where: p.organization_id == ^organization.id, where: p.id == ^id)
         |> Repo.one() do
      nil -> {:error, :not_found}
      pipeline -> {:ok, pipeline}
    end
  end

  alias Buildel.Pipelines.Run

  def list_runs do
    Repo.all(Run) |> Repo.preload(:pipeline)
  end

  def verify_pipeline_budget_limit(%Pipeline{} = pipeline) do
    %{total_cost: total_cost} = get_pipeline_costs_for_current_month(pipeline)

    budget_limit = Decimal.new(pipeline.budget_limit || 0.0)
    result = Decimal.compare(total_cost || 0.0, budget_limit)

    case result do
      :lt -> {:ok, total_cost}
      _ -> {:error, :budget_limit_exceeded}
    end
  end

  def get_pipeline_costs_for_current_month(%Pipeline{} = pipeline) do
    today = Date.utc_today()
    start_date = today |> Date.beginning_of_month()

    start_of_month_naive = start_date |> NaiveDateTime.new!(~T[00:00:00])
    today_naive = NaiveDateTime.utc_now()

    get_pipeline_costs_by_dates(pipeline, start_of_month_naive, today_naive)
  end

  def get_pipeline_costs_by_dates(%Pipeline{} = pipeline, start_date, end_date) do
    from(r in Run,
      where: r.pipeline_id == ^pipeline.id,
      join: rc in RunCost,
      on: rc.run_id == r.id,
      join: c in Cost,
      on: c.id == rc.cost_id,
      where: c.inserted_at >= ^start_date and c.inserted_at <= ^end_date,
      group_by: r.pipeline_id,
      select: %{total_cost: sum(c.amount)}
    )
    |> Repo.one()
  end

  def list_pipeline_runs(%Pipeline{} = pipeline) do
    from(r in Run, where: r.pipeline_id == ^pipeline.id, order_by: [desc: r.id])
    |> Repo.all()
    |> Repo.preload(run_costs: :cost)
  end

  def get_pipeline_run(%Pipeline{} = pipeline, run_id) do
    case from(r in Run, where: r.pipeline_id == ^pipeline.id, where: r.id == ^run_id)
         |> Repo.one() do
      nil -> {:error, :not_found}
      run -> {:ok, run |> Repo.preload(:pipeline) |> Repo.preload(run_costs: :cost)}
    end
  end

  def get_running_pipeline_run(%Pipeline{} = pipeline, run_id) do
    case get_pipeline_run(pipeline, run_id) do
      {:ok, %Run{status: :running} = run} -> {:ok, run}
      {:ok, _run} -> {:error, :not_running}
      e -> e
    end
  end

  def get_pipeline_config(%Pipeline{config: config}, 0) do
    {:ok, config}
  end

  def get_pipeline_config(%Pipeline{config: config}, "latest") do
    {:ok, config}
  end

  def get_pipeline_config(pipeline, alias_id) do
    case get_pipeline_alias(pipeline, alias_id) do
      {:ok, alias} -> {:ok, alias.config}
      {:error, _} -> {:error, :not_found}
    end
  end

  def get_pipeline_alias(%Pipeline{} = pipeline, alias_id) do
    case from(a in Alias, where: a.pipeline_id == ^pipeline.id and a.id == ^alias_id)
         |> Repo.one() do
      nil -> {:error, :not_found}
      alias -> {:ok, alias}
    end
  end

  def get_run(id), do: Repo.get(Run, id) |> Repo.preload(:pipeline)

  def create_run(attrs \\ %{}) do
    case %Run{}
         |> Run.changeset(attrs)
         |> Repo.insert() do
      {:ok, struct} -> {:ok, struct |> Repo.preload(:pipeline)}
      {:error, changeset} -> {:error, changeset}
    end
  end

  def upsert_run(attrs \\ %{}) do
    if attrs[:id] do
      case get_run(attrs[:id]) do
        nil -> create_run(attrs |> Map.delete(:id))
        run -> {:ok, run}
      end
    else
      create_run(attrs |> Map.delete(:id))
    end
  end

  def start(%Run{} = run) do
    run |> Run.start()
  end

  def finish(%Run{} = run) do
    run |> Run.finish()
  end

  def blocks_for_run(%Run{config: nil}), do: []
  def blocks_for_run(%Run{config: %{"blocks" => nil}}), do: []

  def blocks_for_run(%Run{config: %{"blocks" => blocks, "connections" => connections} = config}) do
    blocks_map = blocks |> Enum.into(%{}, fn block -> {block["name"], block} end)

    blocks
    |> Enum.filter(&(Buildel.Blocks.type(&1["type"]) != nil))
    |> Enum.map(fn block ->
      block_connections =
        connections
        |> Enum.filter(&(&1["to"]["block_name"] == block["name"]))
        |> Enum.map(fn connection ->
          from_block = blocks_map[connection["from"]["block_name"]]
          from_block_module = Buildel.Blocks.type(from_block["type"])
          to_block = block
          to_block_module = Buildel.Blocks.type(to_block["type"])

          %Buildel.Blocks.Connection{
            from: %Buildel.Blocks.Output{
              block_name: connection["from"]["block_name"],
              name: connection["from"]["output_name"],
              type: from_block_module.get_output(connection["from"]["output_name"]).type
            },
            to: %Buildel.Blocks.Input{
              block_name: connection["to"]["block_name"],
              name: connection["to"]["input_name"],
              type: to_block_module.get_input(connection["to"]["input_name"]).type
            },
            opts: %{
              reset: connection["opts"]["reset"]
            }
          }
        end)

      %Buildel.Blocks.Block{
        name: block["name"],
        type: block["type"] |> Buildel.Blocks.type(),
        connections: block_connections,
        opts:
          block["opts"]
          |> keys_to_atoms()
          |> Map.put(:metadata, config["metadata"] || %{})
      }
    end)
  end

  def blocks_for_run(%Run{config: %{"blocks" => blocks}} = run) do
    blocks_map = blocks |> Enum.into(%{}, fn block -> {block["name"], block} end)

    blocks
    |> Enum.filter(fn block -> Buildel.Blocks.type(block["type"]) != nil end)
    |> Enum.map(fn block ->
      connections = Buildel.Blocks.Connection.connections_for_block(block["name"], blocks_map)

      %Buildel.Blocks.Block{
        name: block["name"],
        type: block["type"] |> Buildel.Blocks.type(),
        connections: connections,
        opts:
          block["opts"]
          |> keys_to_atoms()
          |> Map.put(:metadata, get_in(run.config, ["metadata"]) || %{})
      }
    end)
  end

  def create_block(%Pipeline{} = pipeline, block_config) do
    config = pipeline.config

    new_config =
      update_in(
        config["blocks"],
        &(&1 ++
            [
              %{
                "name" => block_config.name,
                "type" => block_config.type,
                "opts" => block_config.opts
              }
            ])
      )

    pipeline = Ecto.Changeset.change(pipeline, config: new_config)

    Repo.update(pipeline)
  end

  def create_run_cost(%Run{} = run, %Cost{} = cost, attrs \\ %{}) do
    case %RunCost{}
         |> RunCost.changeset(attrs |> Map.put(:run_id, run.id) |> Map.put(:cost_id, cost.id))
         |> Repo.insert() do
      {:ok, struct} -> {:ok, struct}
      {:error, changeset} -> {:error, changeset}
    end
  end

  def get_pipeline_aliases(%Pipeline{} = pipeline) do
    aliases =
      from(a in Alias, where: a.pipeline_id == ^pipeline.id, order_by: [desc: a.inserted_at])
      |> Repo.all()

    {:ok, [Alias.latest_pipeline_config(pipeline) | aliases]}
  end

  def create_alias(alias_config) do
    case %Alias{}
         |> Alias.changeset(alias_config)
         |> Repo.insert() do
      {:ok, struct} -> {:ok, struct}
      {:error, changeset} -> {:error, changeset}
    end
  end

  def update_alias(%Alias{} = alias, alias_config) do
    alias
    |> Alias.changeset(alias_config)
    |> Repo.update()
  end

  def delete_alias(%Alias{} = alias) do
    Repo.delete(alias)
  end

  defp keys_to_atoms(string_key_map) when is_map(string_key_map) do
    for {key, val} <- string_key_map,
        into: %{},
        do: {String.to_atom(key), keys_to_atoms(val)}
  end

  defp keys_to_atoms(string_key_list) when is_list(string_key_list) do
    string_key_list
    |> Enum.map(&keys_to_atoms/1)
  end

  defp keys_to_atoms(value), do: value
end
