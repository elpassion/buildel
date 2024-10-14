defmodule Buildel.Clients.HttpApi do
  def request(%Req.Request{} = request) do
    Req.request(request)
  end
end
