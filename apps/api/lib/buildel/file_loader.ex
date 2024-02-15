defmodule Buildel.FileLoaderBehaviour do
  @callback load_file(String.t(), map()) :: {:ok, binary()}
end

defmodule Buildel.FileLoader do
  def file_properties(%{path: path, type: type, name: name}) do
    file_name = name || Path.basename(path)
    file_size = File.stat!(path).size
    file_type = type || MIME.from_path(path)

    %{file_name: file_name, file_size: file_size, file_type: file_type}
  end

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

defmodule Buildel.FileLoaderNLMApiAdapter do
  require Logger
  @behaviour Buildel.FileLoaderBehaviour

  @impl true
  def load_file(path, file_metadata \\ %{}) do
    {:ok, result} =
      case request(path, file_metadata) do
        {:ok, result} -> {:ok, result}
        :error -> request(path, file_metadata |> Map.put(:encoding, "utf_8"))
      end

    partitioned_file =
      Jason.decode!(result)
      |> get_in(["return_dict", "result", "blocks"])

    %{text: file} =
      partitioned_file
      |> Enum.filter(&Map.has_key?(&1, "sentences"))
      |> Enum.reduce(
        %{text: "", current_level: 0},
        fn %{
             "sentences" => sentences,
             "tag" => tag,
             "level" => level
           },
           acc ->
          joiner =
            case {tag, level} do
              {"header", _level} ->
                "\n\n"

              {"para", _level} ->
                "\n"

              {"list_item", _level} ->
                "\n"

              {tag, _} ->
                Logger.warning("Unknown tag: #{tag}")
                " "
            end

          new_text = acc.text <> Enum.join(sentences, " ") <> joiner
          %{current_level: level, text: new_text}
        end
      )

    {:ok, file}
  end

  defp request(path, file_metadata) do
    headers = [{"Content-Type", "multipart/form-data"}]

    options =
      case file_metadata |> Map.get(:type) do
        nil -> []
        type -> ["Content-Type": type]
      end

    file_data =
      {:file, path, {"form-data", [name: "file", filename: Path.basename(path)]}, options}

    form_data = [file_data]

    form_data =
      if file_metadata |> Map.has_key?(:encoding) do
        [{"encoding", file_metadata.encoding} | form_data]
      else
        form_data
      end

    with {:ok, %{body: result, status_code: 200}} <-
           HTTPoison.post(
             "#{url()}/api/parseDocument?applyOcr=yes",
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

  defp url do
    Application.fetch_env!(:buildel, :nlm_api_url)
  end
end
