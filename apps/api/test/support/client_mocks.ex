defmodule Buildel.ClientMocks do
  alias Buildel.ClientMocks.{
    Image,
    HttpApi,
    Clock,
    DocumentWorkflow,
    Secret
  }

  @mocks [
    image: Image,
    http_api: HttpApi,
    clock: Clock,
    document_workflow: DocumentWorkflow,
    secret: Secret
  ]

  def mocks() do
    @mocks
  end
end
