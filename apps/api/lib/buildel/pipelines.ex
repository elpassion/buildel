defmodule Buildel.Pipelines do
  import Ecto.Query, warn: false
  alias Buildel.Pipelines.Alias
  alias Buildel.Costs.Cost
  alias Buildel.Pipelines.RunCost
  alias Buildel.Repo

  alias Buildel.Pipelines.Pipeline
  alias Buildel.Organizations.Organization

  defmodule ListParams do
    defstruct [:page, :per_page, :favorites]

    def from_map(params) do
      %__MODULE__{}
      |> struct(%{
        page:
          Map.get(params, "page", nil)
          |> then(fn
            nil -> nil
            page -> String.to_integer(page)
          end),
        per_page:
          Map.get(params, "per_page", nil)
          |> then(fn
            nil -> nil
            per_page -> String.to_integer(per_page)
          end),
        favorites: Map.get(params, "favorites", nil) == "true"
      })
    end
  end

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

  def toggle_pipeline_favorite(%Pipeline{} = pipeline) do
    from(p in Pipeline,
      where: p.id == ^pipeline.id,
      update: [set: [favorite: fragment("NOT favorite")]]
    )
    |> Repo.update_all([])
    |> case do
      {1, _} -> {:ok, pipeline |> Map.update!(:favorite, &(!&1))}
      _ -> {:error, :not_found}
    end
  end

  def delete_pipeline(%Pipeline{} = pipeline) do
    Repo.delete(pipeline, allow_stale: true)
  end

  def list_organization_pipelines(%Organization{} = organization) do
    from(p in Pipeline, where: p.organization_id == ^organization.id, order_by: [desc: p.id])
    |> Repo.all()
  end

  def list_organization_pipelines(
        %Organization{} = organization,
        %ListParams{} = params
      ) do
    query =
      from(p in Pipeline, where: p.organization_id == ^organization.id, order_by: [desc: p.id])
      |> then(fn q ->
        case params.favorites do
          true -> q |> where([p], p.favorite == true)
          _ -> q
        end
      end)

    items =
      case params do
        %{page: nil, per_page: nil} ->
          query |> Repo.all()

        %{page: page, per_page: per_page} ->
          offset = page * per_page
          query |> limit(^per_page) |> offset(^offset) |> Repo.all()
      end

    count = query |> Repo.aggregate(:count, :id)

    {:ok, items, count}
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

    case pipeline.budget_limit do
      nil ->
        {:ok, total_cost}

      _ ->
        case Decimal.compare(total_cost || 0, Decimal.new(pipeline.budget_limit)) do
          :lt -> {:ok, total_cost}
          _ -> {:error, :budget_limit_exceeded}
        end
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
    case from(r in Run,
           where: r.pipeline_id == ^pipeline.id,
           join: rc in RunCost,
           on: rc.run_id == r.id,
           join: c in Cost,
           on: c.id == rc.cost_id,
           where: c.inserted_at >= ^start_date and c.inserted_at <= ^end_date,
           group_by: r.pipeline_id,
           select: %{total_cost: sum(c.amount)}
         )
         |> Repo.one() do
      nil -> %{total_cost: Decimal.new(0)}
      %{total_cost: total_cost} -> %{total_cost: total_cost}
    end
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
    workflow_calls_blocks_map =
      blocks
      |> Enum.filter(fn block -> block["type"] == Buildel.Blocks.WorkflowCall.options().type end)
      |> Enum.reduce(%{}, fn block, acc ->
        pipeline = get_pipeline(block["opts"]["workflow"])

        blocks_map =
          pipeline.config["blocks"] |> Enum.into(%{}, fn block -> {block["name"], block} end)

        Map.put(acc, block["name"], blocks_map)
      end)

    blocks_map = blocks |> Enum.into(%{}, fn block -> {block["name"], block} end)

    block_connections =
      connections
      |> Enum.reduce(%{}, fn connection, acc ->
        dynamic_connection =
          case [connection["from"]["output_name"], connection["to"]["input_name"]]
               |> Enum.map(&String.split(&1, ":")) do
            [output, _input] when length(output) > 1 -> :from
            [_output, input] when length(input) > 1 -> :to
            _ -> :none
          end

        {from_block, output_name, full_output_name} =
          case dynamic_connection do
            :from ->
              [block_name, output_name] = connection["from"]["output_name"] |> String.split(":")

              from_block =
                blocks_map[connection["from"]["block_name"]]
                |> Map.put(
                  "type",
                  workflow_calls_blocks_map[connection["from"]["block_name"]][
                    block_name
                  ]["type"]
                )

              {from_block, output_name, connection["from"]["output_name"]}

            _ ->
              {blocks_map[connection["from"]["block_name"]], connection["from"]["output_name"],
               connection["from"]["output_name"]}
          end

        from_block_module = Buildel.Blocks.type(from_block["type"])

        {to_block, input_name, full_input_name} =
          case dynamic_connection do
            :to ->
              [block_name, input_name] =
                connection["to"]["input_name"] |> String.split(":")

              to_block =
                blocks_map[connection["to"]["block_name"]]
                |> Map.put(
                  "type",
                  workflow_calls_blocks_map[connection["to"]["block_name"]][
                    block_name
                  ]["type"]
                )

              # {to_block, input_name}
              {to_block, input_name, connection["to"]["input_name"]}

            _ ->
              {blocks_map[connection["to"]["block_name"]], connection["to"]["input_name"],
               connection["to"]["input_name"]}
          end

        to_block_module = Buildel.Blocks.type(to_block["type"])

        {:ok, %{type: output_type}} = from_block_module.get_output(output_name)

        {:ok, %{type: input_type}} =
          to_block_module.get_input(input_name)

        connection = %Buildel.Blocks.Connection{
          from: %Buildel.Blocks.Output{
            block_name: from_block["name"],
            name: full_output_name,
            type: output_type
          },
          to: %Buildel.Blocks.Input{
            block_name: to_block["name"],
            name: full_input_name,
            type: input_type
          },
          opts: %{
            reset: connection["opts"]["reset"],
            optional: connection["opts"]["optional"]
          }
        }

        acc =
          acc
          |> Map.update(to_block["name"], [connection], fn block_connections ->
            [connection | block_connections]
          end)

        case output_type do
          "worker" ->
            reversed_connection = %Buildel.Blocks.Connection{
              from: connection.to,
              to: connection.from,
              opts: connection.opts
            }

            Map.update(acc, from_block["name"], [reversed_connection], fn block_connections ->
              [reversed_connection | block_connections]
            end)

          _ ->
            acc
        end
      end)

    blocks
    |> Enum.filter(&(Buildel.Blocks.type(&1["type"]) != nil))
    |> Enum.map(fn block ->
      %Buildel.Blocks.Block{
        name: block["name"],
        type: block["type"] |> Buildel.Blocks.type(),
        connections: block_connections[block["name"]] || [],
        opts:
          block["opts"]
          |> keys_to_atoms()
          |> flatten_map()
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
    with config <- pipeline.config,
         {:ok, _} <- block_valid?(config, block_config) do
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
  end

  defp flatten_map(map), do: flatten_map(map, %{})

  defp flatten_map(%{} = map, acc) do
    map
    |> Enum.reduce(acc, fn {key, value}, acc ->
      case value do
        %{} -> flatten_map(value, acc)
        _ -> Map.put(acc, key, value)
      end
    end)
  end

  defp flatten_map(_value, acc), do: acc

  defp block_valid?(config, block_config) do
    cond do
      config["blocks"] |> Enum.any?(&(&1["name"] == block_config.name)) ->
        {:error, :block_with_specified_name_already_exists}

      true ->
        {:ok, true}
    end
  end

  def create_connection(%Pipeline{} = pipeline, from, to) do
    with blocks <- pipeline.config["blocks"],
         blocks_map <- blocks |> Enum.into(%{}, fn block -> {block["name"], block} end),
         from_block <- blocks_map[from["block_name"]],
         from_block_module when not is_nil(from_block_module) <-
           Buildel.Blocks.type(from_block["type"]),
         to_block <- blocks_map[to["block_name"]],
         to_block_module when not is_nil(to_block_module) <-
           Buildel.Blocks.type(to_block["type"]),
         {:ok, %{type: output_type}} <- from_block_module.get_output(from["output_name"]),
         {:ok, %{type: input_type}} <-
           to_block_module.get_input(to["input_name"]),
         connection <- %Buildel.Blocks.Connection{
           from: %Buildel.Blocks.Output{
             block_name: from_block["name"],
             name: from["output_name"],
             type: output_type
           },
           to: %Buildel.Blocks.Input{
             block_name: to_block["name"],
             name: to["input_name"],
             type: input_type
           },
           opts: %{
             reset: true,
             optional: false
           }
         },
         {:ok, true} <- connection_valid?(pipeline.config, connection) do
      new_config =
        pipeline.config
        |> Map.update("connections", [], fn connections ->
          connections ++
            [
              %{
                "from" => %{
                  "block_name" => connection.from.block_name,
                  "output_name" => connection.from.name
                },
                "opts" => %{"reset" => connection.opts.reset, "optional" => connection.opts.optional},
                "to" => %{
                  "block_name" => connection.to.block_name,
                  "input_name" => connection.to.name
                }
              }
            ]
        end)

      pipeline = Ecto.Changeset.change(pipeline, config: new_config)

      Repo.update(pipeline)
    else
      nil ->
        {:error, "Could not find block with specified name"}

      e ->
        e
    end
  end

  def get_pipeline_run_logs(run) do
    from(l in Buildel.Pipelines.Log, where: l.run_id == ^run.id, order_by: [asc: l.inserted_at])
    |> Repo.all()
    |> Repo.preload(run: :pipeline)
  end

  defp connection_valid?(config, %Buildel.Blocks.Connection{} = connection) do
    cond do
      connection_already_exists?(config, connection) ->
        {:error, :connection_already_exists}

      connection.from.type == "worker" && connection.to.type == "controller" ->
        {:ok, true}

      (connection.from.type == "worker" && connection.to.type == "worker") ||
          connection.from.type == "controller" ->
        {:error, :tool_connection_has_to_be_from_worker_to_controller}

      connection.from.type == connection.to.type ->
        {:ok, true}

      true ->
        {:error, :connection_types_do_not_match}
    end
  end

  defp connection_already_exists?(config, %Buildel.Blocks.Connection{} = connection) do
    Enum.any?(config["connections"], fn existing_connection ->
      existing_connection["from"]["block_name"] == connection.from.block_name &&
        existing_connection["to"]["block_name"] == connection.to.block_name &&
        existing_connection["from"]["output_name"] == connection.from.name &&
        existing_connection["to"]["input_name"] == connection.to.name
    end)
  end

  def remove_connection(%Pipeline{} = pipeline, from, to) do
    new_config =
      pipeline.config
      |> Map.update("connections", [], fn connections ->
        connections
        |> Enum.reject(fn connection ->
          from["block_name"] == connection["from"]["block_name"] &&
            from["output_name"] == connection["from"]["name"] &&
            to["block_name"] == connection["to"]["block_name"] &&
            to["output_name"] == connection["to"]["name"]
        end)
      end)

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
