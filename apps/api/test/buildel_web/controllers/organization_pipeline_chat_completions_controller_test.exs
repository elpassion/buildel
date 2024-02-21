defmodule BuildelWeb.OrganizationPipelineChatCompletionsControllerTest do
  use BuildelWeb.ConnCase
  import Buildel.OrganizationsFixtures
  import Buildel.PipelinesFixtures

  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  @valid_params %{
    model: "pipeline",
    messages: [
      %{role: "user", content: "Hello"},
      %{role: "bot", content: "Hi"}
    ]
  }

  setup [
    :register_and_log_in_user,
    :create_user_organization,
    :create_pipeline,
    :create_alias
  ]

  describe "create" do
    test "requires authentication", %{conn: conn, organization: organization, pipeline: pipeline} do
      conn = conn |> log_out_user()

      conn =
        post(conn, ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/chat/completions")

      assert json_response(conn, 401)["errors"] != %{}
    end

    test "does not allow access to other organizations", %{
      conn: conn
    } do
      other_organization = organization_fixture()
      other_pipeline = pipeline_fixture(%{organization_id: other_organization.id})

      conn =
        post(
          conn,
          ~p"/api/organizations/#{other_organization}/pipelines/#{other_pipeline}/chat/completions",
          @valid_params
        )

      assert json_response(conn, 404)
    end

    test "validates params", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline
    } do
      conn =
        post(
          conn,
          ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/chat/completions",
          %{}
        )

      assert json_response(conn, 422)["errors"] != %{}
    end

    test "creates a chat completion", %{
      conn: conn,
      organization: organization,
      pipeline: pipeline
    } do
      conn =
        post(
          conn,
          ~p"/api/organizations/#{organization}/pipelines/#{pipeline}/chat/completions",
          @valid_params
        )

      assert json_response(conn, 201) == %{}
    end
  end

  defp create_pipeline(%{organization: organization}) do
    pipeline =
      pipeline_fixture(%{
        organization_id: organization.id,
        config: %{
          "version" => "3",
          "blocks" => [
            %{
              "name" => "chat_block",
              "type" => "chat",
              "opts" => %{
                "prompt_template" => "Hello, how can I help you?",
                "api_key" => "some_api_key",
                "system_message" => "Hi, I'm a bot!",
                "messages" => []
              },
              "ios" => []
            }
          ],
          "connections" => []
        },
        interface_config: %{
          "chat" => "chat_block"
        }
      })

    %{pipeline: pipeline}
  end

  defp create_alias(%{pipeline: pipeline}) do
    alias = alias_fixture(%{pipeline_id: pipeline.id})
    %{alias: alias}
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    %{organization: organization}
  end
end
