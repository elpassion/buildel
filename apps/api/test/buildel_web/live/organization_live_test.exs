defmodule BuildelWeb.OrganizationLiveTest do
  use BuildelWeb.ConnCase

  import Phoenix.LiveViewTest
  import Buildel.OrganizationsFixtures

  @create_attrs %{name: "some name"}
  @update_attrs %{name: "some updated name"}
  @invalid_attrs %{name: nil}

  defp create_organization(%{ user: user }) do
    another_organization = organization_fixture(%{name: "another name"})
    membership = membership_fixture(%{ user_id: user.id })
    organization = membership |> Map.get(:organization_id) |> Buildel.Organizations.get_organization!
    %{organization: organization, another_organization: another_organization}
  end

  describe "Unauthorized" do
    test "Index redirects to login page", %{conn: conn} do
      assert {:error, redirect} = live(conn, ~p"/organizations")

      assert {:redirect, %{to: path, flash: flash}} = redirect
      assert path == ~p"/users/log_in"
      assert %{"error" => "You must log in to access this page."} = flash
    end

    test "Show redirects to login page", %{conn: conn} do
      assert {:error, redirect} = live(conn, ~p"/organizations/1")

      assert {:redirect, %{to: path, flash: flash}} = redirect
      assert path == ~p"/users/log_in"
      assert %{"error" => "You must log in to access this page."} = flash
    end

    test "New redirects to login page", %{conn: conn} do
      assert {:error, redirect} = live(conn, ~p"/organizations/new")

      assert {:redirect, %{to: path, flash: flash}} = redirect
      assert path == ~p"/users/log_in"
      assert %{"error" => "You must log in to access this page."} = flash
    end

    test "Edit redirects to login page", %{conn: conn} do
      assert {:error, redirect} = live(conn, ~p"/organizations/1/edit")

      assert {:redirect, %{to: path, flash: flash}} = redirect
      assert path == ~p"/users/log_in"
      assert %{"error" => "You must log in to access this page."} = flash
    end

    test "Show Edit redirects to login page", %{conn: conn} do
      assert {:error, redirect} = live(conn, ~p"/organizations/1/show/edit")

      assert {:redirect, %{to: path, flash: flash}} = redirect
      assert path == ~p"/users/log_in"
      assert %{"error" => "You must log in to access this page."} = flash
    end
  end

  describe "Index" do
    setup [:register_and_log_in_user, :create_organization]

    test "lists all user organizations", %{conn: conn, organization: organization, another_organization: another_organization} do
      {:ok, _index_live, html} = live(conn, ~p"/organizations")

      assert html =~ "Listing Organizations"
      assert html =~ organization.name
      assert !(html =~ another_organization.name)
    end

    test "saves new organization", %{conn: conn} do
      {:ok, index_live, _html} = live(conn, ~p"/organizations")

      assert index_live |> element("a", "New Organization") |> render_click() =~
               "New Organization"

      assert_patch(index_live, ~p"/organizations/new")

      assert index_live
             |> form("#organization-form", organization: @invalid_attrs)
             |> render_change() =~ "can&#39;t be blank"

      assert index_live
             |> form("#organization-form", organization: @create_attrs)
             |> render_submit()

      assert_patch(index_live, ~p"/organizations")

      html = render(index_live)
      assert html =~ "Organization created successfully"
      assert html =~ "some name"
    end

    test "updates organization in listing", %{conn: conn, organization: organization} do
      {:ok, index_live, _html} = live(conn, ~p"/organizations")

      assert index_live |> element("#organizations-#{organization.id} a", "Edit") |> render_click() =~
               "Edit Organization"

      assert_patch(index_live, ~p"/organizations/#{organization}/edit")

      assert index_live
             |> form("#organization-form", organization: @invalid_attrs)
             |> render_change() =~ "can&#39;t be blank"

      assert index_live
             |> form("#organization-form", organization: @update_attrs)
             |> render_submit()

      assert_patch(index_live, ~p"/organizations")

      html = render(index_live)
      assert html =~ "Organization updated successfully"
      assert html =~ "some updated name"
    end

    test "deletes organization in listing", %{conn: conn, organization: organization} do
      {:ok, index_live, _html} = live(conn, ~p"/organizations")

      assert index_live |> element("#organizations-#{organization.id} a", "Delete") |> render_click()
      refute has_element?(index_live, "#organizations-#{organization.id}")
    end
  end

  describe "Show" do
    setup [:register_and_log_in_user, :create_organization]

    test "displays organization", %{conn: conn, organization: organization} do
      {:ok, _show_live, html} = live(conn, ~p"/organizations/#{organization}")

      assert html =~ "Show Organization"
      assert html =~ organization.name
    end

    test "updates organization within modal", %{conn: conn, organization: organization} do
      {:ok, show_live, _html} = live(conn, ~p"/organizations/#{organization}")

      assert show_live |> element("a", "Edit") |> render_click() =~
               "Edit Organization"

      assert_patch(show_live, ~p"/organizations/#{organization}/show/edit")

      assert show_live
             |> form("#organization-form", organization: @invalid_attrs)
             |> render_change() =~ "can&#39;t be blank"

      assert show_live
             |> form("#organization-form", organization: @update_attrs)
             |> render_submit()

      assert_patch(show_live, ~p"/organizations/#{organization}")

      html = render(show_live)
      assert html =~ "Organization updated successfully"
      assert html =~ "some updated name"
    end
  end
end
