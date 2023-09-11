defmodule Buildel.Utils do
  def parse_id(string) when is_integer(string) do
    string
  end

  def parse_id(string) when is_binary(string) do
    case Integer.parse(string) do
      {int, ""} when is_number(int) -> {:ok, int}
      _ -> {:error, :invalid_id}
    end
  end

  def parse_id(_), do: {:error, :invalid_id}
end
