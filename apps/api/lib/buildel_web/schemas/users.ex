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

  defmodule UpdatePasswordRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "UserUpdatePasswordRequest",
      type: :object,
      properties: %{
        current_password: %Schema{type: :string, description: "Current password", minLength: 12},
        password: %Schema{type: :string, description: "New password", minLength: 12},
        password_confirmation: %Schema{type: :string, description: "New password confirmation", minLength: 12}
      },
      required: [:current_password, :password, :password_confirmation]
    })
  end

  defmodule CreateForgotPasswordRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "UserCreateForgotPasswordRequest",
      type: :object,
      properties: %{
        email: %Schema{type: :string, description: "User email", pattern: ~r/@/},
      },
      required: [:email]
    })
  end

  defmodule UpdateForgotPasswordRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "UserUpdateForgotPasswordRequest",
      type: :object,
      properties: %{
        token: %Schema{type: :string, description: "Token"},
        password: %Schema{type: :string, description: "New password", minLength: 12},
        password_confirmation: %Schema{type: :string, description: "New password confirmation", minLength: 12},
      },
      required: [:token, :password, :password_confirmation]
    })
  end
end
