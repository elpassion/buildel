defmodule BuildelWeb.OrganizationToolCrawlJSON do
  def sitemap(%{sitemap: sitemap}) do
    %{data: sitemap}
  end

  def show(%{crawls: crawls}) do
    %{data: crawls}
  end
end
