defmodule BuildelWeb.OrganizationToolCrawlJSON do
  def show(%{crawls: crawls}) do
    %{data: crawls}
  end
end
