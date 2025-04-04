export type AuthStatus = 'idle' | 'loading' | 'mfa' | 'error';

export interface LoginState {
  status: AuthStatus;
  errorMessage: string;
  tempToken: string;
}

export type LoginAction =
  | { type: 'START_LOGIN' }
  | { type: 'LOGIN_SUCCESS' }
  | { type: 'MFA_REQUIRED'; ticket: string }
  | { type: 'LOGIN_ERROR'; message: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

export const initialLoginState: LoginState = {
  status: 'idle',
  errorMessage: '',
  tempToken: '',
};

export function loginReducer(
  state: LoginState,
  action: LoginAction,
): LoginState {
  switch (action.type) {
    case 'START_LOGIN':
      return { ...state, status: 'loading', errorMessage: '' };
    case 'LOGIN_SUCCESS':
      return { ...initialLoginState };
    case 'MFA_REQUIRED':
      return { ...state, status: 'mfa', tempToken: action.ticket };
    case 'LOGIN_ERROR':
      return { ...state, status: 'error', errorMessage: action.message };
    case 'CLEAR_ERROR':
      return { ...state, errorMessage: '' };
    case 'RESET':
      return { ...initialLoginState };
    default:
      return state;
  }
}
