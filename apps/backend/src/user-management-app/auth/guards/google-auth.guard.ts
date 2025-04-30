import { OAuthProvider } from '../constants/oauth-providers.enum';
import { createOAuthGuard } from './oauth-auth.guard';

export const GoogleAuthGuard = createOAuthGuard(OAuthProvider.GOOGLE);
