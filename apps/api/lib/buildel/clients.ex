defmodule Buildel.Clients do
  alias Buildel.Clients.{
    Image,
    HttpApi,
    Clock,
    Secret,
    NewChat,
    Memory
  }

  alias Buildel.DocumentWorkflow

  @clients [
    image: Image,
    http_api: HttpApi,
    clock: Clock,
    document_workflow: DocumentWorkflow,
    secret: Secret,
    chat: NewChat,
    memory: Memory
  ]

  def clients() do
    @clients
  end
end
