defmodule Buildel.Memories.MemoryCollectionSearch do
  alias Buildel.Organizations.Organization
  alias Buildel.Memories
  alias Buildel.Memories.MemoryCollection
  alias Buildel.Organizations

  defstruct [:vector_db, :organization_collection_name]

  def new(%{
        vector_db: vector_db,
        organization_collection_name: organization_collection_name
      }) do
    %__MODULE__{
      vector_db: vector_db,
      organization_collection_name: organization_collection_name
    }
  end

  def new(%Organization{} = organization, %MemoryCollection{} = collection) do
    {:ok, api_key} =
      Organizations.get_organization_secret(organization, collection.embeddings_secret_name)

    organization_collection_name = Memories.organization_collection_name(organization, collection)

    vector_db =
      Buildel.VectorDB.new(%{
        adapter: Buildel.VectorDB.EctoAdapter,
        embeddings:
          Buildel.Clients.Embeddings.new(%{
            api_type: collection.embeddings_api_type,
            model: collection.embeddings_model,
            api_key: api_key.value
          })
      })

    %__MODULE__{
      vector_db: vector_db,
      organization_collection_name: organization_collection_name
    }
  end

  defmodule Params do
    @default_params %{
      search_query: "",
      limit: 10,
      token_limit: nil,
      extend_neighbors: false,
      extend_parents: false
    }

    defstruct [:search_query, :limit, :token_limit, :extend_neighbors, :extend_parents]

    def from_map(params) do
      %__MODULE__{}
      |> struct(Map.merge(@default_params, params))
    end
  end

  def search(
        %__MODULE__{vector_db: vector_db, organization_collection_name: collection_name} = module,
        %Params{} = params
      ) do
    result =
      Buildel.VectorDB.query(
        vector_db,
        collection_name,
        params.search_query,
        %{},
        %{
          limit: params.limit,
          similarity_threshhold: 0
        }
      )

    case params do
      %Params{extend_parents: true} ->
        module |> extend_parents_query(result)

      %Params{extend_neighbors: true} ->
        module |> extend_neighbors_query(result)

      %Params{extend_neighbors: false, extend_parents: false} ->
        result

      _ ->
        result
    end
  end

  defp extend_parents_query(
         %__MODULE__{vector_db: vector_db, organization_collection_name: collection_name},
         result
       ) do
    Enum.map(result, fn chunk ->
      parent_context =
        Buildel.VectorDB.get_by_parent_id(
          vector_db,
          collection_name,
          chunk["metadata"]["parent"]
        )
        |> Enum.map(fn chunk ->
          chunk.document
        end)

      combined_document = parent_context |> Enum.join(" ")

      Map.put(chunk, "document", combined_document)
    end)
  end

  defp extend_neighbors_query(
         %__MODULE__{vector_db: vector_db, organization_collection_name: collection_name},
         result
       ) do
    all_chunks =
      Buildel.VectorDB.get_all(
        vector_db,
        collection_name,
        %{}
      )

    Enum.map(result, fn chunk ->
      prev_id = Map.get(chunk["metadata"], "prev")
      next_id = Map.get(chunk["metadata"], "next")

      prev = Enum.find(all_chunks, %{}, fn c -> Map.get(c, "chunk_id") == prev_id end)
      next = Enum.find(all_chunks, %{}, fn c -> Map.get(c, "chunk_id") == next_id end)

      prev_doc = Map.get(prev, "document", "")
      next_doc = Map.get(next, "document", "")

      combined_document = [prev_doc, chunk["document"], next_doc] |> Enum.join(" ")

      Map.put(chunk, "document", combined_document)
    end)
  end
end
