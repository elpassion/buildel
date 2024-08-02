import type { z } from 'zod';

import type {
  Experiment,
  ExperimentRun,
} from '~/api/experiments/experiments.contracts';

export type IExperiment = z.TypeOf<typeof Experiment>;

export type IExperimentRun = z.TypeOf<typeof ExperimentRun>;
