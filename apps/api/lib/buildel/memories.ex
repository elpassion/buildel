defmodule Buildel.Memories do
  alias Buildel.Organizations.Organization
  alias Buildel.Memories.MemoryCollectionCost
  alias Buildel.Memories.Memory
  alias Buildel.Organizations
  import Ecto.Query


  defmodule ListParams do
    defstruct [:page, :per_page]

    def from_map(params) do
      %__MODULE__{}
      |> struct(%{
        page:
          Map.get(params, "page", nil)
          |> then(fn
            nil -> nil
            page -> String.to_integer(page)
          end),
        per_page:
          Map.get(params, "per_page", nil)
          |> then(fn
            nil -> nil
            per_page -> String.to_integer(per_page)
          end)
      })
    end
  end

  def create_memory_collection_cost(
        %Buildel.Memories.MemoryCollection{} = collection,
        %Buildel.Costs.Cost{} = cost,
        attrs \\ %{}
      ) do
    case %MemoryCollectionCost{}
         |> MemoryCollectionCost.changeset(
           attrs
           |> Map.put(:memory_collection_id, collection.id)
           |> Map.put(:cost_id, cost.id)
         )
         |> Buildel.Repo.insert() do
      {:ok, struct} -> {:ok, struct}
      {:error, changeset} -> {:error, changeset}
    end
  end

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

  def list_organization_collection_memories(
        %Buildel.Organizations.Organization{} = organization,
        %Buildel.Memories.MemoryCollection{} = collection,
        %ListParams{} = params
      ) do
    query = Buildel.Memories.Memory
            |> where(
                 [m],
                 m.collection_name == ^collection.collection_name and m.organization_id == ^organization.id
               )

    items =
      case params do
        %{page: nil, per_page: nil} ->
          query |> Buildel.Repo.all()

        %{page: page, per_page: per_page} ->
          offset = page * per_page
          query |> limit(^per_page) |> offset(^offset) |> Buildel.Repo.all()
      end

    count = query |> Buildel.Repo.aggregate(:count, :id)

    {:ok, items, count}
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
    |> maybe_add_search_query(params)
    |> Buildel.Repo.all()
  end

  def list_organization_collections(
        %Buildel.Organizations.Organization{} = organization,
        params,
        %ListParams{} = queryParams
      ) do
   query = Buildel.Memories.MemoryCollection
    |> where(
      [m],
      m.organization_id == ^organization.id
    )
    |> where([m], ^collection_filters(params))
    |> maybe_add_search_query(params)

    items =
      case queryParams do
        %{page: nil, per_page: nil} ->
          query |> Buildel.Repo.all()

        %{page: page, per_page: per_page} ->
          offset = page * per_page
          query |> limit(^per_page) |> offset(^offset) |> Buildel.Repo.all()
      end

    count = query |> Buildel.Repo.aggregate(:count, :id)

   {:ok, items, count}
  end

  defp collection_filters(params) do
    filterable_fields = [:collection_name]

    Enum.reduce(params, [], fn {key, _value} = field, acc ->
      if Enum.member?(filterable_fields, key), do: acc ++ [field], else: acc
    end)
  end

  defp maybe_add_search_query(query, %{"search": search_query}) when is_binary(search_query) and search_query != "" do
    query |> where([m], ilike(m.collection_name, ^"%#{search_query}%"))
  end

  defp maybe_add_search_query(query, _params) do
    query
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
        file_id
      )
      when is_binary(file_id) do
    {:ok, api_key} =
      Organizations.get_organization_secret(organization, collection.embeddings_secret_name)

    organization_collection_name = organization_collection_name(organization, collection)

    workflow =
      Buildel.DocumentWorkflow.new(%{
        embeddings:
          Buildel.Clients.Embeddings.new(%{
            api_type: collection.embeddings_api_type,
            model: collection.embeddings_model,
            api_key: api_key.value,
            endpoint: collection.embeddings_endpoint
          }),
        collection_name: organization_collection_name,
        db_adapter: Buildel.VectorDB.EctoAdapter,
        workflow_config: %{
          chunk_size: collection.chunk_size,
          chunk_overlap: collection.chunk_overlap
        }
      })

    with {:ok, file} <- Buildel.Memories.MemoryFile.get(file_id),
         {:ok, memory} <-
           %Buildel.Memories.Memory{}
           |> Buildel.Memories.Memory.changeset(
             Map.merge(file.metadata, %{
               organization_id: organization.id,
               collection_name: collection.collection_name,
               memory_collection_id: collection.id,
               content: file.content
             })
           )
           |> Buildel.Repo.insert() do
      Buildel.Memories.MemoryFile.FileUpload.chunks(file)
      |> Task.async_stream(
        fn chunks ->
          chunks =
            chunks
            |> put_in(
              [Access.all(), Access.key!(:metadata), :memory_id],
              memory.id
            )
            |> put_in([Access.all(), Access.key!(:metadata), :file_name], file.upload.filename)

          Buildel.DocumentWorkflow.put_in_database(workflow, chunks)
        end,
        max_concurrency: 4,
        timeout: 60 * 1000
      )
      |> Stream.run()

      Buildel.MemoriesGraph.generate_and_save_graph(organization, collection, memory)

      {:ok, memory}
    end
  end

  def create_organization_memory(
        %Buildel.Organizations.Organization{} = organization,
        %Buildel.Memories.MemoryCollection{} = collection,
        file,
        metadata \\ %{}
      ) do
    metadata = Map.merge(metadata, Buildel.FileLoader.file_properties(file))

    {:ok, api_key} =
      Organizations.get_organization_secret(organization, collection.embeddings_secret_name)

    organization_collection_name = organization_collection_name(organization, collection)

    workflow =
      Buildel.DocumentWorkflow.new(%{
        embeddings:
          Buildel.Clients.Embeddings.new(%{
            api_type: collection.embeddings_api_type,
            model: collection.embeddings_model,
            api_key: api_key.value,
            endpoint: collection.embeddings_endpoint
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
         %{chunks: chunks, embeddings_tokens: embeddings_tokens} when is_list(chunks) <-
           Buildel.DocumentWorkflow.generate_embeddings_for_chunks(workflow, chunks),
         {:ok, memory} <-
           %Buildel.Memories.Memory{}
           |> Buildel.Memories.Memory.changeset(
             metadata
             |> Map.merge(%{
               organization_id: organization.id,
               collection_name: collection.collection_name,
               memory_collection_id: collection.id,
               content: chunks |> Enum.map(&Map.get(&1, :value)) |> Enum.join("\n")
             })
           )
           |> Buildel.Repo.insert(),
         cost_amount <-
           Buildel.Costs.CostCalculator.calculate_embeddings_cost(
             %Buildel.Langchain.EmbeddingsTokenSummary{
               tokens: embeddings_tokens,
               model: collection.embeddings_model,
               endpoint: collection.embeddings_endpoint
             }
           ),
         {:ok, cost} <-
           Organizations.create_organization_cost(
             organization,
             %{
               amount: cost_amount,
               input_tokens: embeddings_tokens,
               output_tokens: 0
             }
           ),
         {:ok, _} <-
           create_memory_collection_cost(collection, cost, %{
             cost_type: :file_upload,
             description: memory.file_name
           }) do
      chunks =
        put_in(
          chunks,
          [Access.all(), Access.key!(:metadata), :memory_id],
          memory.id
        )
        |> put_in([Access.all(), Access.key!(:metadata), :file_name], metadata.file_name)

      Buildel.DocumentWorkflow.put_in_database(workflow, chunks)

      Buildel.MemoriesGraph.generate_and_save_graph(organization, collection, memory)

      {:ok, memory}
    else
      {:error, :invalid_api_key} ->
        {:error, :bad_request, "Invalid API key provided for embeddings model"}

      {:error, :insufficient_quota} ->
        {:error, :bad_request, "Insufficient quota for embeddings model"}

      {:error, :model_not_found} ->
        {:error, :bad_request, "Model not found"}

      err ->
        err
    end
  end

  def delete_organization_memory(
        %Buildel.Organizations.Organization{} = organization,
        collection_id,
        ids
      )
      when is_list(ids) do
    collection_name = organization_collection_name(organization.id, collection_id)

    with vector_db <-
           Buildel.VectorDB.new(%{
             adapter: Buildel.VectorDB.EctoAdapter,
             embeddings:
               Buildel.Clients.Embeddings.new(%{
                 api_type: "openai",
                 model: "",
                 api_key: "",
                 endpoint: ""
               })
           }),
         :ok <-
           Buildel.VectorDB.delete_all_by_memory_ids(
             vector_db,
             collection_name,
             Enum.map(ids, &to_string/1)
           ),
         {_, nil} <-
           Buildel.Repo.delete_all(
             from(m in Memory, where: m.id in ^ids and m.organization_id == ^organization.id)
           ) do
      {:ok, ids}
    end
  end

  def delete_organization_memory(
        %Buildel.Organizations.Organization{} = organization,
        _collection_id,
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
                 api_key: memory.memory_collection.embeddings_secret_name,
                 endpoint: memory.memory_collection.embeddings_endpoint
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
      memories |> Enum.map(&delete_organization_memory(organization, collection.id, &1.id))

      Buildel.Repo.delete(collection)

      :ok
    end
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
          embeddings_endpoint: embeddings.endpoint,
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
          embeddings_endpoint: embeddings.endpoint,
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

  def get_collection_memory_by_file_uuid!(
        %Buildel.Organizations.Organization{} = organization,
        collection_id,
        file_uuid
      ) do
    Buildel.Memories.Memory
    |> where(
      [m],
      m.file_uuid == ^file_uuid and m.memory_collection_id == ^collection_id and
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
            api_key: "",
            endpoint: ""
          })
      })

    Buildel.VectorDB.get_all(
      vector_db,
      "#{organization_id}_#{memory_collection_id}",
      %{memory_id: memory_id},
      %{}
    )
  end

  def get_organization_memory_chunk(
        organization_id,
        memory_collection_id,
        chunk_id
      ) do
    vector_db =
      Buildel.VectorDB.new(%{
        adapter: Buildel.VectorDB.EctoAdapter,
        embeddings:
          Buildel.Clients.Embeddings.new(%{
            api_type: "",
            model: "",
            api_key: "",
            endpoint: ""
          })
      })

    Buildel.VectorDB.get_by_id(
      vector_db,
      "#{organization_id}_#{memory_collection_id}",
      chunk_id
    )
  end

  def organization_collection_name(
        %Buildel.Organizations.Organization{} = organization,
        %Buildel.Memories.MemoryCollection{} = collection
      ) do
    organization_collection_name(organization.id, collection.id)
  end

  def organization_collection_name(organization_id, collection_id) do
    "#{organization_id}_#{collection_id}"
  end
end
