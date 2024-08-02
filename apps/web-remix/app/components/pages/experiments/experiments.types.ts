import type { z } from 'zod';

import type {
  Experiment,
  ExperimentRun,
  ExperimentRunRun,
} from '~/api/experiments/experiments.contracts';

export type IExperiment = z.TypeOf<typeof Experiment>;

export type IExperimentRun = z.TypeOf<typeof ExperimentRun>;

export type IExperimentRunRun = z.TypeOf<typeof ExperimentRunRun>;
