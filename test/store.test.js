import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { TriggerStore } from '../src/store.js';

test('TriggerStore persists and edits triggers', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'discord-trigger-store-'));
  const store = new TriggerStore(join(dir, 'triggers.json'));

  await store.upsert({
    id: 'alpha',
    sourceBotId: 'bot-1',
    phrase: 'price alert',
    response: { title: 'Matched', description: 'First save' },
    channelAllowlist: ['channel-1'],
    enabled: true
  });

  await store.upsert({
    id: 'alpha',
    sourceBotId: 'bot-1',
    phrase: 'price alert',
    response: { title: 'Matched', description: 'Edited' },
    channelAllowlist: ['channel-1', 'channel-2'],
    enabled: true
  });

  const triggers = await store.list();
  assert.equal(triggers.length, 1);
  assert.equal(triggers[0].response.description, 'Edited');
  assert.deepEqual(triggers[0].channelAllowlist, ['channel-1', 'channel-2']);
});
