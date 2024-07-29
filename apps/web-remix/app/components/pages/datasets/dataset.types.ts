import type { z } from 'zod';

import type { Dataset } from '~/api/datasets/datasets.contracts';

export type IDataset = z.TypeOf<typeof Dataset>;
