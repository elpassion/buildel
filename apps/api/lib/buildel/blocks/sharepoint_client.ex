defmodule Buildel.Blocks.SharepointClient do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "sharepoint_client",
      description: "This module is designed to interact with a SharePoint API.",
      groups: ["text", "inputs / outputs"],
      inputs: [Block.text_input("list"), Block.text_input("get"), Block.file_input("create")],
      outputs: [
        Block.text_output("list"),
        Block.text_output("get"),
        Block.file_output("get_file"),
        Block.text_output("create")
      ],
      ios: [],
      dynamic_ios: nil,
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "inputs"],
      "properties" => %{
        "name" => name_schema(),
        "opts" =>
          options_schema(%{
            "required" => ["client_secret", "client_id", "tenant_id"],
            "properties" => %{
              "client_secret" =>
                secret_schema(%{
                  "title" => "Client secret",
                  "description" => "Azure app client secret"
                }),
              "client_id" => %{
                "type" => "string",
                "title" => "Client ID",
                "description" => "Azure app client ID",
                "default" => "",
                "minLength" => 1
              },
              "tenant_id" => %{
                "type" => "string",
                "title" => "Tenant ID",
                "description" => "Azure app tenant ID",
                "default" => "",
                "minLength" => 1
              },
              "site_id" => %{
                "type" => "string",
                "title" => "Site ID",
                "description" => "SharePoint site ID",
                "default" => "",
                "minLength" => 1
              },
              "drive_id" => %{
                "type" => "string",
                "title" => "Drive ID",
                "description" => "SharePoint drive ID",
                "default" => "",
                "minLength" => 1
              }
            }
          })
      }
    }
  end

  @scope "https://graph.microsoft.com/.default"

  @impl true
  def setup(%{opts: opts, context_id: context_id} = state) do
    secret = block_context().get_secret_from_context(context_id, opts.client_secret)

    {:ok, access_token} =
      get_access_token(
        opts.client_id,
        secret,
        opts.tenant_id
      )

    {:ok,
     state
     |> Map.put(:access_token, access_token)
     |> Map.put(:site_id, opts.site_id)
     |> Map.put(:drive_id, opts.drive_id)}
  end

  defp get_access_token(client_id, client_secret, tenant_id) do
    url = "https://login.microsoftonline.com/#{tenant_id}/oauth2/v2.0/token"

    body = %{
      "client_id" => client_id,
      "client_secret" => client_secret,
      "scope" => @scope,
      "grant_type" => "client_credentials"
    }

    headers = [{"Content-Type", "application/x-www-form-urlencoded"}]

    case Req.new(url: url) |> Req.post(form: body, headers: headers) do
      {:ok, %Req.Response{status: 200, body: body}} ->
        {:ok, body["access_token"]}

      {:ok, %Req.Response{body: reason}} ->
        {:error, reason}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @impl true
  def handle_input("list", {_topic, :text, _text, _metadata}, state) do
    {:ok, documents} = list_documents(state)

    documents = documents["value"] |> Enum.map(&%{"name" => &1["name"], "id" => &1["id"]})

    state |> output("list", {:text, Jason.encode!(documents)})
  end

  @impl true
  def handle_input("get", {_topic, :text, text, _metadata}, state) do
    {:ok, document} = get_document(text, state)

    document = %{
      "name" => document["name"],
      "id" => document["id"],
      "size" => document["size"],
      "mime_type" => document["file"]["mimeType"],
      "download_url" => document["@microsoft.graph.downloadUrl"]
    }

    {:ok, %Req.Response{body: content}} = Req.new(url: document["download_url"]) |> Req.get()

    {:ok, path} = Temp.path(%{suffix: Path.extname(document["name"])})
    File.write!(path, content)

    file_id = UUID.uuid4()

    state =
      state
      |> output("get_file", {:binary, path}, %{
        metadata: %{
          file_id: file_id,
          file_name: document["name"],
          file_type: document["mime_type"]
        }
      })

    state |> output("get", {:text, Jason.encode!(document)})
  end

  @impl true
  def handle_input("create", {_name, :binary, path, metadata}, state) do
    content = File.read!(path)

    {:ok, res} = upload_document(content, metadata.file_name, state)

    document = %{
      "name" => res["name"],
      "id" => res["id"],
      "size" => res["size"],
      "mime_type" => res["file"]["mimeType"],
      "download_url" => res["@microsoft.graph.downloadUrl"]
    }

    state |> output("create", {:text, Jason.encode!(document)})
  end

  defp upload_document(file_content, file_path, state) do
    url =
      "https://graph.microsoft.com/v1.0/sites/#{state.site_id}/drives/#{state.drive_id}/root:/#{file_path}:/content"

    headers = [
      {"Authorization", "Bearer #{state.access_token}"},
      {"Content-Type", "application/octet-stream"}
    ]

    case Req.new(url: url) |> Req.put(body: file_content, headers: headers) do
      {:ok, %Req.Response{status: 201, body: body}} ->
        {:ok, body}

      {:ok, %Req.Response{body: reason}} ->
        {:error, reason}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp get_document(item_id, state) do
    url =
      "https://graph.microsoft.com/v1.0/sites/#{state.site_id}/drives/#{state.drive_id}/items/#{item_id}"

    headers = [{"Authorization", "Bearer #{state.access_token}"}]

    case Req.new(url: url) |> Req.get(headers: headers) do
      {:ok, %Req.Response{status: 200, body: body}} ->
        {:ok, body}

      {:ok, %Req.Response{body: reason}} ->
        {:error, reason}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp list_documents(state) do
    url =
      "https://graph.microsoft.com/v1.0/sites/#{state.site_id}/drives/#{state.drive_id}/root/children"

    headers = [{"Authorization", "Bearer #{state.access_token}"}]

    case Req.new(url: url) |> Req.get(headers: headers) do
      {:ok, %Req.Response{status: 200, body: body}} ->
        {:ok, body}

      {:ok, %Req.Response{body: reason}} ->
        {:error, reason}

      {:error, reason} ->
        {:error, reason}
    end
  end
end
