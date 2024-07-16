import { collectionFixture } from '~/tests/fixtures/collection.fixtures';
import { collectionMemoryFixtures } from '~/tests/fixtures/collectionMemory.fixtures';
import { embeddingFixture } from '~/tests/fixtures/embedding.fixtures';
import { modelFixture } from '~/tests/fixtures/models.fixtures';
import { secretFixture } from '~/tests/fixtures/secrets.fixtures';
import {
  CollectionHandlers,
  CollectionMemoriesHandlers,
} from '~/tests/handlers/collection.handlers';
import {
  EmbeddingsHandlers,
  ModelsHandlers,
} from '~/tests/handlers/model.handlers';
import { SecretsHandlers } from '~/tests/handlers/secret.handlers';

export const knowledgeBaseHandlers = () => [
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
  ...new CollectionMemoriesHandlers([
    collectionMemoryFixtures(),
    collectionMemoryFixtures({ id: 2, file_name: 'test_file' }),
  ]).handlers,
  ...new CollectionHandlers([
    collectionFixture(),
    collectionFixture({ id: 2, name: 'super-collection' }),
  ]).handlers,
];
