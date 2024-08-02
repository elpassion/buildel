defmodule Buildel.Datasets do
  import Ecto.Query, warn: false
  alias Buildel.Datasets.DatasetRow
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

  def create_organization_dataset(%Organization{} = organization, %{file_id: _} = attrs) do
    with {:ok, dataset_file} <- Buildel.Datasets.DatasetFile.get(attrs.file_id) do
      case create_dataset(Map.put(attrs, :organization_id, organization.id)) do
        {:ok, dataset} ->
          time = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)

          rows =
            dataset_file.rows
            |> Enum.map(fn row ->
              row
              |> Map.put(:dataset_id, dataset.id)
              |> Map.put(:inserted_at, time)
              |> Map.put(:updated_at, time)
            end)

          {_inserted_records, nil} = Buildel.Repo.insert_all(DatasetRow, rows)

          {:ok, dataset}

        e ->
          e
      end
    end
  end

  def create_organization_dataset(%Organization{} = organization, attrs) do
    create_dataset(Map.put(attrs, :organization_id, organization.id))
  end
end
