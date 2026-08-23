import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import nock from 'nock';
import type { AuthOpts } from '../../src/_models/AuthOpts.js';
import { armStay, disarm } from '../../src/partitions.js';

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

void describe('partitionAction body shape', () => {
  void it('omits noEntryDelay and silentArming when disarming', async () => {
    let capturedBody: Record<string, unknown> = {};

    nock('https://www.alarm.com')
      .post('/web/api/devices/partitions/id-partition-1/disarm')
      .reply(200, (_uri, body) => {
        capturedBody = body as Record<string, unknown>;
        return { data: {} };
      });

    await disarm('id-partition-1', authOpts);

    assert.strictEqual(capturedBody['noEntryDelay'], undefined);
    assert.strictEqual(capturedBody['silentArming'], undefined);
    assert.strictEqual(capturedBody['statePollOnly'], false);
  });

  void it('includes nightArming only when explicitly true, and omits forceBypass when false', async () => {
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

    assert.strictEqual(capturedBody['nightArming'], true);
    assert.strictEqual('forceBypass' in capturedBody, false);
  });
});
