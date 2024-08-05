defmodule Buildel.Blocks.DatasetOutput do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "dataset_output",
      description: "Used to save data in datasets",
      groups: ["text", "inputs / outputs"],
      inputs: [Block.text_input()],
      outputs: [Block.text_output()],
      ios: [],
      dynamic_ios: nil,
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "inputs", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => ["dataset"],
            "properties" =>
              Jason.OrderedObject.new(
                dataset:
                  dataset_schema(%{
                    "title" => "Dataset",
                    "description" => "Dataset to interact with",
                    "readonly" => true
                  })
              )
          })
      }
    }
  end

  @impl true
  def setup(state) do
    {:ok, state}
  end

  @impl true
  def handle_input("input", {_name, :text, text, _metadata}, state) do
    case block_context().get_dataset_from_context(state.context_id, state.opts.dataset) do
      %Buildel.Datasets.Dataset{} = dataset ->
        Buildel.Datasets.Rows.create_row(dataset, %{data: Jason.decode!(text)})
        output(state, "output", {:text, text})

      nil ->
        output(state, "output", {:text, text})
    end
  end

  def handle_stream_stop({_name, :stop_stream, _output, _metadata}, state) do
    state = send_stream_stop(state, "output")
    {:noreply, state}
  end
end
