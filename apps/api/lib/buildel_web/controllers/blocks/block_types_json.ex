defmodule BuildelWeb.BlockTypesJSON do
  def index(%{block_types: block_types}) do
    %{data: block_types}
  end

  def overviews(%{block_overviews: block_overviews}) do
    %{data: block_overviews}
  end
end
