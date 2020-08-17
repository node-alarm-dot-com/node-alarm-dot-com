import { IdentityResponse } from './IdentityResponse';

export interface AuthOpts {
  cookie: string,
  ajaxKey: string,
  expires: number,
  systems: string[],
  identities: IdentityResponse
}
