defmodule Buildel.JQ do
  require Logger

  def query!(payload, query, options \\ [])

  @spec query!(String.t(), String.t(), list()) :: any()
  def query!(payload, query, _options) do
    {:ok, tmp_path} = Temp.path()
    File.write!(tmp_path, payload)

    try do
      case System.cmd("jq", ["-c", "-r", query, tmp_path]) do
        {shortened_payload, 0} -> shortened_payload
        {"", 3} -> payload
        {"", 5} -> payload
      end
    after
      File.rm!(tmp_path)
    end
  end
end
