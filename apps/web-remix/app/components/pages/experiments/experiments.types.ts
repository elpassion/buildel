import type { z } from 'zod';

import type { Experiment } from '~/api/experiments/experiments.contracts';

export type IExperiment = z.TypeOf<typeof Experiment>;
