import { IdentityResponse } from './IdentityResponse';

export interface AuthOpts {
  expires: number,
  cookie: string,
  ajaxKey: string,
  systems: string[],
  identities: IdentityResponse
}
