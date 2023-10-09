import { IdentityResponse } from './IdentityResponse';

/**
 * AuthOpts is authentication information which is used in API requests to authenticate as the user.
 */
export interface AuthOpts {
  cookie: string;
  ajaxKey: string;
  expires: number;
  systems: string[];
  identities: IdentityResponse;
}
