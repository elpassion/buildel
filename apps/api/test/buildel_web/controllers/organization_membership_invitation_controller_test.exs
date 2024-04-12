defmodule BuildelWeb.OrganizationMembershipInvitationControllerTest do
  use BuildelWeb.ConnCase, async: true
  import Buildel.OrganizationsFixtures
  alias Buildel.AccountsFixtures
  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok,
     conn:
       put_req_header(conn, "accept", "application/json")
       |> put_req_header("content-type", "application/json")}
  end

  setup [:register_and_log_in_user, :create_user_organization]

  describe "index" do
    test_requires_authentication %{conn: conn, organization: organization} do
      get(conn, ~p"/api/organizations/#{organization.id}/invitations")
    end

    test "lists all organization invitations", %{
      conn: conn,
      organization: organization,
      api_spec: api_spec
    } do
      {invitation, _} = invitation_fixture(%{organization_id: organization.id})

      conn = get(conn, ~p"/api/organizations/#{organization.id}/invitations")
      invitation_id = invitation.id
      email = invitation.email

      response = json_response(conn, 200)

      assert [
               %{"id" => ^invitation_id, "email" => ^email}
             ] = response["data"]

      assert_schema(response, "InvitationIndexResponse", api_spec)
    end
  end

  describe "create" do
    test_requires_authentication %{conn: conn, organization: organization} do
      post(conn, ~p"/api/organizations/#{organization.id}/invitations")
    end

    test "returns 422 if user already invited", %{
      conn: conn,
      organization: organization
    } do
      invitation_fixture(%{organization_id: organization.id, email: "already@invited.com"})

      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/invitations", %{
          email: "already@invited.com"
        })

      response = json_response(conn, 422)

      assert %{} != response["errors"]
    end

    test "returns 422 if user already in organization", %{
      conn: conn,
      organization: organization
    } do
      %{user: another_user} = create_user(%{})
      membership_fixture(%{user_id: another_user.id, organization_id: organization.id})

      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/invitations", %{
          email: another_user.email
        })

      response = json_response(conn, 422)

      assert %{} != response["errors"]
    end

    test "returns created invitation", %{
      conn: conn,
      organization: organization,
      api_spec: api_spec
    } do
      %{user: another_user} = create_user(%{})
      user_email = another_user.email

      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/invitations", %{
          email: another_user.email
        })

      response = json_response(conn, 201)

      assert %{
               "id" => _id,
               "email" => ^user_email
             } = response["data"]

      assert_schema(response, "InvitationShowResponse", api_spec)
    end

    test "returns created invitation if user does not exist", %{
      conn: conn,
      organization: organization,
      api_spec: api_spec
    } do
      user_email = "non_existing@mail.com"

      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/invitations", %{
          email: user_email
        })

      response = json_response(conn, 201)

      assert %{
               "id" => _id,
               "email" => ^user_email
             } = response["data"]

      assert_schema(response, "InvitationShowResponse", api_spec)
    end
  end

  describe "accept" do
    test_requires_authentication %{conn: conn} do
      post(conn, ~p"/api/organizations/invitations/accept?token=123")
    end

    test "returns ok if accepted", %{
      conn: conn,
      organization: organization
    } do
      log_out_user(conn)
      %{user: another_user} = create_user(%{})
      conn = log_in_user(conn, another_user)

      {_invitation, encoded_token} =
        invitation_fixture(%{organization_id: organization.id, email: another_user.email})

      conn =
        post(conn, ~p"/api/organizations/invitations/accept?token=#{encoded_token}")

      assert json_response(conn, 200)
    end

    test "returns email mismatch error", %{
      conn: conn,
      organization: organization
    } do
      log_out_user(conn)
      %{user: another_user} = create_user(%{})
      conn = log_in_user(conn, another_user)

      {_invitation, encoded_token} =
        invitation_fixture(%{organization_id: organization.id, email: "wrong@mail.com"})

      conn =
        post(conn, ~p"/api/organizations/invitations/accept?token=#{encoded_token}")

      response = json_response(conn, 422)

      assert %{
               "invitation.email" => ["Email mismatch."]
             } = response["errors"]
    end

    test "returns invitation expired error", %{
      conn: conn,
      organization: organization
    } do
      log_out_user(conn)
      %{user: another_user} = create_user(%{})
      conn = log_in_user(conn, another_user)

      {_invitation, encoded_token} =
        invitation_fixture(%{
          organization_id: organization.id,
          email: another_user.email,
          expires_at: DateTime.utc_now() |> DateTime.add(-1, :day) |> DateTime.truncate(:second)
        })

      conn =
        post(conn, ~p"/api/organizations/invitations/accept?token=#{encoded_token}")

      response = json_response(conn, 422)

      assert %{
               "invitation.token" => ["Invitation expired."]
             } = response["errors"]
    end
  end

  describe "delete" do
    test_requires_authentication %{conn: conn, organization: organization} do
      delete(conn, ~p"/api/organizations/#{organization.id}/invitations/123")
    end

    test "returns no content if deleted", %{
      conn: conn,
      organization: organization
    } do
      email = AccountsFixtures.unique_user_email()

      {invitation, _encoded_token} =
        invitation_fixture(%{organization_id: organization.id, email: email})

      conn =
        delete(conn, ~p"/api/organizations/#{organization.id}/invitations/#{invitation.id}")

      assert response(conn, 204)
    end
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    %{organization: organization}
  end

  defp create_user(_) do
    user = AccountsFixtures.user_fixture()
    %{user: user}
  end
end
