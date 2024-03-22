defmodule BuildelWeb.Schemas.Pipelines do
  alias OpenApiSpex.Schema

  defmodule PipelineConfig do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "PipelineConfig",
      type: :object,
      properties: %{
        blocks: %Schema{type: :array, description: "Blocks list", items: %Schema{type: :object}}
      },
      required: [:blocks]
    })
  end

  defmodule Pipeline do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "Pipeline",
      type: :object,
      properties: %{
        id: %Schema{type: :integer, description: "Pipeline ID"},
        name: %Schema{type: :string, description: "Pipeline name"},
        organization_id: %Schema{type: :integer, description: "Organization ID"},
        interface_config: %Schema{type: :object, description: "Interface config", nullable: true},
        runs_count: %Schema{type: :integer, description: "Runs count"},
        config: PipelineConfig
      },
      required: [:id, :name, :organization_id, :runs_count, :config]
    })
  end

  defmodule PipelinePublic do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "PipelinePublic",
      type: :object,
      properties: %{
        id: %Schema{type: :integer, description: "Pipeline ID"},
        name: %Schema{type: :string, description: "Pipeline name"},
        interface_config: %Schema{type: :object, description: "Interface config", nullable: true}
      },
      required: [:id, :name]
    })
  end

  defmodule IndexResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "PipelineIndexResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :array,
          items: BuildelWeb.Schemas.Pipelines.Pipeline
        }
      },
      required: [:data]
    })
  end

  defmodule ShowResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "PipelineShowResponse",
      type: :object,
      properties: %{
        data: BuildelWeb.Schemas.Pipelines.Pipeline
      },
      required: [:data]
    })
  end

  defmodule CreatePipelineRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "PipelineCreateRequest",
      type: :object,
      properties: %{
        pipeline: %Schema{
          type: :object,
          properties: %{
            name: %Schema{type: :string, description: "Pipeline name"},
            config: %Schema{type: :object, description: "Pipeline config"}
          },
          required: [:name, :config]
        }
      },
      required: [:pipeline]
    })
  end

  defmodule UpdatePipelineRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "PipelineUpdateRequest",
      type: :object,
      properties: %{
        pipeline: %Schema{
          type: :object
        }
      },
      required: [:pipeline]
    })
  end

  defmodule PipelinePublicShowResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "PipelinePublicShowResponse",
      type: :object,
      properties: %{
        data: BuildelWeb.Schemas.Pipelines.PipelinePublic
      },
      required: [:data]
    })
  end
end
