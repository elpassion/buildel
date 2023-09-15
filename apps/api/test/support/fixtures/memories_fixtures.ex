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
end
