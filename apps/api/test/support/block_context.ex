defmodule Buildel.BlockContext.Mock do
  @behaviour Buildel.BlockContextBehaviour

  @impl true
  def context_from_context_id(context_id) do
    %{global: context_id, parent: context_id, local: context_id}
  end

  @impl true
  def block_pid(_context_id, _block_name) do
    nil
  end

  @impl true
  def create_run_auth_token(_context_id, _content) do
    {:ok, "token"}
  end

  @impl true
  def create_run_cost(_context_id, _block_name, _amount) do
    {:ok, %{}}
  end

  @impl true
  def global_collection_name(context_id, block_name) do
    context = context_from_context_id(context_id)
    "#{context[:global]}_#{block_name}"
  end

  @impl true
  def get_secret_from_context(_context, _key) do
    "secret"
  end
end
