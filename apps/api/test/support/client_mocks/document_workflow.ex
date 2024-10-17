defmodule Buildel.ClientMocks.DocumentWorkflow do
  alias Buildel.ClientMocks.ClientMock
  use ClientMock

  def get_content(path, metadata) do
    get_mock(:get_content).(path, metadata)
  end
end
