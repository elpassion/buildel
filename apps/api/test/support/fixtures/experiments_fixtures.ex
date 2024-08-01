defmodule Buildel.ExperimentsFixtures do
  import Buildel.OrganizationsFixtures
  import Buildel.PipelinesFixtures
  import Buildel.DatasetsFixtures
  require Ecto.Query

  def experiment_fixture(attrs \\ %{}) do
    {:ok, experiment} =
      attrs
      |> Enum.into(%{
        name: "some name",
        organization_id: organization_fixture().id,
        pipeline_id: pipeline_fixture().id,
        dataset_id: dataset_fixture().id
      })
      |> Buildel.Experiments.create_experiment()

    experiment
  end
end
