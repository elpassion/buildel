defmodule Buildel.Datasets do
  import Ecto.Query, warn: false
  alias Buildel.Organizations.Organization
  alias Buildel.Datasets.Dataset
  alias Buildel.Repo

  def list_datasets do
    Repo.all(Dataset)
  end

  def get_dataset!(id), do: Repo.get!(Dataset, id)
  def get_dataset(id), do: Repo.get(Dataset, id)

  def create_dataset(attrs \\ %{}) do
    %Dataset{}
    |> Dataset.changeset(attrs)
    |> Repo.insert()
  end

  def update_dataset(%Dataset{} = dataset, attrs) do
    dataset
    |> Dataset.changeset(attrs)
    |> Repo.update()
  end

  def delete_dataset(%Dataset{} = dataset) do
    Repo.delete(dataset)
  end

  def list_organization_datasets(%Organization{} = organization) do
    from(d in Dataset,
      where: d.organization_id == ^organization.id,
      order_by: [desc: d.inserted_at]
    )
    |> Repo.all()
  end

  def get_organization_dataset(%Organization{} = organization, dataset_id) do
    case from(d in Dataset, where: d.organization_id == ^organization.id and d.id == ^dataset_id)
         |> Repo.one() do
      nil -> {:error, :not_found}
      dataset -> {:ok, dataset}
    end
  end
end
