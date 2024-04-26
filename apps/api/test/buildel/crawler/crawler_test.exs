defmodule Buildel.Crawler.CrawlerTest do
  use ExUnit.Case, async: true

  describe "crawl" do
    test "returns error when url is invalid" do
      assert Buildel.Crawler.crawl("invalid_url") == {:error, :invalid_url}
    end

    test "returns error when request fails" do
      assert Buildel.Crawler.crawl("http://nonexistentwebsite1234567890.com") ==
               {:error, :request_failed}
    end
  end
end
