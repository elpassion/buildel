import type { IPipelineRunLog } from '~/api/pipeline/pipeline.contracts';

type Action =
  | {
      type: 'LOG';
      payload: {
        data: IPipelineRunLog;
      };
    }
  | {
      type: 'FETCH_OLDER';
      payload: {
        data: IPipelineRunLog[];
        after: string | null;
      };
    };

export type RunLogsReducerState = {
  logs: IPipelineRunLog[];
  after: string | null;
};

export const runLogsReducer = (
  state: RunLogsReducerState,
  action: Action,
): RunLogsReducerState => {
  switch (action.type) {
    case 'LOG':
      return {
        ...state,
        logs: uniqueLogs([...state.logs, action.payload.data]),
      };
    case 'FETCH_OLDER':
      return {
        ...state,
        logs: uniqueLogs([
          ...action.payload.data.slice().reverse(),
          ...state.logs,
        ]),
        after: action.payload.after,
      };
  }
};

export const log = (log: IPipelineRunLog) => {
  return {
    type: 'LOG',
    payload: {
      data: log,
    },
  } as const;
};

export const fetchOlder = (logs: IPipelineRunLog[], after?: string | null) => {
  return {
    type: 'FETCH_OLDER',
    payload: {
      data: logs,
      after: after ?? null,
    },
  } as const;
};

function uniqueLogs(logs: IPipelineRunLog[]) {
  return [...new Map(logs.map((item) => [item.id, item])).values()];
}
