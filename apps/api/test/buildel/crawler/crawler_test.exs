defmodule Buildel.Crawler.CrawlerTest do
  use ExUnit.Case, async: true
  use ExVCR.Mock, adapter: ExVCR.Adapter.Hackney

  describe "crawl" do
    test "returns error when url is invalid" do
      assert Buildel.Crawler.crawl("invalid_url") == {:error, :invalid_url}
    end

    test "returns error when request fails" do
      use_cassette("crawler_http_fail") do
        assert Buildel.Crawler.crawl("http://nonexistentwebsite1234567890.com") ==
                 {:error, :request_failed}
      end
    end

    test "returns ok  when request succeeds" do
      use_cassette("crawler_http_example") do
        url = "http://example.com"
        assert {:ok, %{body: body, url: ^url}} = Buildel.Crawler.crawl(url)
        assert String.contains?(body, "<html>")
      end
    end
  end
end
