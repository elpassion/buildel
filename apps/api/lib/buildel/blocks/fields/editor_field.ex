defmodule Buildel.Blocks.Fields.EditorField do
  defmodule Suggestion do
    alias __MODULE__
    defstruct [:value, :description, :type]

    defimpl Jason.Encoder, for: Suggestion do
      def encode(%Suggestion{} = suggestion, opts) do
        Jason.Encode.map(
          %{
            value: suggestion.value,
            description: suggestion.description,
            type: suggestion.type
          },
          opts
        )
      end
    end

    use MakeEnumerable

    @type t :: %Suggestion{}

    @spec new(attrs :: map()) :: t
    def new(%{} = attrs \\ %{}) do
      %Suggestion{type: "default"} |> Map.merge(attrs)
    end

    @spec secrets() :: t
    def secrets() do
      new(%{value: "secrets.*", description: "Secrets"})
    end

    @spec inputs() :: t
    def inputs() do
      new(%{value: "inputs.*", description: "Inputs"})
    end

    @spec metadata() :: t
    def metadata() do
      new(%{value: "metadata.*", description: "Metadata"})
    end
  end

  use Ecto.Schema
  alias __MODULE__
  import Ecto.Changeset

  @primary_key false
  embedded_schema do
    field :title, :string
    field :description, :string
    field :default, :string
    field :min_length, :integer, default: 0
    field :readonly, :boolean, default: false
    field :editor_language, Ecto.Enum, default: :custom, values: ~w(json custom)a
    field :displayWhen, :map, default: %{}

    field :suggestions, {:array, :map},
      default: [
        Suggestion.new(%{value: "secrets.*", description: "Secrets", type: "string"}),
        Suggestion.new(%{value: "inputs.*", description: "Inputs", type: "string"}),
        Suggestion.new(%{value: "metadata.*", description: "Metadata", type: "string"})
      ]
  end

  defimpl Jason.Encoder, for: EditorField do
    def encode(%EditorField{} = field, opts) do
      Jason.Encode.map(
        %{
          type: "string",
          presentAs: "editor",
          editorLanguage: field.editor_language,
          title: field.title,
          description: field.description,
          default: field.default,
          min_length: field.min_length,
          suggestions: field.suggestions,
          readonly: field.readonly,
          displayWhen: field.displayWhen
        },
        opts
      )
    end
  end

  use MakeEnumerable

  @type t :: %EditorField{}

  @create_fields ~w(title description default min_length editor_language suggestions displayWhen readonly)a
  @required_fields ~w(title description)a

  @spec new(attrs :: map()) :: t
  def new(%{} = attrs \\ %{}) do
    {:ok, field} =
      %EditorField{}
      |> cast(attrs, @create_fields)
      |> validate_required(@required_fields)
      |> validate_number(:min_length, greater_than_or_equal_to: 0)
      |> apply_action(:insert)

    field
  end

  @spec call_formatter(attrs :: map()) :: t
  def call_formatter(%{} = attrs \\ %{}) do
    new(
      Map.merge(
        %{
          title: "Call formatter",
          description: "The formatter to use for presenting llm message.",
          default: "{{config.block_name}}: {{config.args}}",
          displayWhen: %{
          },
          suggestions: [
            Suggestion.new(%{
              value: "config.args",
              description: "Arguments passed to function call."
            }),
            Suggestion.new(%{value: "config.block_name", description: "Name of the block."})
          ]
        },
        attrs
      )
    )
  end
end
