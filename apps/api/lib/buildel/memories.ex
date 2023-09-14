defmodule Buildel.Memories do
  import Ecto.Query

  def list_organization_collection_memories(
        %Buildel.Organizations.Organization{} = organization,
        collection_name
      ) do
    collection_name = organization_collection_name(organization, collection_name)

    Buildel.Memories.Memory
    |> where(
      [m],
      m.collection_name == ^collection_name and m.organization_id == ^organization.id
    )
    |> Buildel.Repo.all()
  end

  def create_organization_memory(
        %Buildel.Organizations.Organization{} = organization,
        collection_name,
        file_path
      ) do
    file_name = Path.basename(file_path)
    file_size = File.stat!(file_path).size
    file_type = MIME.from_path(file_path)
    file = File.read!(file_path)

    metadata = %{file_name: file_name, file_size: file_size, file_type: file_type}

    collection_name = organization_collection_name(organization, collection_name)

    with {:ok, memory} <-
           %Buildel.Memories.Memory{}
           |> Buildel.Memories.Memory.changeset(
             metadata
             |> Map.merge(%{organization_id: organization.id, collection_name: collection_name})
           )
           |> Buildel.Repo.insert(),
         {:ok, _} <- Buildel.VectorDB.init(collection_name),
         {:ok, _} <-
           Buildel.VectorDB.add(collection_name, file,
             metadata: metadata,
             api_key: System.get_env("OPENAI_API_KEY", "key")
           ) do
      {:ok, memory}
    end
  end

  defp organization_collection_name(
         %Buildel.Organizations.Organization{} = organization,
         collection_name
       ) do
    "#{organization.id}_#{collection_name}"
  end
end
