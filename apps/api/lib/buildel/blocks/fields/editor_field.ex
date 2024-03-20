defmodule Buildel.Blocks.Fields.EditorField do
  use Ecto.Schema
  alias __MODULE__
  import Ecto.Changeset

  @primary_key false
  embedded_schema do
    field :title, :string
    field :description, :string
    field :default, :string
    field :min_length, :integer, default: 0
    field :editor_language, Ecto.Enum, default: :custom, values: ~w(json custom)a
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
          min_length: field.min_length
        },
        opts
      )
    end
  end

  @type t :: %EditorField{}

  @create_fields ~w(title description default min_length editor_language)a
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
end
