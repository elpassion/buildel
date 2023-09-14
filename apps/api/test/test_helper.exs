ExUnit.start()
Ecto.Adapters.SQL.Sandbox.mode(Buildel.Repo, :manual)

Application.put_env(:bound, :deepgram, Buildel.ClientMocks.Deepgram)
Application.put_env(:bound, :elevenlabs, Buildel.ClientMocks.Elevenlabs)
Application.put_env(:bound, :chat_gpt, Buildel.ClientMocks.ChatGPT)
Application.put_env(:bound, :stream_timeout, 10)
Application.put_env(:bound, :vector_db, Buildel.ClientMocks.VectorDB.QdrantAdapter)
