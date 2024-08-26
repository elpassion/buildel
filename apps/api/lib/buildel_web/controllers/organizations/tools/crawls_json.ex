defmodule BuildelWeb.OrganizationToolCrawlJSON do
  def sitemap(%{sitemap: sitemap}) do
    %{data: sitemap}
  end

  def show(%{crawls: crawls}) do
    %{data: crawls}
  end

  def show_crawls(%{tasks: tasks}) do
    %{data: Enum.map(tasks, fn {_, _, url} -> url end)}
  end
end
