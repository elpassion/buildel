import type { z } from 'zod';

import type { Dataset, DatasetRow } from '~/api/datasets/datasets.contracts';

export type IDataset = z.TypeOf<typeof Dataset>;

export type IDatasetRow = z.TypeOf<typeof DatasetRow>;
