defmodule Buildel.Langchain.TokenUsage do
  use Ecto.Schema
  import Ecto.Changeset

  alias LangChain.LangChainError
  alias __MODULE__

  @primary_key false
  embedded_schema do
    field :completion_tokens, :integer
    field :prompt_tokens, :integer
    field :total_tokens, :integer
  end

  @type t :: %TokenUsage{}

  @create_fields [
    :completion_tokens,
    :prompt_tokens,
    :total_tokens
  ]
  @required_fields [
    :completion_tokens,
    :prompt_tokens,
    :total_tokens
  ]

  @spec new(attrs :: map()) :: {:ok, t} | {:error, Ecto.Changeset.t()}
  def new(%{} = attrs \\ %{}) do
    %TokenUsage{}
    |> cast(attrs, @create_fields)
    |> validate_required(@required_fields)
    |> apply_action(:inserts)
  end

  @spec new!(attrs :: map()) :: t() | no_return()
  def new!(%{} = attrs \\ %{}) do
    case new(attrs) do
      {:ok, usage} -> usage
      {:error, changeset} -> raise LangChainError, changeset
    end
  end
end
