defmodule Buildel.DocumentWorkflow.DocumentProcessor do
  defmodule Header do
    alias __MODULE__

    @type t :: %Header{
            id: binary(),
            value: binary(),
            level: integer(),
            metadata: map(),
            parent: integer(),
            next: integer(),
            previous: integer()
          }
    defstruct [:id, :value, :level, metadata: %{}, parent: nil, next: nil, previous: nil]
  end

  defmodule Paragraph do
    alias __MODULE__

    @type t :: %Paragraph{
            id: binary(),
            value: binary(),
            level: integer(),
            metadata: map(),
            parent: integer(),
            next: integer(),
            previous: integer()
          }
    defstruct [:id, :value, :level, :type, metadata: %{}, parent: nil, next: nil, previous: nil]
  end

  defmodule ListItem do
    alias __MODULE__

    @type t :: %ListItem{
            id: binary(),
            value: binary(),
            level: integer(),
            metadata: map(),
            parent: integer(),
            next: integer(),
            previous: integer()
          }
    defstruct [:id, :value, :level, :type, metadata: %{}, parent: nil, next: nil, previous: nil]
  end

  def load_file(
        %Buildel.DocumentWorkflow.DocumentLoader{adapter: document_loader},
        path,
        file_metadata
      ) do
    {:ok, result} =
      case document_loader.request(path, file_metadata) do
        {:ok, result} ->
          {:ok, result}

        :error ->
          document_loader.request(
            path,
            file_metadata |> Map.put(:encoding, "utf_8")
          )
      end

    {:ok, result}
  end

  def get_blocks(list) do
    list |> get_in(["return_dict", "result", "blocks"])
  end

  def filter_empty_blocks(list) do
    list |> Enum.filter(&Map.has_key?(&1, "sentences"))
  end

  @spec map_to_structures(list()) :: [Header.t() | Paragraph.t() | ListItem.t()]
  def map_to_structures(list) do
    Enum.map(
      list,
      fn item ->
        level =
          case item["level"] do
            false -> 0
            level -> level
          end

        case item["tag"] do
          "header" ->
            %Header{
              id: UUID.uuid4(),
              level: level,
              metadata: %{page: item["page_idx"]},
              value: Enum.join(item["sentences"], " ")
            }

          "para" ->
            %Paragraph{
              id: UUID.uuid4(),
              level: level,
              metadata: %{page: item["page_idx"]},
              value: Enum.join(item["sentences"], " ")
            }

          "list_item" ->
            %ListItem{
              id: UUID.uuid4(),
              level: level,
              metadata: %{page: item["page_idx"]},
              value: Enum.join(item["sentences"], " ")
            }
        end
      end
    )
  end

  @spec map_with_relations(list()) :: [Header.t() | Paragraph.t() | ListItem.t()]
  def map_with_relations(list) do
    {related_list, _new_parents_by_level, _new_previous_by_level, temp_next_updates} =
      Enum.reduce(list, {[], %{}, nil, %{}}, fn item,
                                                {acc, parents, previous_id, temp_next_updates} ->
        parent_id = Map.get(parents, item.level - 1)

        new_item =
          item
          |> Map.put(:parent, parent_id)
          |> Map.put(:previous, previous_id)

        new_parents = Map.put(parents, item.level, item.id)
        new_previous_id = item.id

        new_temp_next_updates =
          if previous_id,
            do: Map.put(temp_next_updates, previous_id, item.id),
            else: temp_next_updates

        {[new_item | acc], new_parents, new_previous_id, new_temp_next_updates}
      end)

    Enum.map(Enum.reverse(related_list), fn item ->
      next_id = Map.get(temp_next_updates, item.id)
      Map.put(item, :next, next_id)
    end)
  end

  @spec map_with_headers_metadata(list()) :: [Header.t() | Paragraph.t() | ListItem.t()]
  def map_with_headers_metadata(list) do
    structures_map = list_to_map(list)

    Enum.map(list, fn item ->
      parent_headers = get_parent_headers(item, structures_map, [])

      Map.put(item, :metadata, Map.put(item.metadata, :headers, parent_headers))
    end)
  end

  defp get_parent_headers(item, structures_map, list) do
    parent_id = item.parent

    if parent_id do
      parent = Map.get(structures_map, parent_id)

      case parent do
        %Header{} ->
          get_parent_headers(parent, structures_map, [parent.value | list])

        _ ->
          get_parent_headers(parent, structures_map, list)
      end
    else
      list
    end
  end

  defp list_to_map(list) do
    Enum.reduce(list, %{}, fn item, acc ->
      Map.put(acc, item.id, item)
    end)
  end

  # defp request(path, file_metadata) do
  #   Application.fetch_env!(:buildel, :document_loader).request(path, file_metadata)
  # end
end
