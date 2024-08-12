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
        pipeline: %Schema{
          type: :object,
          properties: %{
            id: %Schema{type: :integer, description: "Pipeline ID"},
            name: %Schema{type: :string, description: "Pipeline name"}
          },
          required: [:id, :name]
        },
        dataset: %Schema{
          type: :object,
          properties: %{
            id: %Schema{type: :integer, description: "Dataset ID"},
            name: %Schema{type: :string, description: "Dataset name"}
          },
          required: [:id, :name]
        },
        created_at: %Schema{type: :string, description: "Created at"}
      },
      required: [:id, :name, :pipeline, :dataset, :created_at]
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

  defmodule Runs do
    defmodule Run do
      require OpenApiSpex

      OpenApiSpex.schema(%{
        title: "ExperimentRun",
        type: :object,
        properties: %{
          id: %Schema{type: :integer, description: "Experiment Run ID"},
          status: %Schema{
            description: "Run status",
            type: :string,
            enum: ["created", "running", "finished"]
          },
          columns: %Schema{
            type: :object,
            properties: %{
              inputs: %Schema{type: :array, items: %Schema{type: :string}},
              outputs: %Schema{type: :array, items: %Schema{type: :string}}
            },
            required: [:inputs, :outputs]
          },
          created_at: %Schema{type: :string, description: "Created at"},
          evaluations_avg: %Schema{type: :number, description: "Evaluations average"}
        },
        required: [:id, :status, :created_at, :columns]
      })
    end

    defmodule IndexResponse do
      require OpenApiSpex

      OpenApiSpex.schema(%{
        title: "ExperimentRunIndexResponse",
        type: :object,
        properties: %{
          data: %Schema{type: :array, items: Run, description: "Runs list"},
          meta: BuildelWeb.Schemas.Pagination.Meta
        },
        required: [:data, :meta]
      })
    end

    defmodule ShowResponse do
      require OpenApiSpex

      OpenApiSpex.schema(%{
        title: "ExperimentRunShowResponse",
        type: :object,
        properties: %{
          data: Run
        },
        required: [:data]
      })
    end
  end

  defmodule Runs.Runs do
    defmodule Run do
      require OpenApiSpex

      OpenApiSpex.schema(%{
        title: "ExperimentRunRun",
        type: :object,
        properties: %{
          id: %Schema{type: :integer, description: "Experiment Run Run ID"},
          status: %Schema{
            description: "Status",
            type: :string,
            enum: ["created", "running", "finished"]
          },
          created_at: %Schema{type: :string, description: "Created at"},
          data: %Schema{type: :object, description: "Run data"},
          evaluation_avg: %Schema{type: :number, description: "Evaluation average"}
        },
        required: [:id, :status, :created_at]
      })
    end

    defmodule IndexResponse do
      require OpenApiSpex

      OpenApiSpex.schema(%{
        title: "ExperimentRunRunIndexResponse",
        type: :object,
        properties: %{
          data: %Schema{type: :array, items: Run, description: "Run Runs list"},
          meta: BuildelWeb.Schemas.Pagination.Meta
        },
        required: [:data, :meta]
      })
    end
  end
end
