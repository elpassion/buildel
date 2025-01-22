defmodule Buildel.Blocks.TextToFile do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "text_to_file",
      description: "Used for converting text to a file.",
      groups: ["text"],
      inputs: [Block.text_input(), Block.text_input("file_name")],
      outputs: [Block.file_output()],
      ios: [],
      dynamic_ios: nil,
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "inputs", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => [],
            "properties" => %{
              "file_name" => %{
                "type" => "string",
                "title" => "File name",
                "description" => "Name of the file to save the text to. e.g. 'sample.txt'",
                "minLength" => 2,
                "readonly" => true,
                "default" => "sample.txt"
              }}
          })
      }
    }
  end

  @impl true
  def handle_input("input", {_name, :text, text, _metadata}, state) do
    state = send_stream_start(state, "output")

    file_name = Map.get(state, :file_name, state.opts.file_name)

    case convert_text_to_binary(text, %{file_name: file_name}) do
      {:ok, metadata} ->
        output(state, "output", {:binary, metadata.file_path}, %{metadata: metadata})
      {:error, reason} ->
        send_error(state, "Error saving text to file: #{reason}")
        state
      _ ->
        send_error(state, "Unknown error")
        state
    end
  end

  def handle_input("file_name", {_name, :text, text, _metadata}, state) do
    state |> Map.put(:file_name, text)
  end

  defp convert_text_to_binary(text, %{file_name: file_name} = opts) do
    case validate_file_name(file_name) do
      :ok ->
        try do
          {:ok, path} = Temp.path(suffix: file_name)
          File.write!(path, text)

          {:ok, %{file_name: file_name, file_path: path}}
        rescue
          exception ->
            {:error, exception.message}
        end

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp validate_file_name(file_name) do
    case Path.extname(file_name) do
      "" -> {:error, "File name must have a extension"}
      _ -> :ok
    end
  end
end
