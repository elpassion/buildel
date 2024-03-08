defmodule Buildel.DocumentWorkflow do
  alias Buildel.DocumentWorkflow.ChunkGenerator.Chunk
  alias Buildel.DocumentWorkflow.DocumentProcessor
  alias Buildel.DocumentWorkflow.ChunkGenerator
  alias Buildel.Clients.Embeddings

  @type document :: {binary(), map()}
  @type struct_list :: [
          DocumentProcessor.Header.t()
          | DocumentProcessor.Paragraph.t()
          | DocumentProcessor.ListItem.t()
        ]

  @type embeddings :: [float()]
  @type chunk :: %{
          embeddings: embeddings(),
          metadata: map(),
          previous: integer(),
          next: integer(),
          parent: integer(),
          chunk: binary()
        }
  @spec process(document()) :: [chunk()]
  def process(_document) do
    # # file ie. document.pdf
    # document
    # # get the content of the file (chunked) [Header{level: 0, metadata: {page: 0}}, Paragraph{level: 1}, Paragraph{level: 1}, ListItem{level: 2, metadata: {page: 1}}]
    # # build nodes with relations to other nodes (parent?, next?, previous?)
    # |> read
    # # 1500 characters per chunk keeping metadata  "#Zał 3. ##Pasywa, ###coś tam, ####dobra trwałe\n maszyny coś tam..."
    # |> build_node_chunks
    # # { "zał 3" => [id_chunku, id_chunku_2], "pasywa" => [chunk_3], "coś tam" => [], "dobra trwałe" =>[], "maszyny coś tam" => [] }
    # |> generate_keyword_nodes
    # # generate embeddings for each chunk
    # |> generate_embeddings_for_chunks
    # # save the chunk with embeddings in database
    # |> put_in_database

    []
    # document
    # |> read ("abc cde\n\n fgh\n ijk\n listitem\n")
    # |> build_node_chunks (["abc cde\n\n", "fgh\n ijk\n listitem\n"])
    # |> generate_embeddings_for_chunks ([{embeddings: [...], chunk: "abc cde\n\n"}, {embeddings: [...], chunk: "fgh\n ijk\n listitem\n"}])
    # |> put_in_database ([{embeddings: [...], chunk: "abc cde\n\n"}, {embeddings: [...], chunk: "fgh\n ijk\n listitem\n"}])
  end

  @spec read(document()) :: struct_list()
  def read({path, file_metadata}) do
    with {:ok, result} <- DocumentProcessor.load_file(path, file_metadata) do
      Jason.decode!(result)
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

  def build_node_chunks(documents, config \\ %{}) do
    ChunkGenerator.split_into_chunks(documents, config) |> ChunkGenerator.add_neighbors()
  end

  @type keyword_node :: %{
          binary() => [binary()]
        }
  @spec generate_keyword_nodes([ChunkGenerator.Chunk.t()]) :: keyword_node()
  def generate_keyword_nodes(chunks) do
    Enum.group_by(chunks, & &1.keyword, & &1.id)
  end

  def generate_embeddings(chunks) do
    embeddings_adapter =
      Embeddings.new(%{
        api_key: System.get_env("OPENAI_API_KEY"),
        model: "text-embedding-3-small",
        api_type: "openai"
      })

    database_adapter = Buildel.VectorDB.EctoAdapter
    vector_db = Buildel.VectorDB.new(%{adapter: database_adapter, embeddings: embeddings_adapter})

    documents =
      chunks
      |> Enum.map(fn chunk ->
        %{
          document: chunk.value,
          metadata: %{
            chunk_id: chunk.id
          }
        }
      end)

    vector_db |> Buildel.VectorDB.add("test", documents)
  end

  defp put_in_database(_document) do
    []
  end
end
