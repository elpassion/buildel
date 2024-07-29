defmodule Buildel.Datasets.DatasetFile do
  defmodule FileUpload do
    defstruct [:id, :status, :upload, :content, :rows, :metadata, :reason]

    def new(id, upload) do
      %FileUpload{
        id: id,
        status: :processing,
        upload: upload,
        rows: [],
        metadata:
          Buildel.FileLoader.file_properties(%{
            path: upload |> Map.get(:path),
            type: upload |> Map.get(:content_type, "csv"),
            name: upload |> Map.get(:filename)
          })
      }
    end

    def set_content(state, content) do
      %{state | content: content}
    end

    def success(state, rows) do
      %{state | status: :success, rows: rows}
    end

    def error(state, error) do
      %{state | status: :error, reason: error}
    end
  end

  defmodule State do
    defstruct files: %{}

    def new(files \\ %{}) do
      %State{files: files}
    end

    def add_file(%State{} = state, file) do
      %{state | files: state.files |> Map.put(file.file.id, file)}
    end

    def update_file(%State{} = state, file) do
      %{state | files: state.files |> Map.put(file.file.id, file)}
    end

    def remove_file(%State{} = state, file_id) do
      case state.files |> Map.get(file_id) do
        %{file: file} ->
          File.rm_rf!(file.upload |> Map.get(:path))

        _ ->
          nil
      end

      %{state | files: state.files |> Map.delete(file_id)}
    end
  end

  use GenServer

  def start_link(args) do
    GenServer.start_link(__MODULE__, args, name: __MODULE__)
  end

  def init(_args) do
    Process.flag(:max_heap_size, 0)
    {:ok, State.new(%{})}
  end

  def create(
        %Buildel.Organizations.Organization{} = organization,
        upload
      ) do
    id = UUID.uuid4()

    file = FileUpload.new(id, upload)

    :ok = GenServer.call(__MODULE__, {:process_file, organization.id, file})

    {:ok, file}
  end

  def get(file_id) do
    GenServer.call(__MODULE__, {:get_file, file_id})
  end

  def update_file(file) do
    GenServer.call(__MODULE__, {:update_file, file})
  end

  def handle_call({:get_file, file_id}, _from, state) do
    case state.files |> Map.get(file_id) do
      nil -> nil
      file -> file.file
    end
    |> then(&{:reply, {:ok, &1}, state})
  end

  def handle_call({:update_file, file}, _from, state) do
    Process.send_after(self(), {:remove_file, file.file.id}, 5 * 60_000)
    state |> State.update_file(file) |> then(&{:reply, :ok, &1})
  end

  def handle_call({:process_file, organization_id, file}, _from, state) do
    state
    |> State.add_file(%{
      organization_id: organization_id,
      file: file
    })
    |> then(fn state ->
      Task.start(fn ->
        case process_file(state.files |> Map.get(file.id)) do
          {:ok, file} ->
            update_file(file)
        end
      end)

      {:reply, :ok, state}
    end)
  end

  def handle_info({:remove_file, file_id}, state) do
    state
    |> State.remove_file(file_id)
    |> then(&{:noreply, &1})
  end

  defp process_file(%{organization_id: organization_id, file: file}) do
    with organization <- Buildel.Organizations.get_organization!(organization_id) do
      rows =
        File.stream!(file.upload.path)
        |> CSV.decode(headers: true)
        |> Stream.with_index()
        |> Enum.map(fn
          {{:ok, row_data}, index} ->
            %{
              index: index,
              data: row_data
            }

          _ ->
            nil
        end)

      file = FileUpload.success(file, rows)

      {:ok,
       %{
         organization_id: organization.id,
         file: file
       }}
    end
  end
end
