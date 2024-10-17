defmodule Buildel.Clients do
  alias Buildel.Clients.{
    Image,
    HttpApi,
    Clock
  }

  alias Buildel.DocumentWorkflow

  @clients [
    image: Image,
    http_api: HttpApi,
    clock: Clock,
    document_workflow: DocumentWorkflow
  ]

  def clients() do
    @clients
  end
end
