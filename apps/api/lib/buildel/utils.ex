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

  def parse_id(string) when is_nil(string) do
    {:ok, nil}
  end

  def parse_id(_), do: {:error, :invalid_id}

  defmacro success?(status_code) do
    quote do
      is_integer(unquote(status_code)) and unquote(status_code) >= 200 and
        unquote(status_code) < 400
    end
  end
end
