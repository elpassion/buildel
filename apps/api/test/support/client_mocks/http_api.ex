defmodule Buildel.ClientMocks.HttpApi do
  use Buildel.ClientMocks.ClientMock

  def request(%Req.Request{} = request) do
    mock = get_mock(:request)
    mock.(request)
  end
end
