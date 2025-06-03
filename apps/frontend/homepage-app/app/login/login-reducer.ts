/**
 * AuthStatus defines the possible states for the authentication flow.
 */
export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'mfa'
  | 'email-mfa'
  | 'mfa-optional'
  | 'mfa-setup'
  | 'confirm-mfa'
  | 'terms'
  | 'error';

/**
 * LoginState represents the state of the login component.
 */
export interface LoginState {
  /** Current status of the authentication flow. */
  status: AuthStatus;
  /** Error message in case of a failure. */
  errorMessage: string;
  /** Temporary token used for MFA verification or “terms” acceptance. */
  tempToken: string;
  /** Email used for MFA verification. */
  email: string;
  /** URL for the QR code image (if MFA setup is in progress). */
  qrCodeUrl?: string;
  /** Secret key for MFA setup. */
  secret?: string;
}

/**
 * LoginAction defines the actions that can be dispatched to the login reducer.
 */
export type LoginAction =
  | { type: 'START_LOGIN' }
  | { type: 'LOGIN_SUCCESS' }
  | { type: 'MFA_REQUIRED'; ticket: string }
  | { type: 'TERMS_REQUIRED'; ticket: string }
  | { type: 'EMAIL_MFA_REQUIRED'; email: string }
  | { type: 'OPTIONAL_MFA_PROMPT'; qrCodeUrl: string; secret: string }
  | { type: 'BEGIN_MFA_SETUP' }
  | { type: 'BEGIN_CONFIRM_MFA_SETUP' }
  | { type: 'LOGIN_ERROR'; message: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

/**
 * The initial state for the login flow.
 */
export const initialLoginState: LoginState = {
  status: 'idle',
  errorMessage: '',
  tempToken: '',
  email: '',
  qrCodeUrl: '',
  secret: '',
};

/**
 * loginReducer is a state machine that handles transitions during the login and MFA process.
 *
 * @param {LoginState} state - The current login state.
 * @param {LoginAction} action - The action to process.
 * @returns {LoginState} The updated login state.
 */
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
      return {
        ...state,
        status: 'mfa',
        tempToken: action.ticket,
      };
    case 'TERMS_REQUIRED':
      return {
        ...state,
        status: 'terms',
        tempToken: action.ticket,
      };
    case 'EMAIL_MFA_REQUIRED':
      return {
        ...state,
        status: 'email-mfa',
        errorMessage: '',
        email: action.email,
      };
    case 'OPTIONAL_MFA_PROMPT':
      return {
        ...state,
        status: 'mfa-optional',
        qrCodeUrl: action.qrCodeUrl,
        secret: action.secret,
        errorMessage: '',
      };
    case 'BEGIN_MFA_SETUP':
      return { ...state, status: 'mfa-setup' };
    case 'BEGIN_CONFIRM_MFA_SETUP':
      return { ...state, status: 'confirm-mfa' };
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
