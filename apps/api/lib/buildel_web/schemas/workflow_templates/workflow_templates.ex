defmodule BuildelWeb.Schemas.WorkflowTemplates do
  alias OpenApiSpex.Schema

  defmodule WorkflowTemplate do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "WorkflowTemplate",
      type: :object,
      properties: %{
        name: %Schema{type: :string, description: "Workflow template name"}
      },
      required: [:name]
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

  defmodule ShowResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "WorkflowTemplateShowResponse",
      type: :object,
      properties: %{
        data: WorkflowTemplate
      },
      required: [:data]
    })
  end
end
