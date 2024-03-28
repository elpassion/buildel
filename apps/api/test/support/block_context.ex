defmodule Buildel.BlockContext.Mock do
  @behaviour Buildel.BlockContextBehaviour

  @impl true
  def context_from_context_id(context_id) do
    %{global: context_id, parent: context_id, local: context_id}
  end

  @impl true
  def block_pid(_context_id, _block_name) do
    self()
  end

  @impl true
  def create_run_auth_token(_context_id, _content) do
    {:ok, "token"}
  end

  @impl true
  def create_run_cost(_context_id, _block_name, _costs_data) do
    {:ok, %{}}
  end

  @impl true
  def get_global_collection_name(context_id, block_name) do
    context = context_from_context_id(context_id)
    {:ok, "#{context[:global]}_#{block_name}"}
  end

  @impl true
  def get_vector_db(_context_id, _collection_name) do
    {:ok,
     Buildel.VectorDB.new(%{
       adapter: Buildel.VectorDB.EctoAdapter,
       embeddings:
         Buildel.Clients.Embeddings.new(%{
           api_key: "",
           api_type: "test",
           model: "text-embedding-ada-002"
         })
     })}
  end

  @impl true
  def get_secret_from_context(_context, key) do
    key
  end
end
