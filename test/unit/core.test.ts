import { readFileSync } from 'fs';
import nock from 'nock';
import { join } from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { login } from '../../src/core';

const loginPageHtml = readFileSync(join(__dirname, '../fixtures/html/login_page.html'), 'utf-8');
const identitiesOk = JSON.parse(readFileSync(join(__dirname, '../fixtures/json/identities_ok.json'), 'utf-8'));

afterEach(() => {
  nock.cleanAll();
});

describe('login', () => {
  it('rejects with a "No afg cookie" error when the login response has no afg cookie', async () => {
    nock('https://www.alarm.com').get('/login').reply(200, loginPageHtml, { 'Content-Type': 'text/html' });

    nock('https://www.alarm.com')
      .post('/web/Default.aspx')
      .reply(200, '', { 'Set-Cookie': 'sessionid=abc123; Path=/' });

    await expect(login('test-user', 'test-pass')).rejects.toThrow('No afg cookie');
  });

  it('returns systems parsed from the identities response on a successful login', async () => {
    nock('https://www.alarm.com').get('/login').reply(200, loginPageHtml, { 'Content-Type': 'text/html' });

    nock('https://www.alarm.com')
      .post('/web/Default.aspx')
      .reply(200, '', { 'Set-Cookie': ['afg=fixture-ajax-key; Path=/', 'sessionid=abc123; Path=/'] });

    nock('https://www.alarm.com')
      .get('/web/api/identities')
      .reply(200, identitiesOk, { 'Content-Type': 'application/vnd.api+json' });

    const authOpts = await login('test-user', 'test-pass');

    expect(authOpts.ajaxKey).toBe('fixture-ajax-key');
    expect(authOpts.systems).toEqual(['id-system']);
  });
});
