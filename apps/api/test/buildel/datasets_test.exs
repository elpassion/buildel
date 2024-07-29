defmodule Buildel.DatasetsTest do
  use Buildel.DataCase, async: true
  import Buildel.OrganizationsFixtures

  alias Buildel.Datasets

  describe "datasets" do
    alias Buildel.Datasets.Dataset

    import Buildel.DatasetsFixtures

    @invalid_attrs %{name: nil}

    test "list_datasets/0 returns all datasets" do
      dataset = dataset_fixture()
      assert Datasets.list_datasets() == [dataset]
    end

    test "get_dataset!/1 returns the dataset with given id" do
      dataset = dataset_fixture()
      assert Datasets.get_dataset!(dataset.id) == dataset
    end

    test "create_dataset/1 with valid data creates a dataset" do
      valid_attrs = %{name: "some name", organization_id: organization_fixture().id}

      assert {:ok, %Dataset{} = dataset} = Datasets.create_dataset(valid_attrs)
      assert dataset.name == "some name"
    end

    test "create_dataset/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Datasets.create_dataset(@invalid_attrs)
    end

    test "update_dataset/2 with valid data updates the dataset" do
      dataset = dataset_fixture()
      update_attrs = %{name: "some updated name"}

      assert {:ok, %Dataset{} = dataset} = Datasets.update_dataset(dataset, update_attrs)
      assert dataset.name == "some updated name"
    end

    test "update_dataset/2 with invalid data returns error changeset" do
      dataset = dataset_fixture()
      assert {:error, %Ecto.Changeset{}} = Datasets.update_dataset(dataset, @invalid_attrs)
      assert dataset == Datasets.get_dataset!(dataset.id)
    end

    test "delete_dataset/1 deletes the dataset" do
      dataset = dataset_fixture()
      assert {:ok, %Dataset{}} = Datasets.delete_dataset(dataset)
      assert_raise Ecto.NoResultsError, fn -> Datasets.get_dataset!(dataset.id) end
    end

    test "list_organization_datasets/1 returns all datasets for given organization" do
      organization = organization_fixture()
      dataset = dataset_fixture(organization_id: organization.id)
      _another_dataset = dataset_fixture()
      assert Datasets.list_organization_datasets(organization) == [dataset]
    end
  end
end
