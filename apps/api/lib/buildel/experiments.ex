defmodule Buildel.Experiments do
  import Ecto.Query, warn: false
  alias Buildel.Experiments.Experiment
  alias Buildel.Organizations.Organization
  alias Buildel.Repo

  def list_experiments do
    Repo.all(Experiment)
  end

  def get_experiment!(id), do: Repo.get!(Experiment, id)
  def get_experiment(id), do: Repo.get(Experiment, id)

  def create_experiment(attrs \\ %{}) do
    %Experiment{}
    |> Experiment.changeset(attrs)
    |> Repo.insert()
  end

  def update_experiment(%Experiment{} = experiment, attrs) do
    experiment
    |> Experiment.changeset(attrs)
    |> Repo.update()
  end

  def delete_experiment(%Experiment{} = experiment) do
    Repo.delete(experiment)
  end

  def list_organization_experiments(%Organization{} = organization) do
    from(d in Experiment,
      where: d.organization_id == ^organization.id,
      order_by: [desc: d.inserted_at]
    )
    |> Repo.all()
  end

  def get_organization_experiment(%Organization{} = organization, experiment_id) do
    case from(d in Experiment,
           where: d.organization_id == ^organization.id and d.id == ^experiment_id
         )
         |> Repo.one() do
      nil -> {:error, :not_found}
      experiment -> {:ok, experiment |> Repo.preload(:pipeline)}
    end
  end
end
