export function findMatchingTriggers(message, triggers) {
  if (!message?.author?.bot) return [];
  if (!Array.isArray(message.embeds) || message.embeds.length === 0) return [];

  return triggers.filter((trigger) => {
    if (!trigger.enabled) return false;
    if (trigger.sourceBotId !== message.author.id) return false;
    if (trigger.channelAllowlist.length > 0 && !trigger.channelAllowlist.includes(message.channelId)) {
      return false;
    }

    const haystack = collectEmbedText(message.embeds).toLocaleLowerCase();
    return haystack.includes(trigger.phrase.toLocaleLowerCase());
  });
}

export function collectEmbedText(embeds) {
  return embeds
    .flatMap((embed) => [
      embed.title,
      embed.description,
      ...(Array.isArray(embed.fields) ? embed.fields.map((field) => field.value) : [])
    ])
    .filter(Boolean)
    .join('\n');
}
