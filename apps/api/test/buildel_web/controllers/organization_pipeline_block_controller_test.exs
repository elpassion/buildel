defmodule BuildelWeb.OrganizationPipelineBlockControllerTest do
  use BuildelWeb.ConnCase
  import Buildel.OrganizationsFixtures
  import Buildel.PipelinesFixtures

  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok,
     conn:
       put_req_header(conn, "accept", "application/json")
       |> put_req_header("content-type", "application/json")}
  end

  setup [
    :register_and_log_in_user,
    :create_user_organization,
    :create_pipeline
  ]

  describe "create" do
    test_requires_authentication %{conn: conn, organization: organization, pipeline: pipeline} do
      post(conn, ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/blocks", %{
        block: %{
          name: "block",
          type: "text_input",
          opts: %{}
        }
      })
    end

    test "requires organization membership", %{conn: conn, another_pipeline: pipeline} do
      conn =
        post(
          conn,
          ~p"/api/organizations/#{pipeline.organization_id}/pipelines/#{pipeline}/blocks",
          %{
            block: %{
              name: "block",
              type: "text_input",
              opts: %{}
            }
          }
        )

      assert json_response(conn, 404)
    end

    test "creates a block", %{conn: conn, organization: organization, pipeline: pipeline} do
      conn =
        post(conn, ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/blocks", %{
          block: %{
            name: "block",
            type: "text_input",
            opts: %{}
          }
        })

      assert json_response(conn, 201)
    end
  end

  defp create_pipeline(%{organization: organization}) do
    pipeline = pipeline_fixture(%{organization_id: organization.id})
    another_pipeline = pipeline_fixture()
    %{pipeline: pipeline, another_pipeline: another_pipeline}
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    %{organization: organization}
  end
end
