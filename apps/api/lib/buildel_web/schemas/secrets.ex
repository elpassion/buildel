defmodule BuildelWeb.Schemas.Secrets do
  alias OpenApiSpex.Schema

  defmodule Secret do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "Secret",
      type: :object,
      properties: %{
        id: %Schema{type: :string, description: "Secret ID"},
        name: %Schema{type: :string, description: "Secret name"},
        created_at: %Schema{type: :string, description: "Created at date"},
        updated_at: %Schema{type: :string, description: "Updated at date"}
      },
      required: [:id, :name, :created_at, :updated_at]
    })
  end

  defmodule IndexResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "SecretIndexResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :array,
          items: BuildelWeb.Schemas.Secrets.Secret
        }
      },
      required: [:data]
    })
  end

  defmodule ShowResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "SecretShowResponse",
      type: :object,
      properties: %{
        data: BuildelWeb.Schemas.Secrets.Secret
      },
      required: [:data]
    })
  end

  defmodule AliasResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "SecretAliasResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :array,
          items: %Schema{type: :string}
        }
      },
      required: [:data]
    })
  end

  defmodule CreateSecretRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "SecretCreateRequest",
      type: :object,
      properties: %{
        name: %Schema{type: :string, description: "Secret name"},
        value: %Schema{type: :string, description: "Secret value"},
        alias: %Schema{type: :string, description: "Secret alias"}
      },
      required: [:name, :value]
    })
  end

  defmodule UpdateSecretRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "SecretUpdateRequest",
      type: :object,
      properties: %{
        value: %Schema{type: :string, description: "Secret value"},
        alias: %Schema{type: :string, description: "Secret alias"}
      },
      required: []
    })
  end
end
