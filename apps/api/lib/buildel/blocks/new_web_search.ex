defmodule Buildel.Blocks.NewBraveSearch do
  import Buildel.Blocks.Utils.Schemas

  use Buildel.Blocks.NewBlock

  alias Buildel.Blocks.Fields.EditorField

  defblock(:brave_search,
    description:
      "Used for searching web using Brave Search.",
    groups: ["tools"]
  )

  definput(:query, schema: %{})

  defoutput(:output, schema: %{})

  deftool(:query,
    description: "Search the web.",
    schema: %{
      type: "object",
      properties: %{
        query: %{
          type: "string",
          description: "The search query."
        }
      },
      required: ["query"]
    }
  )

  defoption(
    :api_key,
    secret_schema(%{
      "title" => "API key",
      "description" => "Brave Search API key."
    })
  )

  defoption(
    :limit,
    %{
      "type" => "number",
      "title" => "Limit",
      "description" => "Results limit",
      "default" => 5,
      "minimum" => 1,
      "maximum" => 10,
      "step" => 1,
      "readonly" => true
    },
    required: false
  )

  defoption(
    :country,
    %{
      "type" => "string",
      "title" => "Country",
      "description" => "The search query country, where the results come from.",
      "default" => "us",
      "minLength" => 2,
      "maxLength" => 2,
      "readonly" => true
    },
    required: false
  )

  defp search(query, state) do
    uri =
      URI.parse("https://api.search.brave.com/res/v1/web/search")
      |> URI.append_query("q=#{URI.encode(query)}")
      |> URI.append_query("count=#{option(state, :limit)}")
      |> URI.append_query("country=#{option(state, :country)}")

    api_key = secret(state, option(state, :api_key))

    response =
      Req.new(url: URI.to_string(uri))
      |> Req.Request.put_header("X-Subscription-Token", api_key)
      |> Req.get()

    case response do
      {:ok, %Req.Response{status: 200, body: %{"web" => web}}} ->
        res =
          Enum.map(web["results"], fn result ->
            %{
              title: result["title"],
              url: result["url"],
              description: result["description"]
            }
          end)
          |> Jason.encode!()

        {:ok, res}
      _ ->
        {:error, "Unknown error", state}
    end
  end

  def handle_input(:query, %Message{message: query} = message, state) do

    send_stream_start(state, :output, message)

    with {:ok, response} <- search(query, state) do
      response =  message |> Message.set_message(response) |> Message.set_type(:text)

      output(state, :output, response)
      {:ok, state}
    else
      {:error, reason, state} ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message(reason)
        )

        send_stream_stop(state, :output, message)

        {:error, reason, state}
    end

  end

  def handle_tool_call(:query, %Message{message: %{args: args}} = message, state) do
    send_stream_start(state, :output, message)

    with {:ok, response} <- search(args["query"], state) do
      response =  message |> Message.set_message(response) |> Message.set_type(:text)

      output(state, :output, response)
      {:ok, response, state}
    else
      {:error, reason, state} ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message(reason)
        )

        send_stream_stop(state, :output, message)

        {:error, reason, state}
    end
  end
end
