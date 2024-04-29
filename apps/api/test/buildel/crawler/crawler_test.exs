defmodule Buildel.Crawler.CrawlerTest do
  alias Buildel.Crawler.Page
  alias Buildel.Crawler.Crawl
  use ExUnit.Case, async: true
  use ExVCR.Mock, adapter: ExVCR.Adapter.Hackney

  describe "crawl" do
    test "returns error when url is invalid" do
      assert {:error,
              %Crawl{
                id: _,
                start_url: "invalid_url",
                status: :error,
                error: :invalid_url
              }} = Buildel.Crawler.crawl("invalid_url")
    end

    test "returns error when request fails" do
      use_cassette("crawler_http_fail") do
        assert {:error,
                %Crawl{
                  id: _,
                  start_url: "http://nonexistentwebsite1234567890.com",
                  status: :error,
                  error: :not_all_pages_successful,
                  pages: [
                    %Buildel.Crawler.Page{
                      status: :error,
                      url: "http://nonexistentwebsite1234567890.com",
                      error: :request_failed
                    }
                  ]
                }} = Buildel.Crawler.crawl("http://nonexistentwebsite1234567890.com")
      end
    end

    test "returns ok  when request succeeds" do
      use_cassette("crawler_http_example") do
        url = "http://example.com"

        assert {:ok,
                %Crawl{
                  id: _,
                  start_url: ^url,
                  status: :success,
                  error: nil,
                  pages: [%Page{url: ^url, body: body}]
                }} =
                 Buildel.Crawler.crawl(url)

        assert String.contains?(body, "<html>")
      end
    end

    test "crawls nested pages when depth is greater than 0" do
      use_cassette("crawler_nested_http_example") do
        url = "https://example.com"

        assert {:ok,
                %Crawl{
                  id: _,
                  start_url: ^url,
                  status: :success,
                  error: nil,
                  pages: [
                    %Page{url: ^url, body: body},
                    %Page{url: "https://www.iana.org/domains/example", body: body2}
                  ]
                }} =
                 Buildel.Crawler.crawl(url, max_depth: 2)

        assert String.contains?(body, "<html>")
        assert String.contains?(body2, "<html>")
      end
    end
  end
end
