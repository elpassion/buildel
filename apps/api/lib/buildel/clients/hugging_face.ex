defmodule Buildel.Clients.HuggingFace do
  @moduledoc """
  Client for consuming Hugging Face's text generation inference API.
  """

  @base_url "https://api-inference.huggingface.co/models/"

  @doc """
  Generates text using the specified model and input prompt.

  ## Examples

    iex> Buildel.Clients.HuggingFace.text_generation("gpt2", "Hello, world!")
  """

  def text_generation(model_name, prompt, options \\ %{}) do
    url = "#{@base_url}#{model_name}"

    headers = [
      {"Authorization",
       "Bearer #{options |> Map.get(:api_key) || System.get_env("HUGGING_FACE_API_TOKEN")}"},
      {"Content-Type", "application/json"}
    ]

    stream = options |> Map.get(:stream, false)

    body = %{
      inputs: prompt,
      parameters: %{
        return_full_text: false
      },
      stream: stream
    }

    HuggingFace.Stream.new(stream, fn ->
      HTTPoison.post(url, Jason.encode!(body), headers,
        recv_timeout: :infinity,
        stream_to: self(),
        async: :once
      )
    end)
  end

  def image_classification(model_name, image_path, options \\ %{}) do
    url = "#{@base_url}#{model_name}"

    headers = [
      {"Authorization",
       "Bearer #{options |> Map.get(:api_key) || System.get_env("HUGGING_FACE_API_TOKEN")}"},
      {"Content-Type", "application/json"}
    ]

    case HTTPoison.post(url, {:file, image_path}, headers,
           recv_timeout: :infinity,
           timeout: 60_000
         ) do
      {:ok, %HTTPoison.Response{status_code: 400}} ->
        {:error, :unauthorized}

      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        {:ok, %{body: Jason.decode!(body)}}

      _ ->
        {:error, :unknown_error}
    end
  end
end

defmodule HuggingFace.Stream do
  @moduledoc false

  def new(stream, start_fun) do
    Stream.resource(
      start_fun,
      fn
        {:error, %HTTPoison.Error{} = error} ->
          {
            [
              %{
                "status" => :error,
                "reason" => error.reason
              }
            ],
            error
          }

        %HTTPoison.Error{} = error ->
          {:halt, error}

        res ->
          {res, id} =
            case res do
              {:ok, res = %HTTPoison.AsyncResponse{id: id}} -> {res, id}
              res = %HTTPoison.AsyncResponse{id: id} -> {res, id}
            end

          receive do
            %HTTPoison.AsyncStatus{id: ^id, code: code} ->
              HTTPoison.stream_next(res)

              case code do
                200 ->
                  {[], res}

                _ ->
                  {
                    [
                      %{
                        "status" => :error,
                        "code" => code,
                        "choices" => []
                      }
                    ],
                    res
                  }
              end

            %HTTPoison.AsyncHeaders{id: ^id, headers: _headers} ->
              HTTPoison.stream_next(res)
              {[], res}

            %HTTPoison.AsyncChunk{chunk: chunk} ->
              data =
                if stream do
                  chunk
                  |> String.split("\n")
                  |> Enum.filter(fn line ->
                    String.starts_with?(line, "data:{")
                  end)
                  |> Enum.map(fn line ->
                    line
                    |> String.replace_prefix("data:", "")
                    |> Jason.decode!()
                  end)
                else
                  chunk |> Jason.decode!()
                end

              HTTPoison.stream_next(res)
              {data, res}

            %HTTPoison.AsyncEnd{} ->
              {:halt, res}
          end
      end,
      fn %{id: id} ->
        id |> :hackney.stop_async()
      end
    )
  end
end
