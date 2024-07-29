defmodule Buildel.DatasetsFixtures do
  import Buildel.OrganizationsFixtures
  require Ecto.Query

  def dataset_fixture(attrs \\ %{}) do
    {:ok, dataset} =
      attrs
      |> Enum.into(%{
        name: "some name",
        organization_id: organization_fixture().id
      })
      |> Buildel.Datasets.create_dataset()

    dataset
  end
end
