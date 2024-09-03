defmodule BuildelWeb.WorkflowTemplateControllerTest do
  use BuildelWeb.ConnCase, async: true

  import Buildel.OrganizationsFixtures

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
      get(conn, ~p"/api/organizations/#{organization.id}/workflow_templates")
    end

    test "returns list of workflow templates", %{
      conn: conn,
      api_spec: api_spec,
      organization: organization
    } do
      conn = get(conn, ~p"/api/organizations/#{organization.id}/workflow_templates")

      response = json_response(conn, 200)

      assert [
               %{"name" => "AI Chat", "template_name" => "ai_chat", "template_description" => "Basic workflow with any of supported models"},
               %{"name" => "Speech To Text", "template_name" => "speech_to_text", "template_description" => "Allows to upload audio file and receive transcription"},
               %{"name" => "Text To Speech", "template_name" => "text_to_speech", "template_description" => "Allows to generate audio files from provided text"},
               %{
                 "name" => "Knowledge Search To Text",
                 "template_name" => "knowledge_search_to_text",
                 "template_description" => "Allows to analyse given documents and receive i.e. summary or answer questions"
               },
               %{"name" => "Spreadsheet AI Assistant", "template_description" => "Interact with a spreadsheet database using plain language. No need for SQL", "template_name" => "spreadsheet_ai_assistant"},
               %{"name" => "Text Classification", "template_description" => "Text classifier assistant that convert text into one or more categories", "template_name" => "text_classification_assistant"},
               %{"name" => "Feedback Assistant", "template_description" => "Text feedback assistant that analyze the provided text and provide feedback", "template_name" => "text_feedback_assistant"},
               %{"name" => "SEO Image for Article", "template_description" => "Template that generates an image from the article content", "template_name" => "seo_image_for_article"},
               %{"name" => "Blog post generator", "template_description" => "Template that generates a blog post from the give topic", "template_name" => "blog_post_generator"}
             ] == response["data"]

      assert_schema(response, "WorkflowTemplateIndexResponse", api_spec)
    end
  end

  describe "create" do
    test_requires_authentication %{conn: conn, organization: organization} do
      post(conn, ~p"/api/organizations/#{organization.id}/workflow_templates")
    end

    test "returns 404 when no template found for name", %{
      conn: conn,
      organization: organization
    } do
      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/workflow_templates", %{
          template_name: "404notemplate"
        })

      assert json_response(conn, 404)
    end

    test "creates a pipeline from template", %{
      conn: conn,
      organization: organization,
      api_spec: api_spec
    } do
      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/workflow_templates", %{
          template_name: "ai_chat"
        })

      response = json_response(conn, 200)

      assert %{"pipeline_id" => _pipeline_id} = response["data"]

      assert_schema(response, "WorkflowTemplateCreateResponse", api_spec)

      conn = get(conn, ~p"/api/organizations/#{organization.id}/pipelines")

      assert [%{"name" => "AI Chat"}] = json_response(conn, 200)["data"]
    end
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    %{organization: organization}
  end
end
