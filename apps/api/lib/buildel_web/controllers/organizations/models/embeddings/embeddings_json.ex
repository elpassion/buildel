defmodule BuildelWeb.OrganizationModelEmbeddingJSON do
  def index(%{models: models}) do
    %{data: models}
  end
end
