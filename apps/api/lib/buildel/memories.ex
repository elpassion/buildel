defmodule Buildel.Memories do
  alias Buildel.Organizations.Organization
  alias Buildel.Memories.Memory
  alias Buildel.Organizations
  import Ecto.Query

  def list_organization_collection_memories(
        %Buildel.Organizations.Organization{} = organization,
        %Buildel.Memories.MemoryCollection{} = collection
      ) do
    Buildel.Memories.Memory
    |> where(
      [m],
      m.collection_name == ^collection.collection_name and m.organization_id == ^organization.id
    )
    |> Buildel.Repo.all()
  end

  def list_organization_collections(
        %Buildel.Organizations.Organization{} = organization,
        params
      ) do
    Buildel.Memories.MemoryCollection
    |> where(
      [m],
      m.organization_id == ^organization.id
    )
    |> where([m], ^collection_filters(params))
    |> Buildel.Repo.all()
  end

  defp collection_filters(params) do
    filterable_fields = [:collection_name]

    Enum.reduce(params, [], fn {key, _value} = field, acc ->
      if Enum.member?(filterable_fields, key), do: acc ++ [field], else: acc
    end)
  end

  def get_organization_collection(
        %Buildel.Organizations.Organization{} = organization,
        collection_id
      ) do
    case Buildel.Memories.MemoryCollection
         |> where(
           [c],
           c.id == ^collection_id and c.organization_id == ^organization.id
         )
         |> Buildel.Repo.one() do
      nil ->
        {:error, :not_found}

      collection ->
        {:ok, collection}
    end
  end

  def create_organization_memory(
        %Buildel.Organizations.Organization{} = organization,
        %Buildel.Memories.MemoryCollection{} = collection,
        file
      ) do
    %{file_name: file_name, file_size: file_size, file_type: file_type} =
      Buildel.FileLoader.file_properties(file)

    metadata = %{file_name: file_name, file_size: file_size, file_type: file_type}

    with {:ok, memory} <-
           %Buildel.Memories.Memory{}
           |> Buildel.Memories.Memory.changeset(
             metadata
             |> Map.merge(%{
               organization_id: organization.id,
               collection_name: collection.collection_name,
               memory_collection_id: collection.id,
               content: "content"
             })
           )
           |> Buildel.Repo.insert() do
      {:ok, memory}
    end

    # {:ok, file} = Buildel.FileLoader.load_file(file.path, %{type: file_type})

    # metadata = %{file_name: file_name, file_size: file_size, file_type: file_type}

    # with organization <- Organizations.get_organization!(organization.id),
    #      organization_collection_name <- organization_collection_name(organization, collection),
    #      {:ok, memory} <-
    #        %Buildel.Memories.Memory{}
    #        |> Buildel.Memories.Memory.changeset(
    #          metadata
    #          |> Map.merge(%{
    #            organization_id: organization.id,
    #            collection_name: collection.collection_name,
    #            memory_collection_id: collection.id,
    #            content: file
    #          })
    #        )
    #        |> Buildel.Repo.insert(),
    #      {:ok, api_key} <-
    #        Organizations.get_organization_secret(organization, collection.embeddings_secret_name),
    #      vector_db <-
    #        Buildel.VectorDB.new(%{
    #          adapter: Buildel.VectorDB.EctoAdapter,
    #          embeddings:
    #            Buildel.Clients.Embeddings.new(%{
    #              api_type: collection.embeddings_api_type,
    #              model: collection.embeddings_model,
    #              api_key: api_key.value
    #            })
    #        }),
    #      {:ok, _} <- Buildel.VectorDB.init(vector_db, organization_collection_name),
    #      {:ok, _} <- Buildel.SearchDB.init(organization_collection_name),
    #      {time, documents} <-
    #        :timer.tc(fn ->
    #          Buildel.Splitters.recursive_character_text_split(file, %{
    #            chunk_size: 1000,
    #            chunk_overlap: 250
    #          })
    #        end),
    #      documents <-
    #        documents
    #        |> Enum.map(fn document ->
    #          %{
    #            document: document,
    #            metadata:
    #              metadata |> Map.put(:memory_id, memory.id) |> Map.put(:chunk_id, UUID.uuid4())
    #          }
    #        end),
    #      {:ok, _} <-
    #        Buildel.VectorDB.add(vector_db, organization_collection_name, documents),
    #      {:ok, _} <-
    #        Buildel.SearchDB.add(organization_collection_name, documents) do
    #   :telemetry.execute(
    #     [:buildel, :recursive_splitter, :split],
    #     %{duration: time * 1000}
    #   )

    #   {:ok, memory}
    # end
  end

  def delete_organization_memory(
        %Buildel.Organizations.Organization{} = organization,
        id
      ) do
    memory = get_organization_memory!(organization, id)

    collection_name = organization_collection_name(organization, memory.memory_collection)

    with vector_db <-
           Buildel.VectorDB.new(%{
             adapter: Buildel.VectorDB.EctoAdapter,
             embeddings:
               Buildel.Clients.Embeddings.new(%{
                 api_type: memory.memory_collection.embeddings_api_type,
                 model: memory.memory_collection.embeddings_model,
                 api_key: memory.memory_collection.embeddings_secret_name
               })
           }),
         :ok <-
           Buildel.VectorDB.delete_all_with_metadata(vector_db, collection_name, %{
             memory_id: memory.id
           }),
         :ok <-
           Buildel.SearchDB.delete_all_with_metadata(collection_name, %{memory_id: memory.id}),
         {:ok, _} <- Buildel.Repo.delete(memory) do
      {:ok, memory}
    end
  end

  def delete_organization_memory_collection(
        %Buildel.Organizations.Organization{} = organization,
        id
      ) do
    with {:ok, collection} <- get_organization_collection(organization, id) do
      memories = collection |> Buildel.Repo.preload(:memories) |> Map.get(:memories)
      memories |> Enum.map(&delete_organization_memory(organization, &1.id))

      Buildel.Repo.delete(collection)

      :ok
    end
  end

  def upsert_collection(%{
        organization_id: organization_id,
        collection_name: collection_name,
        embeddings: embeddings
      }) do
    Buildel.Memories.MemoryCollection
    |> where([c], c.collection_name == ^collection_name and c.organization_id == ^organization_id)
    |> Buildel.Repo.one()
    |> case do
      nil ->
        %Buildel.Memories.MemoryCollection{}
        |> Buildel.Memories.MemoryCollection.changeset(%{
          collection_name: collection_name,
          organization_id: organization_id,
          embeddings_api_type: embeddings.api_type,
          embeddings_model: embeddings.model,
          embeddings_secret_name: embeddings.secret_name
        })
        |> Buildel.Repo.insert()

      collection ->
        {:ok, collection}
    end
  end

  def get_memory!(id) do
    Buildel.Repo.get!(Buildel.Memories.Memory, id)
  end

  def get_organization_memory!(
        %Buildel.Organizations.Organization{} = organization,
        id
      ) do
    Buildel.Memories.Memory
    |> where([m], m.id == ^id and m.organization_id == ^organization.id)
    |> Buildel.Repo.one!()
    |> Buildel.Repo.preload(:memory_collection)
  end

  def get_collection_memory!(
        %Buildel.Organizations.Organization{} = organization,
        collection_id,
        id
      ) do
    Buildel.Memories.Memory
    |> where(
      [m],
      m.id == ^id and m.memory_collection_id == ^collection_id and
        m.organization_id == ^organization.id
    )
    |> Buildel.Repo.one!()
  end

  def list_organization_memory_chunks(
        %Organization{id: organization_id},
        %Memory{memory_collection_id: memory_collection_id, id: memory_id},
        _params \\ %{}
      ) do
    vector_db =
      Buildel.VectorDB.new(%{
        adapter: Buildel.VectorDB.EctoAdapter,
        embeddings:
          Buildel.Clients.Embeddings.new(%{
            api_type: "",
            model: "",
            api_key: ""
          })
      })

    Buildel.VectorDB.get_all(
      vector_db,
      "#{organization_id}_#{memory_collection_id}",
      %{memory_id: memory_id},
      %{}
    )
  end

  def organization_collection_name(
        %Buildel.Organizations.Organization{} = organization,
        %Buildel.Memories.MemoryCollection{} = collection
      ) do
    "#{organization.id}_#{collection.id}"
  end
end
