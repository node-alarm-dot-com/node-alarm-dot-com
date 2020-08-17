import { IdentityResponse } from './IdentityResponse';

export interface AuthOpts {
  cookie: string,
  ajaxKey: string,
  systems: string[],
  identities: IdentityResponse
}
