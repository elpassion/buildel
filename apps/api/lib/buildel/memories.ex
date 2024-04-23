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
    metadata = Buildel.FileLoader.file_properties(file)

    {:ok, api_key} =
      Organizations.get_organization_secret(organization, collection.embeddings_secret_name)

    organization_collection_name = organization_collection_name(organization, collection)

    workflow =
      Buildel.DocumentWorkflow.new(%{
        embeddings:
          Buildel.Clients.Embeddings.new(%{
            api_type: collection.embeddings_api_type,
            model: collection.embeddings_model,
            api_key: api_key.value
          }),
        collection_name: organization_collection_name,
        db_adapter: Buildel.VectorDB.EctoAdapter,
        workflow_config: %{
          chunk_size: collection.chunk_size,
          chunk_overlap: collection.chunk_overlap
        }
      })

    document =
      Buildel.DocumentWorkflow.read(
        workflow,
        {file.path, %{type: metadata.file_type}}
      )

    with chunks when is_list(chunks) <-
           Buildel.DocumentWorkflow.build_node_chunks(workflow, document),
         chunks when is_list(chunks) <-
           Buildel.DocumentWorkflow.generate_embeddings_for_chunks(workflow, chunks),
         {:ok, memory} <-
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
      chunks =
        put_in(
          chunks,
          [Access.all(), Access.key!(:metadata), :memory_id],
          memory.id
        )
        |> put_in([Access.all(), Access.key!(:metadata), :file_name], metadata.file_name)

      Buildel.DocumentWorkflow.put_in_database(workflow, chunks)

      {:ok, memory}
    else
      {:error, :invalid_api_key} ->
        {:error, :bad_request, "Invalid API key provided for embeddings model"}

      {:error, :insufficient_quota} ->
        {:error, :bad_request, "Insufficient quota for embeddings model"}

      err ->
        err
    end
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

  def search_organization_collection(organization, collection, search_query, metadata) do
    {:ok, api_key} =
      Organizations.get_organization_secret(organization, collection.embeddings_secret_name)

    organization_collection_name = organization_collection_name(organization, collection)

    workflow =
      Buildel.DocumentWorkflow.new(%{
        embeddings:
          Buildel.Clients.Embeddings.new(%{
            api_type: collection.embeddings_api_type,
            model: collection.embeddings_model,
            api_key: api_key.value
          }),
        collection_name: organization_collection_name,
        db_adapter: Buildel.VectorDB.EctoAdapter,
        workflow_config: %{
          chunk_size: collection.chunk_size,
          chunk_overlap: collection.chunk_overlap
        }
      })

    vector_db =
      Buildel.VectorDB.new(%{
        adapter: workflow.db_adapter,
        embeddings: workflow.embeddings
      })

    Buildel.VectorDB.query(
      vector_db,
      organization_collection_name,
      search_query,
      %{},
      %{
        limit: metadata.limit,
        similarity_threshhold: 0
      }
    )
  end

  def upsert_collection(
        %{
          organization_id: organization_id,
          collection_name: collection_name,
          embeddings: embeddings
        } = collection_data
      ) do
    chunk_size = Map.get(collection_data, :chunk_size, nil)
    chunk_overlap = Map.get(collection_data, :chunk_overlap, nil)

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
          embeddings_secret_name: embeddings.secret_name,
          chunk_size: chunk_size || 1000,
          chunk_overlap: chunk_overlap || 0
        })
        |> Buildel.Repo.insert()

      collection ->
        collection
        |> Buildel.Memories.MemoryCollection.changeset(%{
          collection_name: collection_name,
          organization_id: organization_id,
          embeddings_api_type: embeddings.api_type,
          embeddings_model: embeddings.model,
          embeddings_secret_name: embeddings.secret_name,
          chunk_size: collection.chunk_size,
          chunk_overlap: collection.chunk_overlap
        })
        |> Buildel.Repo.update()
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
