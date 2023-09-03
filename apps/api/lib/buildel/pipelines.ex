defmodule Buildel.Pipelines do
  import Ecto.Query, warn: false
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

  alias Buildel.Pipelines.Run

  def list_runs do
    Repo.all(Run) |> Repo.preload(:pipeline)
  end

  def list_pipeline_runs(%Pipeline{} = pipeline) do
    from(r in Run, where: r.pipeline_id == ^pipeline.id, order_by: [desc: r.id])
    |> Repo.all()
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

  def change_run(%Run{} = run, attrs \\ %{}) do
    Run.changeset(run, attrs)
  end

  def start(%Run{} = run) do
    run |> Run.start()
  end

  def finish(%Run{} = run) do
    run |> Run.finish()
  end

  def blocks_for_run(%Run{} = run) do
    case get_in(run.pipeline.config, ["blocks"]) do
      nil ->
        []

      blocks ->
        blocks
        |> Enum.map(fn block ->
          %Buildel.Blocks.Block{
            name: block["name"],
            type: block["type"],
            opts: block["opts"] |> keys_to_atoms() |> Map.put(:inputs, block["inputs"])
          }
        end)
    end
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
