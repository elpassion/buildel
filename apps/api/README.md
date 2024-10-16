# Buildel


To start your Phoenix server:


- Run `mix dependencies.up` to start dependencies.
- Run `mix setup` to install and setup dependencies
- Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

## Learn more

- Official website: https://www.phoenixframework.org/
- Guides: https://hexdocs.pm/phoenix/overview.html
- Docs: https://hexdocs.pm/phoenix
- Forum: https://elixirforum.com/c/phoenix-forum
- Source: https://github.com/phoenixframework/phoenix

## Flow of creation

1. Create a pipeline POST /pipelines - name: "Name", config: { version: 1, blocks: [] }
   Retrieve block types GET /block_types
2. Update pipeline with new blocks PUT /pipelines/:pipeline_id - name: "Name", config: { version: 1, blocks: [] }
3. Create a new run POST /runs - { pipeline_id: :pipeline_id }
4. List runs GET /runs
   Get run GET /runs/:id -
5. Start run PUT /runs/:run_id/start
6. Stop run PUT /runs/:run_id/stop

## WS


1. Join a channel to communicate with run: topic - pipeline_runs:#{:run_id}
2. ppush "get_blocks" - %{ blocks: [%{ context: %{ inputs: [%{ name: "input", type: "audio", id: "context:pipeline_runs.1:block:random_block:io:input" }], outputs: [%{ name: "output", type: "text", id: "context:pipeline_runs.1:block:random_block:io:output" }] } }] }
