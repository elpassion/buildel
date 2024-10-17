defmodule Buildel.ClientMocks.Secret do
  use Buildel.ClientMocks.ClientMock

  def secret_from_context(context, secret_name) do
    get_mock(:secret_from_context).(context, secret_name)
  end
end
