defmodule Buildel.Blocks.Utils.Options do
  alias Buildel.Blocks.Utils.Schemas

  @enforce_keys [:type, :description, :groups]
  @derive Jason.Encoder
  defstruct [:type, :description, :groups, :inputs, :outputs, :ios, :dynamic_ios, :schema]

  def new(%{type: type, description: description, groups: groups}) do
    %__MODULE__{type: type, description: description, groups: groups}
  end

  def set_inputs(options, inputs) do
    %{options | inputs: inputs}
  end

  def set_outputs(options, outputs) do
    %{options | outputs: outputs}
  end

  def set_tools(options, tools, tool_controller?) do
    ios =
      tools
      |> Enum.map(&%{name: &1.name, type: :worker, public: false})

    ios =
      if tool_controller?,
        do: ios ++ [%{name: :tools, type: :controller, public: false}],
        else: ios

    %{options | ios: ios}
  end

  def set_ios(options, ios) do
    %{options | ios: ios}
  end

  def set_dynamic_ios(options, dynamic_ios) do
    %{options | dynamic_ios: dynamic_ios}
  end

  def set_schema(options, options_schema_properties) do
    %{
      options
      | schema: %{
          type: "object",
          required: ["name", "opts"],
          properties: %{
            name: Schemas.name_schema(),
            opts:
              Schemas.options_schema(%{
                required:
                  options_schema_properties
                  |> Enum.filter(&elem(&1, 1).required)
                  |> Keyword.keys(),
                properties:
                  options_schema_properties
                  |> Enum.map(&{elem(&1, 0), elem(&1, 1).schema})
                  |> Jason.OrderedObject.new()
              })
          }
        }
    }
  end
end
