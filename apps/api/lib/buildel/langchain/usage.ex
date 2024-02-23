defmodule Buildel.Langchain.TokenUsage do
  use Ecto.Schema
  import Ecto.Changeset

  alias LangChain.LangChainError
  alias __MODULE__

  @primary_key false
  embedded_schema do
    field :completion_tokens, :integer, default: 0
    field :prompt_tokens, :integer, default: 0
    field :total_tokens, :integer, default: 0
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

  @spec add(usage :: t(), another_usage :: t()) :: t()
  def add(usage, another_usage) do
    %TokenUsage{
      completion_tokens: usage.completion_tokens + another_usage.completion_tokens,
      prompt_tokens: usage.prompt_tokens + another_usage.prompt_tokens,
      total_tokens: usage.total_tokens + another_usage.total_tokens
    }
  end
end
