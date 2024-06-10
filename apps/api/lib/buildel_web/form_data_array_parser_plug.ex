defmodule BuildelWeb.FormDataArrayParserPlug do
  @behaviour Plug

  @impl true
  def init(opts), do: opts

  @impl true
  def call(conn, _opts) do
    if conn.req_headers
       |> Enum.any?(fn {k, v} ->
         k == "content-type" && String.starts_with?(v, "multipart/form-data")
       end) do
      parse_form_data_arrays(conn)
    else
      conn
    end
  end

  defp parse_form_data_arrays(conn) do
    parsed_body_params =
      conn.body_params
      |> Map.to_list()
      |> Enum.reduce(%{}, fn {field, value}, acc ->
        case value do
          value when is_struct(value) ->
            Map.put(acc, field, value)

          value when is_map(value) ->
            is_not_fully_array =
              value
              |> Map.keys()
              |> Enum.map(&Integer.parse/1)
              |> Enum.any?(&(&1 == :error))

            if is_not_fully_array do
              Map.put(acc, field, value)
            else
              Map.put(acc, field, value |> Enum.map(fn {_k, v} -> v end))
            end

          value ->
            Map.put(acc, field, value)
        end
      end)

    conn
    |> Map.put(:body_params, parsed_body_params)
  end
end
