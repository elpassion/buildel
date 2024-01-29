defmodule BuildelWeb.OrganizationModelJSON do
  def index(%{models: models}) do
    %{data: models}
  end
end
