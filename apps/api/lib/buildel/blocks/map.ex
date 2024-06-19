defmodule Buildel.Blocks.MapInputs do
  require Logger
  use Buildel.Blocks.Block
  use Buildel.Blocks.Utils.TakeLatest

  @impl true
  def options() do
    %{
      type: "map_inputs",
      description:
        "Used to map the latest inputs and combine them based on a specified template.",
      groups: ["text", "utils"],
      inputs: [Block.text_input()],
      outputs: [Block.text_output()],
      ios: [],
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
            "required" => ["template"],
            "properties" => %{
              "template" => %{
                "type" => "string",
                "title" => "Template",
                "description" => "Output string from combined inputs.",
                "minLength" => 1
              }
            }
          })
      }
    }
  end

  # Server

  @impl true
  def setup(%{type: __MODULE__} = state) do
    {:ok, state |> assign_take_latest()}
  end

  def handle_input("input", {topic, :text, message, _metadata}) do
    [
      {:start_stream, "output"},
      {:call,
       fn state ->
         state = save_latest_input_value(state, topic, message)

         {state, message} =
           state |> interpolate_template_with_take_latest_messages(state[:opts].template)

         case message do
           nil ->
             {nil, state}

           message ->
             {{:output, "output", {:text, message, %{}}}, state}
         end
       end},
      {:stop_stream, "output"}
    ]
  end

  defp interpolate_template_with_take_latest_messages(state, template) do
    message = replace_input_strings_with_latest_inputs_values(state, template)

    if all_inputs_in_string_filled?(message, state.connections) do
      {state |> cleanup_inputs(), message}
    else
      {state, nil}
    end
  end
end
