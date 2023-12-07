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
end
