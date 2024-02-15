defmodule BuildelWeb.OrganizationToolChunkJSON do
  def show(%{chunks: chunks}) do
    %{data: chunks}
  end
end
