defmodule BuildelWeb.MembershipLive.FormComponent do
  use BuildelWeb, :live_component

  alias Buildel.Organizations

  @impl true
  def render(assigns) do
    ~H"""
    <div>
      <.header>
        <%= @title %>
        <:subtitle>Use this form to manage membership records in your database.</:subtitle>
      </.header>

      <.simple_form
        for={@form}
        id="membership-form"
        phx-target={@myself}
        phx-change="validate"
        phx-submit="save"
      >
        <.input field={@form[:user_email]} type="email" label="User email" />

        <:actions>
          <.button phx-disable-with="Saving...">Save Membership</.button>
        </:actions>
      </.simple_form>
    </div>
    """
  end

  @impl true
  def update(%{membership: membership} = assigns, socket) do
    changeset = form_changeset(membership)

    {:ok,
      socket
      |> assign(assigns)
      |> assign_form(changeset)}
  end

  @impl true
  def handle_event("validate", %{"membership" => membership_params}, socket) do
    changeset =
      socket.assigns.membership
      |> form_changeset(membership_params)
      |> Map.put(:action, :validate)

    {:noreply, assign_form(socket, changeset)}
  end

  def handle_event("save", %{"membership" => membership_params}, socket) do
    %{ id: user_id } = Buildel.Accounts.get_user_by_email(membership_params["user_email"])
    save_membership(socket, socket.assigns.action, %{ "organization_id" => socket.assigns.organization.id, "user_id" => user_id })
  end

  defp form_changeset(form, params \\ %{}) do
    {form, %{user_email: :string}}
    |> Ecto.Changeset.cast(params, [:user_email])
    |> Ecto.Changeset.validate_required(:user_email)
    |> Ecto.Changeset.validate_length(:user_email, min: 10)
  end

  defp save_membership(socket, :edit, membership_params) do
    case Organizations.update_membership(socket.assigns.membership, membership_params) do
      {:ok, membership} ->
        notify_parent({:saved, membership})

        {:noreply,
          socket
          |> put_flash(:info, "Membership updated successfully")
          |> push_patch(to: socket.assigns.patch)}

      {:error, %Ecto.Changeset{} = changeset} ->
        {:noreply, assign_form(socket, changeset)}
    end
  end

  defp save_membership(socket, :new, membership_params) do
    case Organizations.create_membership(membership_params) do
      {:ok, membership} ->
        notify_parent({:saved, membership})

        {:noreply,
          socket
          |> put_flash(:info, "Membership created successfully")
          |> push_patch(to: socket.assigns.patch)}

      {:error, %Ecto.Changeset{} = changeset} ->
        {:noreply, assign_form(socket, changeset)}
    end
  end

  defp assign_form(socket, %Ecto.Changeset{} = changeset) do
    assign(socket, :form, to_form(changeset))
  end

  defp notify_parent(msg), do: send(self(), {__MODULE__, msg})
end
