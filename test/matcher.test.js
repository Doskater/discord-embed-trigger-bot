import test from 'node:test';
import assert from 'node:assert/strict';
import { collectEmbedText, findMatchingTriggers } from '../src/matcher.js';

const trigger = {
  id: 'rare-drop',
  sourceBotId: 'bot-1',
  phrase: 'rare drop detected',
  response: { title: 'Alert', description: 'Matched', color: 123 },
  pingRoleId: 'role-1',
  reactionEmoji: '🚨',
  channelAllowlist: ['channel-1'],
  enabled: true
};

test('collectEmbedText scans title, description, and field values', () => {
  const text = collectEmbedText([
    {
      title: 'Inventory',
      description: 'Daily report',
      fields: [
        { name: 'Ignored', value: 'Rare Drop Detected' }
      ]
    }
  ]);

  assert.match(text, /Inventory/);
  assert.match(text, /Daily report/);
  assert.match(text, /Rare Drop Detected/);
});

test('findMatchingTriggers matches bot-authored embeds case-insensitively', () => {
  const message = {
    author: { id: 'bot-1', bot: true },
    channelId: 'channel-1',
    embeds: [{ title: 'RARE DROP DETECTED', description: '', fields: [] }]
  };

  assert.deepEqual(findMatchingTriggers(message, [trigger]).map((item) => item.id), ['rare-drop']);
});

test('findMatchingTriggers does not ignore bot authors by default', () => {
  const message = {
    author: { id: 'bot-1', bot: true },
    channelId: 'channel-1',
    embeds: [{ title: '', description: 'rare drop detected', fields: [] }]
  };

  assert.equal(findMatchingTriggers(message, [trigger]).length, 1);
});

test('findMatchingTriggers respects source bot and channel allowlist', () => {
  const wrongSource = {
    author: { id: 'bot-2', bot: true },
    channelId: 'channel-1',
    embeds: [{ description: 'rare drop detected' }]
  };
  const wrongChannel = {
    author: { id: 'bot-1', bot: true },
    channelId: 'channel-2',
    embeds: [{ description: 'rare drop detected' }]
  };

  assert.equal(findMatchingTriggers(wrongSource, [trigger]).length, 0);
  assert.equal(findMatchingTriggers(wrongChannel, [trigger]).length, 0);
});
