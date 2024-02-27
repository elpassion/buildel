defmodule BuildelWeb.Schemas.Users do
  alias OpenApiSpex.Schema

  defmodule User do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "User",
      type: :object,
      properties: %{
        id: %Schema{type: :integer, description: "User ID"},
      },
      required: [:id]
    })
  end

  defmodule ShowResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "UserShowResponse",
      type: :object,
      properties: %{
        data: BuildelWeb.Schemas.Users.User
      },
      required: [:data]
    })
  end
end
