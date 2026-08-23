import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, it } from 'node:test';
import nock from 'nock';
import { login } from '../../src/core.js';

const loginPageHtml = readFileSync(join(import.meta.dirname, '../fixtures/html/login_page.html'), 'utf-8');
const identitiesOk = JSON.parse(
  readFileSync(join(import.meta.dirname, '../fixtures/json/identities_ok.json'), 'utf-8')
) as Record<string, unknown>;

afterEach(() => {
  nock.cleanAll();
});

void describe('login', () => {
  void it('rejects with a "No afg cookie" error when the login response has no afg cookie', async () => {
    nock('https://www.alarm.com').get('/login').reply(200, loginPageHtml, { 'Content-Type': 'text/html' });

    nock('https://www.alarm.com')
      .post('/web/Default.aspx')
      .reply(200, '', { 'Set-Cookie': 'sessionid=abc123; Path=/' });

    await assert.rejects(login('test-user', 'test-pass'), /No afg cookie/);
  });

  void it('returns systems parsed from the identities response on a successful login', async () => {
    nock('https://www.alarm.com').get('/login').reply(200, loginPageHtml, { 'Content-Type': 'text/html' });

    nock('https://www.alarm.com')
      .post('/web/Default.aspx')
      .reply(200, '', ['Set-Cookie', 'afg=fixture-ajax-key; Path=/', 'Set-Cookie', 'sessionid=abc123; Path=/']);

    nock('https://www.alarm.com')
      .get('/web/api/identities')
      .reply(200, identitiesOk, { 'Content-Type': 'application/vnd.api+json' });

    const authOpts = await login('test-user', 'test-pass');

    assert.strictEqual(authOpts.ajaxKey, 'fixture-ajax-key');
    assert.deepStrictEqual(authOpts.systems, ['id-system']);
  });
});
