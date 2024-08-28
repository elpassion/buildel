defmodule Buildel.Sitemaps do
  require Logger
  alias Req.Response
  import SweetXml

  def get_sitemaps(url) do
    with {:ok, sitemaps} <- fetch_robots_sitemaps(url) do
      fetch_sitemaps_recursive(sitemaps)
    else
      _ ->
        case fetch_sitemap(url) do
          {:ok, sitemap} -> {:ok, sitemap}
          error -> error
        end
    end
  end

  defp fetch_robots_sitemaps(url) do
    uri = URI.parse(url) |> URI.merge("/robots.txt")

    case Req.get(uri) do
      {:ok, %Response{status: 200, body: body}} ->
        sitemaps =
          body
          |> String.split("\n")
          |> Enum.filter(fn line -> String.starts_with?(String.downcase(line), "sitemap:") end)
          |> Enum.map(fn line ->
            String.trim(String.replace(line, "Sitemap:", "", global: true))
          end)

        if sitemaps == [] do
          {:error, :no_sitemaps_found}
        else
          {:ok, sitemaps}
        end

      {:ok, %Response{}} ->
        {:error, :no_robots_found}

      error ->
        error
    end
  end

  defp fetch_sitemaps_recursive(sitemaps) do
    Enum.reduce_while(sitemaps, {:ok, []}, fn sitemap_url, {:ok, acc} ->
      case fetch_sitemap(sitemap_url) do
        {:ok, sitemap_urls} ->
          {:cont, {:ok, acc ++ sitemap_urls}}

        {:error, _} = error ->
          {:halt, error}
      end
    end)
  end

  defp fetch_sitemap(url) do
    uri = URI.parse(url)

    case Req.get(uri) do
      {:ok, %Response{status: 200, body: body}} ->
        sitemap_type = detect_sitemap_type(body)

        case sitemap_type do
          :sitemap_index ->
            nested_sitemaps =
              body
              |> xpath(~x"//sitemap/loc/text()"l)
              |> Enum.map(&to_string/1)

            fetch_sitemaps_recursive(nested_sitemaps)

          :sitemap ->
            urls =
              body
              |> xpath(~x"//url/loc/text()"l)
              |> Enum.map(&to_string/1)

            {:ok, urls}

          :unknown ->
            Logger.debug("Unknown sitemap type at #{url}")
            {:error, :unknown_sitemap_type}
        end

      {:ok, %Response{status: 404}} ->
        Logger.debug("Sitemap not found at #{url}")
        {:error, :sitemap_not_found}

      error ->
        Logger.debug("Failed to fetch sitemap at #{url}: #{inspect(error)}")
        error
    end
  end

  defp detect_sitemap_type(body) do
    if String.contains?(body, "<sitemapindex") do
      :sitemap_index
    else
      if String.contains?(body, "<urlset") do
        :sitemap
      else
        :unknown
      end
    end
  end
end
