defmodule BuildelWeb.CollectionGraphJSON do
  def show(%{nodes: nodes}) do
    %{data: data(nodes)}
  end

  defp data(nodes) do
    %{
      nodes: [
        %{
          id: "1234-1234-1234-1234",
          memory_id: 2,
          point: [1.0, 2.0],
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        },
        %{
          id: "1234-1234-1234-1235",
          memory_id: 2,
          point: [2.0, 3.0],
          content: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        %{
          id: "1234-1234-1234-1236",
          memory_id: 2,
          point: [3.0, 4.0],
          content:
            "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        },
        %{
          id: "1234-1234-1234-1237",
          memory_id: 2,
          point: [4.0, 5.0],
          content:
            "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
        },
        %{
          id: "1234-1234-1234-1238",
          memory_id: 1,
          point: [5.0, 6.0],
          content:
            "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        %{
          id: "1234-1234-1234-1239",
          memory_id: 1,
          point: [6.0, 7.0],
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        %{
          id: "1234-1234-1234-1240",
          memory_id: 1,
          point: [7.0, 8.0],
          content:
            "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        },
        %{
          id: "1234-1234-1234-1241",
          memory_id: 1,
          point: [8.0, 9.0],
          content:
            "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
        }
      ]
    }
  end
end
