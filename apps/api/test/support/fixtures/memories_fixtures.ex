defmodule Buildel.MemoriesFixtures do
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

  def collection_fixture(organization_id, attrs \\ %{}) do
    collection_name =
      attrs
      |> Map.get(:collection_name, "collection")

    {:ok, collection} =
      Buildel.Memories.upsert_collection(%{
        organization_id: organization_id,
        collection_name: collection_name
      })

    collection
  end
end
