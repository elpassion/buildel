# Buildel

Your AI building helper!

## What's inside?

This repository includes the following packages/apps:

### Apps and Packages

- `web`: TypeScript based web app
- `api`: Elixir based api

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
cd buildel

pnpm i
pnpm dependencies:up
pnpm dev
```

### Migrations 

To run migrations, go to the apps/api and run `mix ecto.migrate`

### Tips

If you get 431 error, try to clear your cookies
