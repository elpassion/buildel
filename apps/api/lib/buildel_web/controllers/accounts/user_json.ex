defmodule BuildelWeb.UserJSON do
  alias Buildel.Accounts.User

  def show(%{user: user}) do
    %{data: data(user)}
  end

  defp data(%User{} = user) do
    %{
      id: user.id,
      marketing_agreement: user.marketing_agreement
    }
  end
end
