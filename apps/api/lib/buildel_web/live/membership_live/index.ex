defmodule BuildelWeb.MembershipLive.Index do
  use BuildelWeb, :live_view

  alias Buildel.Organizations
  alias Buildel.Organizations.Membership

  @impl true
  def mount(params, _session, socket) do
    {:ok, stream(socket, :memberships, Organizations.list_organization_memberships(params["organization_id"]))}
  end

  @impl true
  def handle_params(params, _url, socket) do
    {:noreply, apply_action(socket, socket.assigns.live_action, params)}
  end

  defp apply_action(socket, :new, params) do
    socket
    |> assign(:page_title, "New Membership")
    |> assign(:membership, %Membership{})
    |> assign(:organization, Organizations.get_organization!(params["organization_id"]))
  end

  defp apply_action(socket, :index, params) do
    socket
    |> assign(:page_title, "Listing Memberships")
    |> assign(:membership, nil)
    |> assign(:organization, Organizations.get_organization!(params["organization_id"]))
  end

  @impl true
  def handle_info({BuildelWeb.MembershipLive.FormComponent, {:saved, membership}}, socket) do
    {:noreply, stream_insert(socket, :memberships, membership)}
  end

  @impl true
  def handle_event("delete", %{"id" => id}, socket) do
    membership = Organizations.get_membership!(id)
    {:ok, _} = Organizations.delete_membership(membership)

    {:noreply, stream_delete(socket, :memberships, membership)}
  end
end
