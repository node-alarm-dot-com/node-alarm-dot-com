import nock from 'nock';
import { afterEach, describe, expect, it } from 'vitest';
import { AuthOpts } from '../../src/_models/AuthOpts';
import { armStay, disarm } from '../../src/partitions';

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

describe('partitionAction body shape', () => {
  it('omits noEntryDelay and silentArming when disarming', async () => {
    let capturedBody: Record<string, unknown> = {};

    nock('https://www.alarm.com')
      .post('/web/api/devices/partitions/id-partition-1/disarm')
      .reply(200, (_uri, body) => {
        capturedBody = body as Record<string, unknown>;
        return { data: {} };
      });

    await disarm('id-partition-1', authOpts);

    expect(capturedBody['noEntryDelay']).toBeUndefined();
    expect(capturedBody['silentArming']).toBeUndefined();
    expect(capturedBody['statePollOnly']).toBe(false);
  });

  it('includes nightArming only when explicitly true, and omits forceBypass when false', async () => {
    let capturedBody: Record<string, unknown> = {};

    nock('https://www.alarm.com')
      .post('/web/api/devices/partitions/id-partition-1/armStay')
      .reply(200, (_uri, body) => {
        capturedBody = body as Record<string, unknown>;
        return { data: {} };
      });

    await armStay('id-partition-1', authOpts, {
      noEntryDelay: false,
      silentArming: false,
      nightArming: true,
      forceBypass: false
    });

    expect(capturedBody['nightArming']).toBe(true);
    expect('forceBypass' in capturedBody).toBe(false);
  });
});
