import { Body, Headers } from 'node-fetch';

export interface RequestOptions {
  body: Body;
  headers?: Headers;
}
