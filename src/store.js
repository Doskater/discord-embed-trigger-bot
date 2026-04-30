import { dirname } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const EMPTY_STORE = { triggers: [] };

export class TriggerStore {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async load() {
    try {
      const raw = await readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(raw);
      return normalizeStore(parsed);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return { ...EMPTY_STORE };
      }
      throw error;
    }
  }

  async save(store) {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(normalizeStore(store), null, 2)}\n`, 'utf8');
  }

  async list() {
    const store = await this.load();
    return store.triggers;
  }

  async upsert(trigger) {
    const store = await this.load();
    const normalized = normalizeTrigger(trigger);
    const index = store.triggers.findIndex((item) => item.id === normalized.id);

    if (index >= 0) {
      store.triggers[index] = { ...store.triggers[index], ...normalized };
    } else {
      store.triggers.push(normalized);
    }

    await this.save(store);
    return normalized;
  }

  async remove(id) {
    const store = await this.load();
    const before = store.triggers.length;
    store.triggers = store.triggers.filter((trigger) => trigger.id !== id);
    await this.save(store);
    return before !== store.triggers.length;
  }
}

function normalizeStore(store) {
  return {
    triggers: Array.isArray(store?.triggers) ? store.triggers.map(normalizeTrigger) : []
  };
}

export function normalizeTrigger(trigger) {
  const id = String(trigger.id || '').trim();
  const sourceBotId = String(trigger.sourceBotId || '').trim();
  const phrase = String(trigger.phrase || '').trim();
  const pingRoleId = String(trigger.pingRoleId || '').trim();
  const reactionEmoji = String(trigger.reactionEmoji || '').trim();
  const channelAllowlist = Array.isArray(trigger.channelAllowlist)
    ? trigger.channelAllowlist.map((item) => String(item).trim()).filter(Boolean)
    : [];

  if (!id) throw new Error('Trigger id is required.');
  if (!sourceBotId) throw new Error('Source bot id is required.');
  if (!phrase) throw new Error('Trigger phrase is required.');

  return {
    id,
    sourceBotId,
    phrase,
    response: {
      title: String(trigger.response?.title || 'Trigger matched').trim(),
      description: String(trigger.response?.description || '').trim(),
      color: Number.isInteger(trigger.response?.color) ? trigger.response.color : 5814783
    },
    pingRoleId,
    reactionEmoji,
    channelAllowlist,
    enabled: trigger.enabled !== false
  };
}
