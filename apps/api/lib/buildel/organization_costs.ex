defmodule Buildel.OrganizationCosts do
  import Ecto.Query, warn: false
  alias Buildel.Costs.Cost
  alias Buildel.Memories.MemoryCollectionCost
  alias Buildel.Pipelines.RunCost
  alias Buildel.Repo
  alias Buildel.Organizations.Organization

  defmodule Params do
    @default_params %{
      page: 0,
      per_page: 10
    }

    defstruct [:page, :per_page]

    def from_map(params) do
      %__MODULE__{}
      |> struct(Map.merge(@default_params, params))
    end
  end

  def list_organization_costs(%Organization{} = organization, %Params{} = params) do
    query = build_query(organization.id, params)

    results = fetch_rows(query, params)
    count = count_rows(query)

    {:ok, results, count}
  end

  defp build_query(organization_id, %Params{}) do
    from c in Cost,
      where: c.organization_id == ^organization_id,
      left_join: mc in MemoryCollectionCost,
      on: mc.cost_id == c.id,
      left_join: rc in RunCost,
      on: rc.cost_id == c.id,
      order_by: [desc: c.inserted_at],
      select: %{
        id: c.id,
        amount: c.amount,
        run_id: rc.run_id,
        memory_collection_id: mc.memory_collection_id,
        description: coalesce(mc.description, rc.description),
        type:
          fragment(
            "CASE WHEN ? IS NOT NULL THEN ? WHEN ? IS NOT NULL THEN ? ELSE NULL END",
            mc.id,
            "collection",
            rc.id,
            "pipeline"
          ),
        inserted_at: c.inserted_at,
        input_tokens: c.input_tokens,
        output_tokens: c.output_tokens
      }
  end

  defp fetch_rows(query, %Params{page: page, per_page: per_page}) do
    offset = page * per_page

    query
    |> limit(^per_page)
    |> offset(^offset)
    |> Repo.all()
  end

  defp count_rows(query) do
    query
    |> Repo.aggregate(:count, :id)
  end
end
