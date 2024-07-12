defmodule BuildelWeb.GithubToken do
  def get_github_primary_email(token) do
    response =
      Req.new(url: "https://api.github.com/user/emails")
      |> Req.Request.put_header("Authorization", "Bearer #{token}")
      |> Req.get()

    case response do
      {:ok, %Req.Response{status: 200, body: body}} ->
        email = body |> Enum.find(&(&1["primary"] == true)) |> Map.get("email")
        {:ok, email}

      _ ->
        {:error, :failed_to_get_email}
    end
  end
end
