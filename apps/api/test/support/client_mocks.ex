defmodule Buildel.ClientMocks do
  alias Buildel.ClientMocks.{
    Image,
    HttpApi,
    Clock,
    DocumentWorkflow,
    Secret,
    Chat
  }

  @mocks [
    image: Image,
    http_api: HttpApi,
    clock: Clock,
    document_workflow: DocumentWorkflow,
    secret: Secret,
    chat: Chat
  ]

  def mocks() do
    @mocks
  end
end
