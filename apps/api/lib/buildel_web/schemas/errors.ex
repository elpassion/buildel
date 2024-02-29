defmodule BuildelWeb.Schemas.Errors do
  alias OpenApiSpex.Schema

  defmodule BadRequestResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        errors: %Schema{
          type: :object,
          properties: %{
            detail: %Schema{type: :string, description: "Error message", enum: ["Bad Request"]}
          }
        }
      }
    })
  end

  defmodule NotFoundResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        errors: %Schema{
          type: :object,
          properties: %{
            detail: %Schema{type: :string, description: "Error message", enum: ["Not Found"]}
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
            detail: %Schema{type: :string, description: "Error message", enum: ["Unauthorized"]}
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
            detail: %Schema{enum: ["Forbidden"]}
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
            items: %Schema{
              type: :string,
              description: "Field error message",
              enum: ["Unprocessable entity"]
            }
          }
        }
      }
    })
  end
end
