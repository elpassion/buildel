defmodule BuildelWeb.Schemas.Errors do
  alias OpenApiSpex.Schema

  defmodule NotFoundResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        errors: %Schema{
          type: :object,
          properties: %{
            detail: %Schema{type: :string, description: "Error message"}
          }
        }
      }
    })
  end

  defmodule UnauthorizedResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        errors: %Schema{
          type: :object,
          properties: %{
            detail: %Schema{type: :string, description: "Error message"}
          }
        }
      }
    })
  end

  defmodule ForbiddenResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        errors: %Schema{
          type: :object,
          properties: %{
            detail: %Schema{type: :string, description: "Error message"}
          }
        }
      }
    })
  end

  defmodule UnprocessableEntity do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        errors: %Schema{
          type: :object,
          additionalProperties: %Schema{
            type: :array,
            items: %Schema{type: :string, description: "Field error message"}
          }
        }
      }
    })
  end
end
