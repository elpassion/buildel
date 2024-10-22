defmodule BuildelWeb.OrganizationSubscriptionsControllerTest do
  use BuildelWeb.ConnCase, async: true
  import Buildel.OrganizationsFixtures
  import Buildel.SubscriptionsFixtures

  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok,
     conn:
       conn
       |> put_req_header("accept", "application/json")
       |> put_req_header("content-type", "application/json")}
  end

  setup [
    :register_and_log_in_user,
    :create_user_organization
  ]

  describe "show" do
    test_requires_authentication %{conn: conn, organization: organization} do
      get(conn, ~p"/api/organizations/#{organization}/subscriptions")
    end

    test "requires organization membership", %{
      conn: conn,
      another_organization: organization
    } do
      conn =
        get(conn, ~p"/api/organizations/#{organization}/subscriptions")

      assert json_response(conn, 404)
    end

    test "shows free plan if no other subscription", %{
      conn: conn,
      organization: organization,
      api_spec: api_spec
    } do
      conn =
        get(conn, ~p"/api/organizations/#{organization}/subscriptions")

      response = json_response(conn, 200)

      assert_schema(response, "SubscriptionShowPlanResponse", api_spec)
    end

    test "shows and renews free local subscription if it's expired", %{
      conn: conn,
      organization: organization,
      api_spec: api_spec
    } do
      old_date = DateTime.utc_now() |> DateTime.add(-1, :day)

      subscription =
        change_subscription_expiration_date(
          organization.id,
          old_date
        )

      conn =
        get(conn, ~p"/api/organizations/#{organization}/subscriptions")

      response = json_response(conn, 200)

      {:ok, new_date, _} = DateTime.from_iso8601(response["data"]["end_date"])

      assert DateTime.after?(
               new_date,
               DateTime.utc_now()
             )

      assert_schema(response, "SubscriptionShowPlanResponse", api_spec)
    end
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    another_organization = organization_fixture(%{name: "another_organization"})
    %{organization: organization, another_organization: another_organization}
  end
end
