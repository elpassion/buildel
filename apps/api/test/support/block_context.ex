defmodule Buildel.BlockContext.Mock do
  def context_from_context_id(context_id) do
    %{global: context_id, parent: context_id, local: context_id}
  end
end
