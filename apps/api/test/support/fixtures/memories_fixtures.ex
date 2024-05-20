defmodule Buildel.MemoriesFixtures do
  import Buildel.OrganizationsFixtures
  import Buildel.SecretsFixtures

  def memory_fixture(organization_id, collection_name, attrs \\ %{}) do
    file_params =
      attrs
      |> Enum.into(%{
        path: "test/support/fixtures/example.txt",
        type: "txt",
        name: "example.txt"
      })

    organization = Buildel.Organizations.get_organization!(organization_id)

    collection =
      collection_fixture(%{organization_id: organization_id, collection_name: collection_name})

    {:ok, memory} =
      Buildel.Memories.create_organization_memory(organization, collection, file_params)

    memory
  end

  def collection_fixture(attrs \\ %{}) do
    organization =
      case attrs[:organization_id] do
        nil -> organization_fixture()
        _ -> Buildel.Organizations.get_organization!(attrs[:organization_id])
      end

    api_key =
      case Buildel.Organizations.get_organization_secret(organization, "some name") do
        {:ok, secret} -> secret
        _ -> secret_fixture(%{organization_id: organization.id})
      end

    params =
      attrs
      |> Enum.into(%{
        organization_id: organization.id,
        collection_name: "collection",
        embeddings: %{
          secret_name: api_key.name,
          api_type: "test",
          model: "text-embedding-ada-002",
          endpoint: "test"
        }
      })

    {:ok, collection} = Buildel.Memories.upsert_collection(params)

    collection
  end
end
