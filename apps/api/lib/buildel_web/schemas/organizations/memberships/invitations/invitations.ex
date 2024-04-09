defmodule BuildelWeb.Schemas.Invitations do
  alias OpenApiSpex.Schema

  defmodule Invitation do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "Invitation",
      type: :object,
      properties: %{
        id: %Schema{type: :integer, description: "Invitation ID"},
        email: %Schema{type: :string, description: "Invitation email"},
        expires_at: %Schema{
          type: :string,
          format: :date_time,
          description: "Invitation expiration date"
        }
      },
      required: [:id, :email, :expires_at]
    })
  end

  defmodule IndexResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "InvitationIndexResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :array,
          items: Invitation
        }
      },
      required: [:data]
    })
  end

  defmodule ShowResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "InvitationShowResponse",
      type: :object,
      properties: %{
        data: Invitation
      },
      required: [:data]
    })
  end

  defmodule CreateRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "InvitationCreateRequest",
      type: :object,
      properties: %{
        email: %Schema{type: :string, description: "Invited user email"}
      },
      required: [:email]
    })
  end
end
