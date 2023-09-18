defmodule Buildel.FileLoaderBehaviour do
  @callback load_file(String.t(), map()) :: {:ok, binary()}
end

defmodule Buildel.FileLoader do
  def load_file(path, file_metadata) do
    adapter().load_file(path, file_metadata)
  end

  def adapter do
    Application.get_env(:bound, :file_loader, Buildel.FileLoaderUnstructuredApiAdapter)
  end
end

defmodule Buildel.FileLoaderRawAdapter do
  @behaviour Buildel.FileLoaderBehaviour

  @impl true
  def load_file(path, _file_metadata \\ %{}) do
    File.read(path)
  end
end

defmodule Buildel.FileLoaderUnstructuredLocalAdapter do
  @behaviour Buildel.FileLoaderBehaviour

  @impl true
  def load_file(path, _file_metadata \\ %{}) do
    {:ok, partitioned_file} =
      Buildel.PythonWorker.partition_file(path)

    file =
      partitioned_file
      |> Enum.map(&Map.get(&1, "text"))
      |> Enum.join("\n\n")

    {:ok, file}
  end
end

defmodule Buildel.FileLoaderUnstructuredApiAdapter do
  @behaviour Buildel.FileLoaderBehaviour

  @impl true
  def load_file(path, file_metadata \\ %{}) do
    headers = [{"unstructured-api-key", token()}, {"Content-Type", "multipart/form-data"}]

    options =
      case file_metadata |> Map.get(:type) do
        nil -> []
        type -> ["Content-Type": type]
      end

    {:ok, %{body: result}} =
      HTTPoison.post(
        "https://api.unstructured.io/general/v0/general",
        {:multipart,
         [
           {:file, path, {"form-data", [name: "files[]", filename: Path.basename(path)]},
            options},
           {"chunking_strategy", "by_title"}
         ]},
        headers,
        timeout: 60_000,
        recv_timeout: 60_000
      )

    partitioned_file = Jason.decode!(result)

    file =
      partitioned_file
      |> Enum.map(&Map.get(&1, "text"))
      |> Enum.join("\n\n")

    {:ok, file}
  end

  defp token do
    System.get_env("UNSTRUCTURED_API_KEY")
  end
end
