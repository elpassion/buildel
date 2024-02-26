defmodule BuildelWeb.OrganizationController do
  use BuildelWeb, :controller
  use BuildelWeb.Validator
  use PhoenixSwagger

  import BuildelWeb.UserAuth

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  def swagger_definitions do
    organization = %Buildel.Organizations.Organization{
      name: "Google",
      id: 123
    }
    key = "123123-123123"

    %{
      Organization: swagger_schema do
        title "Organization"
        description "A organization"
        properties do
          data (Schema.new do
            properties do
              id :string, "Unique identifier", required: true
              name :string, "Organization name", required: true
            end
          end)
        end
        example BuildelWeb.OrganizationJSON.show(%{organization: organization})
      end,
      Organizations: swagger_schema do
        title "Organizations"
        description "A collection of Organizations"
        type :array
        items Schema.ref(:Organization)
        example BuildelWeb.OrganizationJSON.index(%{organizations: [organization]})
      end,
      CreateOrganizationParams: swagger_schema do
        title "Create organization params"
        description "Create organization params"
        properties do
          organization (Schema.new do
            properties do
              name :string, "Organization name", required: true
            end
          end)
        end
        example %{
          organization: %{
            name: "Google"
          },
        }
      end,
      Key: swagger_schema do
        properties do
          data (Schema.new do
          properties do
            key :string, "API key", required: true
          end
        end)
      end
      end
    }
  end

  swagger_path :index do
    get "/organizations"
    description "List user organizations"
    response 200, "Success", Schema.ref(:Organizations)
  end

  def index(conn, _) do
    organizations = conn.assigns.current_user |> Organizations.list_user_organizations()
    render(conn, :index, organizations: organizations)
  end

  swagger_path :show do
    get "/organizations/{organization_id}"
    description "Get organization by id"
    parameters do
      organization_id :path, :string, "Organization ID", required: true
    end
    response 200, "Success", Schema.ref(:Organization)
  end

  def show(conn, %{"id" => organization_id}) do
    user = conn.assigns.current_user

    with {organization_id, _} when is_number(organization_id) <- Integer.parse(organization_id),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id) do
      render(conn, :show, organization: organization)
    end
  end

  swagger_path :create do
    post "/organizations"
    description "Create organization"
    parameters do
      organization :body, Schema.ref(:CreateOrganizationParams), "Org params", required: true
    end
    response 201, "Success", Schema.ref(:Organization)
  end

  defparams :create do
    required(:organization, :map) do
      required(:name, :string)
    end
  end

  def create(conn, params) do
    with {:ok, %{organization: organization_params}} <- validate(:create, params),
         {:ok, %Organizations.Organization{} = organization} <-
           Organizations.create_organization(
             organization_params
             |> Map.put(:user_id, conn.assigns.current_user.id)
           ) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/organizations/#{organization.id}")
      |> render(:show, organization: organization)
    end
  end

  defparams :update do
    required(:organization, :map) do
      required(:name, :string)
    end
  end

  swagger_path :update do
    put "/organizations/{organization_id}"
    description "Update organization"
    parameters do
      organization_id :path, :string, "Organization ID", required: true
      organization :body, Schema.ref(:CreateOrganizationParams), "Org params", required: true
    end
    response 200, "Success", Schema.ref(:Organization)
  end

  def update(conn, %{"id" => organization_id} = params) do
    user = conn.assigns.current_user

    with {:ok, %{organization: organization_params}} <- validate(:update, params),
         {:ok, organization_id} <- Buildel.Utils.parse_id(organization_id),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Organizations.Organization{} = organization} <-
           Organizations.update_organization(organization, organization_params) do

      conn
        |> put_status(:ok)
        |> put_resp_header("location", ~p"/api/organizations/#{organization.id}")
        |> render(:show, organization: organization)
    end
  end

  swagger_path :get_api_key do
    get "/organizations/{organization_id}"
    description "Get organization api key"
    parameters do
      organization_id :path, :string, "Organization ID", required: true
    end
    response 200, "Success", Schema.ref(:Key)
  end

  def get_api_key(conn, %{"id" => organization_id}) do
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Organizations.get_user_organization(user, organization_id) do
      render(conn, :organization_key, key: organization.api_key, hidden: true)
    end
  end

  swagger_path :reset_api_key do
    post "/organizations/{organization_id}"
    description "Reset organization api key"
    parameters do
      organization_id :path, :string, "Organization ID", required: true
      organization :body, Schema.ref(:CreateOrganizationParams), "Org params", required: true
    end
    response 200, "Success", Schema.ref(:Organization)
  end

  def reset_api_key(conn, %{"id" => organization_id}) do
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Organizations.get_user_organization(user, organization_id),
         {:ok, organization} <- Organizations.reset_organization_api_key(organization) do
      render(conn, :organization_key, key: organization.api_key, hidden: true)
    end
  end
end
