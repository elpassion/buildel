defmodule BuildelWeb.MembershipLiveTest do
  use BuildelWeb.ConnCase

  import Phoenix.LiveViewTest
  import Buildel.OrganizationsFixtures

  @invalid_attrs %{user_email: nil}

  defp create_membership(_) do
    another_membership = membership_fixture()
    membership = membership_fixture()
    %{membership: membership, another_membership: another_membership}
  end

  defp create_user(_) do
    user = Buildel.AccountsFixtures.user_fixture()
    %{user: user}
  end

  describe "Index" do
    setup [:create_membership, :create_user, :register_and_log_in_user]

    test "lists all memberships", %{conn: conn, membership: membership, another_membership: another_membership} do
      {:ok, _index_live, html} = live(conn, ~p"/organizations/#{membership.organization_id}/memberships")

      assert html =~ "Listing Memberships"
      assert !(html =~ another_membership.user.email)
    end

    test "saves new membership", %{conn: conn, membership: membership, user: user} do
      {:ok, index_live, _html} = live(conn, ~p"/organizations/#{membership.organization_id}/memberships")

      assert index_live |> element("a", "New Membership") |> render_click() =~
               "New Membership"

      assert_patch(index_live, ~p"/organizations/#{membership.organization_id}/memberships/new")

      assert index_live
             |> form("#membership-form", membership: @invalid_attrs)
             |> render_change() =~ "can&#39;t be blank"

      assert index_live
             |> form("#membership-form", membership: %{user_email: user.email})
             |> render_submit()

      assert_patch(index_live, ~p"/organizations/#{membership.organization_id}/memberships")

      html = render(index_live)
      assert html =~ "Membership created successfully"
    end

    test "deletes membership in listing", %{conn: conn, membership: membership} do
      {:ok, index_live, _html} = live(conn, ~p"/organizations/#{membership.organization_id}/memberships")

      assert index_live |> element("#memberships-#{membership.id} a", "Delete") |> render_click()
      refute has_element?(index_live, "#memberships-#{membership.id}")
    end
  end
end
