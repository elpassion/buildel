defmodule Buildel.Clients.Utils.Srt do
  defmacro __using__(_opts) do
    quote do
      import Buildel.Clients.Utils.Srt, only: [main: 1]
    end
  end

  def main(data) do
    data
    |> Enum.with_index(1)
    |> Enum.map(&format_sentence(&1))
    |> Enum.join("\n\n")
  end

  defp format_sentence({%{"start" => start, "end" => finish, "text" => text}, index}) do
    "#{index}\n#{format_srt_time(start)} --> #{format_srt_time(finish)}\n#{text}"
  end

  defp format_srt_time(seconds) do
    total_milliseconds = round(seconds * 1000)
    hours = div(total_milliseconds, 3_600_000)
    minutes = div(rem(total_milliseconds, 3_600_000), 60_000)
    secs = div(rem(total_milliseconds, 60_000), 1000)
    millisecs = rem(total_milliseconds, 1000)

    String.pad_leading(Integer.to_string(hours), 2, "0") <>
      ":" <>
      String.pad_leading(Integer.to_string(minutes), 2, "0") <>
      ":" <>
      String.pad_leading(Integer.to_string(secs), 2, "0") <>
      "," <>
      String.pad_leading(Integer.to_string(millisecs), 3, "0")
  end
end
