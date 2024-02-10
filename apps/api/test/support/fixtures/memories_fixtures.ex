defmodule Buildel.MemoriesFixtures do
  import Buildel.OrganizationsFixtures

  def memory_fixture(organization_id, collection_name, attrs \\ %{}) do
    file_params =
      attrs
      |> Enum.into(%{
        path: "test/support/fixtures/example.txt",
        type: "txt",
        name: "example.txt"
      })

    {:ok, memory} =
      Buildel.Memories.create_organization_memory(organization_id, collection_name, file_params)

    memory
  end

  def collection_fixture(attrs \\ %{}) do
    params =
      attrs
      |> Enum.into(%{
        organization_id: organization_fixture().id,
        collection_name: "collection"
      })

    {:ok, collection} = Buildel.Memories.upsert_collection(params)

    collection
  end
end
