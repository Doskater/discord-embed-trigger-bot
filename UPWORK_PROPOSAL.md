# Upwork Proposal Draft

Hi,

I can build this. I recently built a very similar Discord embed-listener bot: it watches third-party bot embeds, scans embed title, description, and field values case-insensitively, then sends a configurable embed reply, pings a role, and reacts to the original message. It intentionally does not use the usual "ignore bot authors" shortcut because the source messages are from bots.

## Link(s) to similar Discord bots or webhook-relay services shipped

I can share this working reference project:

- Discord Embed Trigger Bot: Node.js + discord.js bot with `/trigger add/edit/remove/list`, `/status`, per-trigger source bot id, phrase, response embed, role ping, reaction emoji, and channel allowlist.

## Stack choice + reason

Node.js + discord.js v14.

Reason: discord.js has mature support for Gateway events, embeds, reactions, and slash commands, and it deploys cleanly to Railway, Render, or Fly.io as a long-running worker.

## Approach to testing and QA

I split the bot into Discord-facing code and testable core logic. The matcher is covered with automated tests for the most important cases:

- bot-authored messages are accepted, not ignored
- title, description, and field values are scanned
- matching is case-insensitive
- wrong source bot ids do not match
- channel allowlists are enforced
- trigger config can be saved and edited

For final QA I would deploy to your server, create a test trigger, post controlled embeds from a test bot or staging source, then verify the reply embed, role ping, reaction, and allowlist behavior in the actual Discord channel.

## Recent experience with similar projects

I have built small automation services that watch events, apply configurable rules, and trigger downstream actions. The closest reference is this Discord embed-trigger bot. I also have webhook/task-routing examples where incoming events are deduplicated, matched to rules, logged, and routed to another tool.

## Fixed-price quote and timeline

Fixed price: $400 for the scoped bot described in your post.

Timeline: 7-10 days for build, deployment, testing, and handover. The one-month window is comfortable, and I would use the extra time for QA and any small adjustments after seeing your real server setup.

## Post-launch tweaks

Yes, I am open to small paid tweaks after launch, such as adding another trigger option, improving embed formatting, or adjusting admin command behavior.
