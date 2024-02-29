defmodule BuildelWeb.Schemas.Aliases do
  alias BuildelWeb.Schemas.Chunks.ShowResponse
  alias OpenApiSpex.Schema

  defmodule AliasConfig do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "AliasConfig",
      type: :object,
      properties: %{
        blocks: %Schema{type: :array, description: "Blocks list", items: %Schema{type: :object}}
      },
      required: [:blocks]
    })
  end

  defmodule Alias do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "Alias",
      type: :object,
      properties: %{
        id: %Schema{
          description: "Alias id",
          oneOf: [%Schema{type: :integer}, %Schema{type: :string}]
        },
        name: %Schema{type: :string, description: "Alias name"},
        config: AliasConfig,
        interface_config: %Schema{
          type: :object,
          description: "Alias interface config",
          nullable: true
        }
      },
      required: [:id, :name, :config, :interface_config]
    })
  end

  defmodule ShowResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "AliasShowResponse",
      type: :object,
      properties: %{
        data: Alias
      },
      required: [:data]
    })
  end

  defmodule IndexResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "AliasIndexResponse",
      type: :object,
      properties: %{
        data: %Schema{type: :array, items: Alias}
      },
      required: [:data]
    })
  end

  defmodule CreateRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "AliasCreateRequest",
      type: :object,
      properties: %{
        alias: %Schema{
          type: :object,
          properties: %{
            name: %Schema{type: :string, description: "Alias name"},
            config: %Schema{type: :object, description: "Alias config"},
            interface_config: %Schema{
              type: :object,
              description: "Alias interface config"
            }
          },
          required: [:name, :config, :interface_config]
        }
      },
      required: [:alias]
    })
  end

  defmodule UpdateRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "AliasUpdateRequest",
      type: :object,
      properties: %{
        alias: %Schema{
          type: :object,
          properties: %{
            name: %Schema{type: :string, description: "Alias name"},
            config: %Schema{type: :object, description: "Alias config"},
            interface_config: %Schema{
              type: :object,
              description: "Alias interface config"
            }
          }
        }
      },
      required: [:alias]
    })
  end
end
