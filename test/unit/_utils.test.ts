import nock from 'nock';
import { afterEach, describe, expect, it } from 'vitest';
import type { AuthOpts } from '../../src/_models/AuthOpts.js';
import { authenticatedGet, getComponents, SENSORS_URL } from '../../src/_utils.js';

const authOpts: AuthOpts = {
  cookie: 'test-cookie',
  ajaxKey: 'test-ajax-key',
  expires: 0,
  systems: [],
  identities: { data: [], included: [], meta: { transformer_version: '1' } }
};

afterEach(() => {
  nock.cleanAll();
});

describe('authenticatedGet', () => {
  it('throws the two-factor error when the API responds with HTTP 409', async () => {
    const scope = nock('https://www.alarm.com')
      .get('/web/api/devices/sensors')
      .reply(409, {}, { 'Content-Type': 'application/vnd.api+json' });

    await expect(authenticatedGet(SENSORS_URL, authOpts)).rejects.toThrow(
      'Two factor is enabled on this account but not setup in the plugin. See the wiki for details'
    );
    expect(scope.isDone()).toBe(true);
  });
});

describe('getComponents', () => {
  const deviceResponse = {
    data: [{ id: 'device-1', type: 'devices/sensor', attributes: {} }],
    included: [],
    meta: { transformer_version: '1' }
  };

  it.each([
    { idCount: 50, expectedRequests: 1 },
    { idCount: 51, expectedRequests: 2 },
    { idCount: 101, expectedRequests: 3 }
  ])('splits $idCount IDs into $expectedRequests request(s)', async ({ idCount, expectedRequests }) => {
    const ids = Array.from({ length: idCount }, (_, i) => `id-${i}`);

    const scope = nock('https://www.alarm.com')
      .get(/^\/web\/api\/devices\/sensors/)
      .query(true)
      .times(expectedRequests)
      .reply(200, deviceResponse, { 'Content-Type': 'application/vnd.api+json' });

    const result = await getComponents(SENSORS_URL, ids, authOpts);

    expect(scope.isDone()).toBe(true);
    // Each mocked call returns one device, so the merged result's length equals the request count.
    expect(result.data).toHaveLength(expectedRequests);
  });
});
