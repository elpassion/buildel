defmodule Buildel.JQ do
  require Logger

  def query(payload, jquery) do
    {:ok, tmp_path} = Temp.path()
    :ok = File.write(tmp_path, payload) |> IO.inspect(label: "path")

    try do
      case System.cmd("jq", ["-c", "-r", jquery, tmp_path]) do
        {shortened_payload, 0} -> {:ok, shortened_payload}
        {"", 3} -> {:error, :failed_to_parse_message}
        {"", 5} -> {:error, :failed_to_parse_message}
      end
    catch
      _ -> {:error, :failed_to_parse_message}
    after
      File.rm!(tmp_path)
    end
  end

  def query!(payload, query, options \\ [])

  @spec query!(String.t(), String.t(), list()) :: any()
  def query!(payload, jquery, _options) do
    case query(payload, jquery) do
      {:ok, shortened_payload} ->
        shortened_payload

      {:error, _reason} ->
        payload
    end
  end
end
