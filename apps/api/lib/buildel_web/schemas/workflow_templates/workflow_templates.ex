defmodule BuildelWeb.Schemas.WorkflowTemplates do
  alias OpenApiSpex.Schema

  defmodule WorkflowTemplate do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "WorkflowTemplate",
      type: :object,
      properties: %{
        name: %Schema{type: :string, description: "Workflow template readable name"},
        template_name: %Schema{type: :string, description: "Workflow template name"}
      },
      required: [:name, :template_name]
    })
  end

  defmodule IndexResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "WorkflowTemplateIndexResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :array,
          items: WorkflowTemplate
        }
      },
      required: [:data]
    })
  end

  defmodule CreateResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "WorkflowTemplateCreateResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :object,
          properties: %{
            pipeline_id: %Schema{type: :integer, description: "Created pipeline ID"}
          },
          required: [:pipeline_id]
        }
      },
      required: [:data]
    })
  end

  defmodule CreateRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "WorkflowTemplateCreateRequest",
      type: :object,
      properties: %{
        template_name: %Schema{type: :string, description: "Workflow template name"}
      },
      required: [:template_name]
    })
  end
end
