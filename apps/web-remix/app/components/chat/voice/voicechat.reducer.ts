export type VoicechatStatus = 'inactive' | 'recording' | 'listening';

type Action =
  | {
      type: 'SET_STATUS';
      payload: {
        data: VoicechatStatus;
      };
    }
  | {
      type: 'UNMUTE';
    }
  | {
      type: 'RESET';
    };

export type VoicechatReducerState = {
  status: VoicechatStatus;
};

export const DEFAULT_VOICECHAT_STATE: VoicechatReducerState = {
  status: 'inactive',
};

export const voicechatReducer = (
  state: VoicechatReducerState,
  action: Action,
): VoicechatReducerState => {
  switch (action.type) {
    case 'SET_STATUS':
      return {
        ...state,
        status: action.payload.data,
      };
    case 'UNMUTE':
      return {
        ...state,
        status: state.status === 'inactive' ? 'inactive' : 'recording',
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

export const unmute = () => {
  return {
    type: 'UNMUTE',
  } as const;
};
