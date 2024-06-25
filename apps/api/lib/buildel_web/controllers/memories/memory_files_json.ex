defmodule BuildelWeb.MemoryFilesJSON do
  def show(%{file: file}) do
    %{data: data(file)}
  end

  defp data(%{} = file) do
    %{
      id: file.id,
      status: file.status
    }
  end
end
