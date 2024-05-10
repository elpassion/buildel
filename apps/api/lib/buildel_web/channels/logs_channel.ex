defmodule BuildelWeb.LogsChannel do
  use Phoenix.Channel, log_handle_in: false
  use BuildelWeb.Validator

  require Logger

  alias BuildelWeb.OrganizationPipelineRunLogsJSON
  alias Phoenix.PubSub
  alias Buildel.Pipelines

  defparams :join do
    required(:auth, :string)
    required(:user_data, :string)
    optional(:block_name, :string)
  end

  @default_params %{
    "auth" => "default",
    "user_data" => "{}",
    "block_name" => nil
  }

  def join(channel_name, params, socket) do
    IO.inspect("Joining logs channel")
    params = Map.merge(@default_params, params)

    with {:ok, %{organization_id: organization_id, pipeline_id: pipeline_id, run_id: run_id}} <-
           parse_channel_name(channel_name),
         {:ok,
          %{
            auth: auth,
            user_data: user_data,
            block_name: block_name
          }} <-
           validate(:join, params),
         {:ok, pipeline_id} <- Buildel.Utils.parse_id(pipeline_id),
         {:ok, organization_id} <- Buildel.Utils.parse_id(organization_id),
         {:ok, run_id} <- Buildel.Utils.parse_id(run_id),
         organization <- Buildel.Organizations.get_organization!(organization_id),
         {:ok, %Pipelines.Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, run} <- Pipelines.get_pipeline_run(pipeline, run_id),
         :ok <-
           verify_auth_token(
             pipeline.interface_config,
             socket.id,
             channel_name,
             user_data,
             auth,
             organization.api_key
           ) do
      listen_to_outputs(organization, pipeline, run)

      {:ok, %{run: %{id: run.id}}, socket |> assign(:run, run) |> assign(:block_name, block_name)}
    else
      {:error, :invalid_id} ->
        {:error, %{reason: "not_found"}}

      {:error, :not_found} ->
        {:error, %{reason: "not_found"}}

      {:error, :failed_to_verify_token} ->
        {:error, %{reason: "unauthorized"}}

      err ->
        Logger.error("Unhandled error: #{inspect(err)}")
        {:error, %{reason: "unknown"}}
    end
  end

  def handle_info({topic, log}, socket) do
    case socket.assigns.block_name do
      nil ->
        socket |> Phoenix.Channel.push(topic, log)
        {:noreply, socket}

      block_name ->
        case log.data.block_name do
          ^block_name ->
            socket |> Phoenix.Channel.push(topic, log)
            {:noreply, socket}

          _ ->
            {:noreply, socket}
        end
    end
  end

  defp parse_channel_name(channel_name) do
    case channel_name |> String.split(":") do
      ["logs", organization_id, pipeline_id, run_id] ->
        {:ok, %{organization_id: organization_id, pipeline_id: pipeline_id, run_id: run_id}}

      _ ->
        {:error, :not_found}
    end
  end

  defp listen_to_outputs(organization, pipeline, run) do
    topic = "logs::#{organization.id}::#{pipeline.id}::#{run.id}"

    IO.inspect(topic, label: "Listening to topic")
    Buildel.PubSub |> PubSub.subscribe(topic)
  end

  defp verify_auth_token(%{"public" => true}, _, _, _, _, _) do
    :ok
  end

  defp verify_auth_token(_config, socket_id, channel_name, user_json, auth_token, secret) do
    BuildelWeb.ChannelAuth.verify_auth_token(
      socket_id,
      channel_name,
      user_json,
      auth_token,
      secret
    )
  end
end
