defmodule BuildelWeb.Schemas.Users do
  alias OpenApiSpex.Schema

  defmodule User do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "User",
      type: :object,
      properties: %{
        id: %Schema{type: :integer, description: "User ID"}
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
        password_confirmation: %Schema{
          type: :string,
          description: "New password confirmation",
          minLength: 12
        }
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
        email: %Schema{
          type: :string,
          description: "User email",
          pattern: ~r/^[^\s]+@[^\s]+$/,
          example: "email@email.com"
        }
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
        password_confirmation: %Schema{
          type: :string,
          description: "New password confirmation",
          minLength: 12
        }
      },
      required: [:token, :password, :password_confirmation]
    })
  end

  defmodule CreateRegistrationRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "UserCreateRegistrationRequest",
      type: :object,
      properties: %{
        user: %Schema{
          type: :object,
          properties: %{
            email: %Schema{
              type: :string,
              description: "Email",
              pattern: ~r/^[^\s]+@[^\s]+$/,
              example: "email@email.com"
            },
            password: %Schema{type: :string, description: "Password", minLength: 12}
          },
          required: [:email, :password]
        }
      },
      required: [:user]
    })
  end

  defmodule CreateInvitationRegistrationRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "UserCreateInvitationRegistrationRequest",
      type: :object,
      properties: %{
        user: %Schema{
          type: :object,
          properties: %{
            token: %Schema{type: :string, description: "Invitation token"},
            password: %Schema{type: :string, description: "Password", minLength: 12}
          },
          required: [:token, :password]
        }
      },
      required: [:user]
    })
  end

  defmodule CreateLoginRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "UserCreateLoginRequest",
      type: :object,
      properties: %{
        user: %Schema{
          type: :object,
          properties: %{
            email: %Schema{
              type: :string,
              description: "Email",
              pattern: ~r/^[^\s]+@[^\s]+$/,
              example: "email@email.com"
            },
            password: %Schema{type: :string, description: "Password"},
            remember_me: %Schema{
              type: :boolean,
              description: "Adds _buildel_web_user_remember_me cookie"
            }
          },
          required: [:email, :password]
        }
      },
      required: [:user]
    })
  end

  defmodule CreateLoginWithGoogleRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "UserCreateLoginWithGoogleRequest",
      type: :object,
      properties: %{
        token: %Schema{
          type: :string,
          description: "Token"
        }
      },
      required: [:token]
    })
  end

  defmodule CreateLoginWithGithubRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "UserCreateLoginWithGithubRequest",
      type: :object,
      properties: %{
        token: %Schema{
          type: :string,
          description: "Token"
        }
      },
      required: [:token]
    })
  end
end
