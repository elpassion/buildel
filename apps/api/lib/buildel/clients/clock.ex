defmodule Buildel.Clients.Clock do
  def utc_now(calendar_or_time_unit \\ Calendar.ISO) do
    DateTime.utc_now(calendar_or_time_unit)
  end
end
