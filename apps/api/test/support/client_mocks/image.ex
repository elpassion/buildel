defmodule Buildel.ClientMocks.Image do
  use Buildel.ClientMocks.ClientMock

  def generate_image(opts) do
    get_mock(:generate_image).(opts)
  end
end
