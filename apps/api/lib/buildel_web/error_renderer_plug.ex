defmodule BuildelWeb.ErrorRendererPlug do
  @behaviour Plug

  import Plug.Conn
  alias OpenApiSpex.OpenApi

  @impl true
  def init(errors), do: errors

  @impl true
  def call(conn, errors) when is_list(errors) do
    errors =
      errors
      |> Enum.reduce(%{}, fn error, acc ->
        add_error(acc, error.path, error)
      end)

    response = %{
      errors: errors
    }

    json = OpenApi.json_encoder().encode!(response)

    conn
    |> put_resp_content_type("application/json")
    |> send_resp(422, json)
  end

  defp add_error(errors, [], error) do
    Map.update(errors, :global, [to_string(error)], &(&1 ++ [to_string(error)]))
  end

  defp add_error(errors, [path], error) do
    Map.update(errors, path, [to_string(error)], &(&1 ++ [to_string(error)]))
  end

  defp add_error(errors, [path | rest], error) do
    Map.update(errors, path, add_error(%{}, rest, error), &add_error(&1, rest, error))
  end
end
