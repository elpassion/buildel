defmodule BuildelWeb.BlockTypesView do
  def index(%{block_types: block_types}) do
    %{data: block_types}
  end
end
