defmodule BuildelWeb.Schemas.Sharepoint do
  alias OpenApiSpex.Schema

  defmodule ListSitesResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "SharepointListSitesResponse",
      type: :object,
      properties: %{
        id: %Schema{type: :string, description: "Site ID"},
        name: %Schema{type: :string, description: "Site name"}
      },
      required: [:id, :name]
    })
  end

  defmodule ListDrivesResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "SharepointListDrivesResponse",
      type: :object,
      properties: %{
        id: %Schema{type: :string, description: "Drive ID"},
        name: %Schema{type: :string, description: "Drive name"}
      },
      required: [:id, :name]
    })
  end
end
