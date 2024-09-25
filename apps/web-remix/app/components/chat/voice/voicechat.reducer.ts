export type VoicechatStatus = 'inactive' | 'recording' | 'listening';

type Action =
  | {
      type: 'SET_STATUS';
      payload: {
        data: VoicechatStatus;
      };
    }
  | {
      type: 'RESET';
    };

type State = {
  status: VoicechatStatus;
};

export const DEFAULT_VOICECHAT_STATE: State = {
  status: 'inactive',
};

export const voicechatReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_STATUS':
      return {
        ...state,
        status: action.payload.data,
      };
    case 'RESET':
      return DEFAULT_VOICECHAT_STATE;
  }
};

export const record = () => {
  return {
    type: 'SET_STATUS',
    payload: {
      data: 'recording',
    },
  } as const;
};

export const stop = () => {
  return {
    type: 'SET_STATUS',
    payload: {
      data: 'inactive',
    },
  } as const;
};

export const listen = () => {
  return {
    type: 'SET_STATUS',
    payload: {
      data: 'listening',
    },
  } as const;
};
