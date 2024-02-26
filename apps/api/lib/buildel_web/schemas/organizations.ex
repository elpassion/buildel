defmodule BuildelWeb.Schemas.Organizations do
  alias OpenApiSpex.Schema

  defmodule Organization do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        id: %Schema{type: :integer, description: "Organization ID"},
        name: %Schema{type: :string, description: "Organization name"},
        api_key: %Schema{type: :string, description: "Organization API key"}
      }
    })
  end

  defmodule IndexResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        data: %Schema{
          type: :array,
          items: Organization
        }
      }
    })
  end

  defmodule ShowResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        data: BuildelWeb.Schemas.Organizations.Organization
      }
    })
  end

  defmodule CreateRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        name: %Schema{type: :string, description: "Organization name"}
      }
    })
  end

  defmodule ShowApiKeyResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        data: %Schema{
          type: :object,
          properties: %{
            key: %Schema{type: :string, description: "Organization API key"}
          }
        }
      }
    })
  end
end
