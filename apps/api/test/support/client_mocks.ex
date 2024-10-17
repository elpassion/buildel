defmodule Buildel.ClientMocks do
  alias Buildel.ClientMocks.{
    Image,
    HttpApi,
    Clock,
    DocumentWorkflow
  }

  @mocks [
    image: Image,
    http_api: HttpApi,
    clock: Clock,
    document_workflow: DocumentWorkflow
  ]

  def mocks() do
    @mocks
  end
end
