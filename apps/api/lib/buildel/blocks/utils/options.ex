defmodule Buildel.Blocks.Utils.Options do
  alias Buildel.Blocks.Utils.Schemas
  alias Buildel.Blocks.Fields.EditorField

  @enforce_keys [:type, :description, :groups]
  @derive {Jason.Encoder, except: [:sections]}
  defstruct [
    :type,
    :description,
    :groups,
    :sections,
    :inputs,
    :outputs,
    :ios,
    :dynamic_ios,
    :schema
  ]

  def new(%{type: type, description: description, groups: groups}) do
    %__MODULE__{type: type, description: description, groups: groups}
  end

  def set_sections(options, sections) do
    %{options | sections: sections}
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
      |> Enum.map(&%{name: &1.name, type: :worker, public: false, visible: true})

    ios =
      if tool_controller?,
        do: ios ++ [%{name: :tools, type: :controller, public: false, visible: true}],
        else: ios

    %{options | ios: ios}
  end

  def set_ios(options, ios) do
    %{options | ios: ios}
  end

  def set_dynamic_ios(options, dynamic_ios) do
    %{options | dynamic_ios: dynamic_ios}
  end

  def set_schema(options, options_schema_properties, tools) do
    tools_options_schema_properties =
      tools
      |> Enum.flat_map(
        &[
          {
            :"#{&1.name}_call_formatter",
            %{
              required: false,
              section: &1.name,
              schema:
                EditorField.new(%{
                  readonly: false,
                  title: "Call Formatter",
                  description: "Prompt to display when calling tool",
                  minLength: 1,
                  default: "abc",
                  suggestions: [],
                  displayWhen: %{
                    connections: %{
                      :"#{&1.name}_worker" => %{
                        min: 1
                      }
                    }
                  }
                })
            }
          },
          {
            :"#{&1.name}_response_formatter",
            %{
              required: false,
              section: &1.name,
              schema:
                EditorField.new(%{
                  readonly: false,
                  title: "Response Formatter",
                  description: "Prompt to display when tool has responded",
                  minLength: 1,
                  default: "abc",
                  suggestions: [],
                  displayWhen: %{
                    connections: %{
                      :"#{&1.name}_worker" => %{
                        min: 1
                      }
                    }
                  }
                })
            }
          }
        ]
      )

    options =
      update_in(options.sections, fn existing_sections ->
        existing_sections ++
          Enum.map(
            tools,
            &{&1.name,
             [
               title: "#{to_string(&1.name) |> String.capitalize()} Tool Settings",
               description: "",
               displayWhen: %{
                 connections: %{
                   :"#{&1.name}_worker" => %{
                     min: 1
                   }
                 }
               }
             ]}
          )
      end)

    options_schema_properties =
      options_schema_properties
      |> Keyword.merge(tools_options_schema_properties)
      |> Enum.reduce(%{section: nil, properties: []}, fn
        {field_name, %{section: nil} = field_properties},
        %{properties: properties, section: nil} ->
          %{section: nil, properties: properties ++ [{field_name, field_properties}]}

        {field_name, %{section: field_section} = field_properties},
        %{properties: properties, section: nil} ->
          section_info = options.sections |> Keyword.get(field_section)

          section_schema =
            Schemas.options_schema(%{
              type: "section",
              title: section_info |> Keyword.get(:title),
              description: section_info |> Keyword.get(:description),
              required: [],
              properties: Jason.OrderedObject.new([]),
              displayWhen: section_info |> Keyword.get(:displayWhen)
            })
            |> Schemas.push_property(
              field_name,
              field_properties.schema,
              field_properties.required
            )

          %{section: %{name: field_section, schema: section_schema}, properties: properties}

        {field_name, %{section: nil} = field_properties},
        %{properties: properties, section: section} ->
          %{
            section: nil,
            properties:
              properties ++
                [{section.name, %{schema: section.schema, required: false, section: nil}}] ++
                [{field_name, field_properties}]
          }

        {field_name, %{section: field_section} = field_properties},
        %{properties: properties, section: %{name: section_name} = section}
        when field_section == section_name ->
          section = %{
            section
            | schema:
                section.schema
                |> Schemas.push_property(
                  field_name,
                  field_properties.schema,
                  field_properties.required
                )
          }

          %{section: section, properties: properties}

        {field_name, %{section: field_section} = field_properties},
        %{properties: properties, section: %{name: _section_name} = section} ->
          section_info = options.sections |> Keyword.get(field_section)

          section_schema =
            Schemas.options_schema(%{
              type: "section",
              title: section_info |> Keyword.get(:title),
              description: section_info |> Keyword.get(:description),
              required: [],
              properties: Jason.OrderedObject.new([]),
              displayWhen: section_info |> Keyword.get(:displayWhen)
            })
            |> Schemas.push_property(
              field_name,
              field_properties.schema,
              field_properties.required
            )

          %{
            section: %{name: field_section, schema: section_schema},
            properties:
              properties ++
                [{section.name, %{schema: section.schema, required: false, section: nil}}]
          }
      end)
      |> then(fn
        %{section: nil} = result ->
          result

        %{properties: properties, section: section} ->
          %{
            section: nil,
            properties:
              properties ++
                [{section.name, %{schema: section.schema, required: false, section: nil}}]
          }
      end)
      |> then(& &1.properties)

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
