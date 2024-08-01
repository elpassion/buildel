defmodule BuildelWeb.Schemas.Experiments do
  alias OpenApiSpex.Schema

  defmodule Experiment do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "Experiment",
      type: :object,
      properties: %{
        id: %Schema{type: :integer, description: "Experiment ID"},
        name: %Schema{type: :string, description: "Experiment name"},
        pipeline_id: %Schema{type: :integer, description: "Pipeline ID"},
        dataset_id: %Schema{type: :integer, description: "Dataset ID"},
        created_at: %Schema{type: :string, description: "Created at"}
      },
      required: [:id, :name, :pipeline_id, :dataset_id, :created_at]
    })
  end

  defmodule IndexResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "ExperimentIndexResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :array,
          items: BuildelWeb.Schemas.Experiments.Experiment
        }
      },
      required: [:data]
    })
  end

  defmodule ShowResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "ExperimentShowResponse",
      type: :object,
      properties: %{
        data: BuildelWeb.Schemas.Experiments.Experiment
      },
      required: [:data]
    })
  end

  defmodule CreateExperimentRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "ExperimentCreateRequest",
      type: :object,
      properties: %{
        experiment: %Schema{
          type: :object,
          properties: %{
            name: %Schema{type: :string, description: "Dataset name"},
            pipeline_id: %Schema{type: :integer, description: "Pipeline ID"},
            dataset_id: %Schema{type: :integer, description: "Dataset ID"}
          },
          required: [:name, :pipeline_id, :dataset_id]
        }
      },
      required: [:experiment]
    })
  end
end
