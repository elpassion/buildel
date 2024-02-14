defmodule Buildel.FileLoaderBehaviour do
  @callback load_file(String.t(), map()) :: {:ok, binary()}
end

defmodule Buildel.FileLoader do
  def load_file(path, file_metadata) do
    adapter().load_file(path, file_metadata)
  end

  def adapter do
    Application.fetch_env!(:buildel, :file_loader)
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
  require Logger
  @behaviour Buildel.FileLoaderBehaviour

  @impl true
  def load_file(path, file_metadata \\ %{}) do
    {:ok, result} =
      case request(path, file_metadata) do
        {:ok, result} -> {:ok, result}
        :error -> request(path, file_metadata |> Map.put(:encoding, "utf_8"))
      end

    partitioned_file = Jason.decode!(result)

    file =
      partitioned_file
      |> Enum.map(&Map.get(&1, "text"))
      |> Enum.join("")

    {:ok, file}
  end

  defp request(path, file_metadata) do
    headers = [{"unstructured-api-key", token()}, {"Content-Type", "multipart/form-data"}]

    options =
      case file_metadata |> Map.get(:type) do
        nil -> []
        type -> ["Content-Type": type]
      end

    file_data =
      {:file, path, {"form-data", [name: "files[]", filename: Path.basename(path)]}, options}

    form_data = [
      file_data,
      {"chunking_strategy", "by_title"},
      # {"strategy", "ocr_only"},
      {"max_characters", "1000"}
      # TODO: UNHARDCODE LANGUAGES
      # {"ocr_languages", "pol"}
    ]

    form_data =
      if file_metadata |> Map.has_key?(:encoding) do
        [{"encoding", file_metadata.encoding} | form_data]
      else
        form_data
      end

    with {:ok, %{body: result, status_code: 200}} <-
           HTTPoison.post(
             "https://grifel-8i70wllb.api.unstructuredapp.io/general/v0/general",
             {:multipart, form_data},
             headers,
             timeout: 60_000,
             recv_timeout: 60_000
           ) do
      {:ok, result}
    else
      error ->
        Logger.error(inspect(error))
        :error
    end
  end

  defp token do
    System.fetch_env!("UNSTRUCTURED_API_KEY")
  end
end
