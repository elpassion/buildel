defmodule Buildel.Blocks.MapInputs do
  require Logger
  alias Buildel.Blocks.Fields.EditorField
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
            "required" => ["template"],
            "properties" => %{
              "template" =>
                EditorField.new(%{
                  readonly: true,
                  title: "template",
                  description: "JQ template for combining texts.",
                  type: "string",
                  minLength: 1
                })
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

  defp combine(state) do
    state = state |> send_stream_start()
    fields = input_values(state)

    {state, message} =
      state |> interpolate_template_with_take_latest_messages(state[:opts].template)

    case message do
      nil ->
        state

      message ->
        fields_json =
          fields
          |> Enum.map(fn
            {field, nil} ->
              {field, nil}

            {field, %{value: nil, optional: true}} ->
              {field, ""}

            {field, %{value: nil, optional: false}} ->
              {field, nil}

            {field, %{value: value}} ->
              case Jason.decode(value) do
                {:ok, value} -> {field, value}
                _ -> {field, value}
              end
          end)
          |> Enum.into(%{})
          |> Jason.encode!()

        message = Buildel.JQ.query!(fields_json, message)
        output(state, "output", {:text, message})
    end
  end

  @impl true
  def handle_input("input", {topic, :text, message, _metadata}, state) do
    state
    |> save_latest_input_value(
      topic,
      case is_binary(message) do
        true -> message |> String.trim()
        false -> message |> Jason.encode!()
      end
    )
    |> combine()
  end

  defp interpolate_template_with_take_latest_messages(state, template) do
    message = replace_input_strings_with_latest_inputs(state, template) |> String.trim()

    if all_inputs_in_string_filled?(message, state.connections) do
      {state |> cleanup_inputs(), message}
    else
      {state, nil}
    end
  end
end
