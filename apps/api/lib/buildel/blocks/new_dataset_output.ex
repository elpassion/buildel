defmodule Buildel.Blocks.NewDatasetOutput do
  use Buildel.Blocks.NewBlock

  defblock(:dataset_output,
    description:
      "Used to save data in datasets",
    groups: ["text", "inputs / outputs"]
  )

  definput(:input,   schema: %{"anyOf" => [%{"type" => "string"}, %{}]}, public: false)

  defoutput(:output, schema: %{}, public: false)


  defoption(:dataset, %{
    "type" => "string",
    "title" => "Dataset",
    "description" => "Dataset to interact with.",
    "url" => "/api/organizations/{{organization_id}}/datasets",
    "presentAs" => "async-creatable-select",
    "minLength" => 1,
    "readonly" => true,
    "schema" => %{
      "type" => "object",
      "required" => ["dataset"],
      "properties" => %{
        "dataset" => %{
          "type" => "object",
          "properties" => %{
            "name" => %{
              "type" => "string",
              "title" => "Name",
              "description" => "The name for dataset.",
              "minLength" => 1
            }
          },
          "required" => ["name"]
        }
      }
    }
  })

  def handle_input(:input, %Message{} = message, state) do
    send_stream_start(state, :output, message)

    with %Buildel.Datasets.Dataset{} = dataset <- get_dataset_from_context(state.context.context_id, option(state, :dataset)),
         {:ok, content} <- Message.to_map(message),
         {:ok, _row } <- Buildel.Datasets.Rows.create_row(dataset, %{data: content}) do
          output(state, :output, message)

          {:ok, state}
    else
      nil ->
        output(state, :output, message)
        {:ok, state}
      {:error, %Ecto.Changeset{} = changeset} ->
          send_error(
            state,
            Message.from_message(message)
            |> Message.set_type(:text)
            |> Message.set_message("Error saving data in dataset")
          )

          {:ok, state}
      {:error, error} ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message(error)
        )

        {:ok, state}
    end
  end

  def handle_input_stream_stop(:input, message, state) do
    send_stream_stop(state, :output, message)
    {:ok, state}
  end

  defp get_dataset_from_context(context_id, dataset_id) do
    with %{global: organization_id} = context_from_context_id(context_id),
         %Buildel.Organizations.Organization{} = organization <-
           Buildel.Organizations.get_organization!(organization_id),
         {:ok, dataset} <- Buildel.Datasets.get_organization_dataset(organization, dataset_id) do
      dataset
    else
      _ -> nil
    end
  end

  defp context_from_context_id(context_id) do
    ["organizations", organization_id, "pipelines", pipeline_id, "runs", run_id] =
      String.split(context_id, ":")

    %{
      global: organization_id,
      parent: pipeline_id,
      local: run_id
    }
  end
end
