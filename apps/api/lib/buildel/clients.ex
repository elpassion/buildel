defmodule Buildel.Clients do
  alias Buildel.Clients.{
    Image,
    HttpApi,
    Clock,
    Secret,
    NewChat
  }

  alias Buildel.DocumentWorkflow

  @clients [
    image: Image,
    http_api: HttpApi,
    clock: Clock,
    document_workflow: DocumentWorkflow,
    secret: Secret,
    chat: NewChat
  ]

  def clients() do
    @clients
  end
end
