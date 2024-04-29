defmodule BuildelWeb.MemoryCollectionCostsControllerTest do
  use BuildelWeb.ConnCase, async: true
  import Buildel.OrganizationsFixtures
  import Buildel.PipelinesFixtures
  import Buildel.MemoriesFixtures
  import Buildel.CostsFixtures

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
    :create_user_organization,
    :create_pipeline,
    :read_file,
    :create_collection
  ]

  describe "index" do
    test_requires_authentication %{
      conn: conn,
      organization: organization,
      collection: collection
    } do
      get(
        conn,
        ~p"/api/organizations/#{organization.id}/memory_collections/#{collection.id}/costs"
      )
    end

    test "does not list collection costs from other org", %{
      conn: conn,
      another_organization: another_organization,
      another_collection: another_collection
    } do
      conn =
        get(
          conn,
          ~p"/api/organizations/#{another_organization.id}/memory_collections/#{another_collection.id}/costs"
        )

      assert json_response(conn, 404)["errors"] != %{}
    end

    test "lists paginated collection costs from current month", %{
      conn: conn,
      organization: organization,
      collection: collection,
      api_spec: api_spec
    } do
      cost_fixture(
        organization,
        collection,
        NaiveDateTime.utc_now()
      )

      conn =
        get(
          conn,
          ~p"/api/organizations/#{organization.id}/memory_collections/#{collection.id}/costs?page=0&per_page=2"
        )

      response = json_response(conn, 200)
      assert [%{"cost_type" => "query"}] = response["data"]
      assert %{"page" => 0, "per_page" => 2, "total" => 1} = response["meta"]

      assert_schema(response, "CollectionCostsIndexResponse", api_spec)
    end

    test "lists paginated collection costs between dates", %{
      conn: conn,
      organization: organization,
      collection: collection,
      api_spec: api_spec
    } do
      start_date =
        NaiveDateTime.utc_now() |> NaiveDateTime.add(-10, :day) |> NaiveDateTime.to_iso8601()

      end_date =
        NaiveDateTime.utc_now() |> NaiveDateTime.add(-5, :day) |> NaiveDateTime.to_iso8601()

      cost_fixture(organization, collection, NaiveDateTime.utc_now())

      %{cost: cost} =
        cost_fixture(
          organization,
          collection,
          NaiveDateTime.utc_now() |> NaiveDateTime.add(-7, :day)
        )

      %{cost: another_cost} =
        cost_fixture(
          organization,
          collection,
          NaiveDateTime.utc_now() |> NaiveDateTime.add(-6, :day)
        )

      conn =
        get(
          conn,
          ~p"/api/organizations/#{organization.id}/memory_collections/#{collection.id}/costs?page=0&per_page=2&start_date=#{start_date}&end_date=#{end_date}"
        )

      cost_id = cost.id
      another_cost_id = another_cost.id

      response = json_response(conn, 200)
      assert [%{"id" => ^another_cost_id}, %{"id" => ^cost_id}] = response["data"]
      assert %{"page" => 0, "per_page" => 2, "total" => 2} = response["meta"]

      assert_schema(response, "CollectionCostsIndexResponse", api_spec)
    end
  end

  defp read_file(_) do
    %{
      upload_file: %Plug.Upload{
        path: "test/support/fixtures/example.txt",
        filename: "example.txt"
      }
    }
  end

  defp create_pipeline(%{organization: organization}) do
    pipeline = pipeline_fixture(%{organization_id: organization.id})
    %{pipeline: pipeline}
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    another_organization = organization_fixture()
    %{organization: organization, another_organization: another_organization}
  end

  defp create_collection(%{organization: organization, another_organization: another_organization}) do
    collection = collection_fixture(%{organization_id: organization.id})
    another_collection = collection_fixture(%{organization_id: another_organization.id})
    %{collection: collection, another_collection: another_collection}
  end
end
