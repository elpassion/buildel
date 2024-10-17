defmodule Buildel.ClientMocks.Clock do
  use Buildel.ClientMocks.ClientMock

  def utc_now(calendar_or_time_unit \\ Calendar.ISO) do
    mock =
      get_mock(:utc_now) ||
        fn calendar_or_time_unit ->
          DateTime.utc_now(calendar_or_time_unit)
        end

    mock.(calendar_or_time_unit)
  end
end
