import { aliasFixture } from '~/tests/fixtures/alias.fixtures';
import { collectionFixture } from '~/tests/fixtures/collection.fixtures';
import { collectionMemoryFixtures } from '~/tests/fixtures/collectionMemory.fixtures';
import { embeddingFixture } from '~/tests/fixtures/embedding.fixtures';
import { modelFixture } from '~/tests/fixtures/models.fixtures';
import { pipelineFixture } from '~/tests/fixtures/pipeline.fixtures';
import { secretFixture } from '~/tests/fixtures/secrets.fixtures';
import { handlers as blockTypesHandlers } from '~/tests/handlers/blockTypes.handlers';
import {
  CollectionHandlers,
  CollectionMemoriesHandlers,
} from '~/tests/handlers/collection.handlers';
import {
  EmbeddingsHandlers,
  ModelsHandlers,
} from '~/tests/handlers/model.handlers';
import {
  AliasHandlers,
  pipelineFixtureWithUnfilledBlock,
  PipelineHandlers,
} from '~/tests/handlers/pipelines.handlers';
import { SecretsHandlers } from '~/tests/handlers/secret.handlers';

export const buildHandlers = () => [
  ...blockTypesHandlers(),
  ...new SecretsHandlers([
    secretFixture(),
    secretFixture({ name: 'Test', id: 'Test' }),
  ]).handlers,
  ...new ModelsHandlers([
    modelFixture(),
    modelFixture({ name: 'Test', id: 'Test', type: 'google' }),
  ]).handlers,
  ...new EmbeddingsHandlers([
    embeddingFixture(),
    embeddingFixture({ name: 'embedding', id: 'embedding' }),
  ]).handlers,
  ...new CollectionHandlers([
    collectionFixture(),
    collectionFixture({ id: 2, name: 'super-collection' }),
  ]).handlers,
  ...new CollectionMemoriesHandlers([
    collectionMemoryFixtures(),
    collectionMemoryFixtures({ id: 2, file_name: 'test_file' }),
  ]).handlers,
  ...new PipelineHandlers([
    pipelineFixture(),
    pipelineFixture({ id: 2, name: 'sample-workflow' }),
    pipelineFixtureWithUnfilledBlock(),
  ]).handlers,
  ...new AliasHandlers([
    aliasFixture(),
    aliasFixture({
      id: 2,
      name: 'alias',
      config: {
        ...aliasFixture().config,
        blocks: [aliasFixture().config.blocks[0]],
        connections: [],
      },
    }),
  ]).handlers,
];
