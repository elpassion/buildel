defmodule Buildel.DocumentWorkflow do
  alias Buildel.DocumentWorkflow.DocumentProcessor
  alias Buildel.DocumentWorkflow.ChunkGenerator
  alias Buildel.Clients.Embeddings

  defstruct [:embeddings, :collection_name, :db_adapter, :workflow_config]

  @type workflow_config :: %{
          chunk_size: integer(),
          chunk_overlap: integer()
        }

  @type t :: %__MODULE__{
          embeddings: Embeddings.t(),
          collection_name: binary(),
          db_adapter: Buildel.VectorDB.VectorDBAdapterBehaviour.t(),
          workflow_config: workflow_config()
        }

  @type document :: {binary(), map()}
  @type struct_list :: [
          DocumentProcessor.Header.t()
          | DocumentProcessor.Paragraph.t()
          | DocumentProcessor.ListItem.t()
        ]

  @type embeddings :: [float()]
  @type chunk :: ChunkGenerator.Chunk.t()

  def new(
        %{
          embeddings: embeddings,
          collection_name: collection_name,
          db_adapter: db_adapter
        } = module_data
      ) do
    default_workflow_config = %{
      chunk_size: 1000,
      chunk_overlap: 0
    }

    workflow_config = Map.get(module_data, :workflow_config, %{})

    %__MODULE__{
      embeddings: embeddings,
      collection_name: collection_name,
      db_adapter: db_adapter,
      workflow_config: Map.merge(default_workflow_config, workflow_config)
    }
  end

  @spec process(t(), document()) :: [chunk()]
  def process(workflow, document) do
    document = read(workflow, document)
    chunks = build_node_chunks(workflow, document)
    chunks = generate_embeddings_for_chunks(workflow, chunks)
    put_in_database(workflow, chunks)
  end

  @spec read(t(), document()) :: struct_list()
  def read(_workflow, {path, file_metadata}) do
    document_loader =
      Buildel.DocumentWorkflow.DocumentLoader.new(%{
        adapter: Application.fetch_env!(:buildel, :document_loader)
      })

    with {:ok, result} <- DocumentProcessor.load_file(document_loader, path, file_metadata) do
      result
      |> DocumentProcessor.get_blocks()
      |> DocumentProcessor.filter_empty_blocks()
      |> DocumentProcessor.map_to_structures()
      |> DocumentProcessor.map_with_relations()
      |> DocumentProcessor.map_with_headers_metadata()
    else
      :error ->
        {:error, "Error reading file"}
    end
  end

  @spec build_node_chunks(t(), struct_list()) :: [chunk()]
  def build_node_chunks(%{workflow_config: workflow_config}, documents) do
    %{chunk_size: chunk_size, chunk_overlap: chunk_overlap} = workflow_config

    ChunkGenerator.split_into_chunks(documents, %{
      chunk_size: chunk_size,
      chunk_overlap: chunk_overlap
    })
    |> ChunkGenerator.add_neighbors()
    |> ChunkGenerator.add_parents(documents)
    |> ChunkGenerator.add_order()
  end

  @type keyword_node :: %{
          binary() => [binary()]
        }
  @spec generate_keyword_nodes(t(), [ChunkGenerator.Chunk.t()]) :: keyword_node()
  def generate_keyword_nodes(_workflow, chunks) do
    Enum.reduce(chunks, %{}, fn %{id: id, metadata: %{keywords: keywords}}, acc ->
      Enum.reduce(keywords, acc, fn keyword, acc ->
        Map.update(acc, keyword, [id], fn ids -> [id | ids] end)
      end)
    end)
  end

  def generate_embeddings_for_chunks(workflow, chunks) do
    embeddings_adapter = workflow.embeddings

    with {:ok, embeddings} <-
           embeddings_adapter
           |> Embeddings.get_embeddings(chunks |> Enum.map(&Map.get(&1, :value))) do
      embeddings
      |> Enum.zip(chunks)
      |> Enum.map(fn {embeddings, chunk} -> Map.put(chunk, :embeddings, embeddings) end)
    end
  end

  def put_in_database(workflow, chunks) do
    vector_db =
      Buildel.VectorDB.new(%{
        adapter: workflow.db_adapter,
        embeddings: workflow.embeddings
      })

    vector_db |> Buildel.VectorDB.init(workflow.collection_name)
    vector_db |> Buildel.VectorDB.add(workflow.collection_name, chunks)
  end

  def query_database(workflow, search_query, query_metadata, options) do
    vector_db =
      Buildel.VectorDB.new(%{
        adapter: workflow.db_adapter,
        embeddings: workflow.embeddings
      })

    Buildel.VectorDB.query(
      vector_db,
      workflow.collection_name,
      search_query,
      query_metadata,
      options
    )
  end

  def get_all_from_database(workflow, query_metadata \\ %{}) do
    vector_db =
      Buildel.VectorDB.new(%{
        adapter: workflow.db_adapter,
        embeddings: workflow.embeddings
      })

    Buildel.VectorDB.get_all(
      vector_db,
      workflow.collection_name,
      query_metadata
    )
  end
end
