# Skill: Meeting Prep Briefer

Generates a meeting prep brief for each standing meeting. Pulls open actions, TOP OF MIND context, recent Slack threads, decision log entries, and compute snapshots (for infra meetings). Posts each brief as a separate thread in Maj's self-DM.

**Trigger**: `/prep` or as part of `/briefing` workflow

---

## Overview

When run standalone, preps for a specific meeting (or all if none specified). When called from the Monday briefing workflow, generates prep for ALL standing meetings that week. Each brief is posted as a separate thread in Maj's Slack self-DM.

**IMPORTANT - No Confirmations**: This skill runs end-to-end without asking for permission. Gather data, build the briefs, post to Slack. Do not pause for confirmation at any step.

---

## Input

| Input | Example | What it does |
|-------|---------|--------------|
| **Meeting ID** | `/prep ai-council` | Preps only that meeting |
| **Multiple IDs** | `/prep ai-council scw` | Preps the specified meetings |
| **"all" or blank** | `/prep` or `/prep all` | Preps ALL standing meetings |

---

## Meeting Registry

| Meeting | ID | Channel ID | Channel | Cadence | Notes Folder | Has Compute? |
|---------|-----|------------|---------|---------|--------------|--------------|
| AI Council | `ai-council` | `C08S37VTJM8` | #ai-council | Weekly | `AI Council + SPR` | No |
| SCW | `scw` | None | No dedicated channel | Weekly | `Infra - SCW, Maia, Apollo, SLT` | Yes |
| MSI Leads | `msi-leads` | `C0A3NQWQ6H4` | #msi-leads | 2x/week | `MSI leads` | No |
| Mustafa Syncs | `mustafa-sync` | `D07BV8JAMQX` | Mustafa DM | 2-3x/week | `Mustafa syncs` | No |
| SLT Models / AIMC | `slt-models` | None | No dedicated channel | Weekly | `SLT Models` | No |
| Data Council | `data-council` | None | No dedicated channel | As scheduled | None | No |

---

## Workflow

### Step 1 - Determine which meetings to prep

- If Maj specified one or more meeting IDs, prep only those meetings
- If Maj said "all" or gave no input, prep ALL meetings in the registry above
- **When called from `/morning`**: The morning briefing will pass specific meeting IDs based on today's calendar - only prep those. Do NOT prep all meetings when called from the morning briefing
- Use today's date to calculate "w/c [date]" (week commencing - use the Monday of this week)

### Step 2 - For each meeting, gather the context package

Run these in parallel where possible for speed.

#### 2a. Open actions from last session

- Read `5. Automations/data/actions.json`
- Filter the `actions` array for entries where `source_meeting` matches the meeting ID
- Only include items where `completed` is `false` and `archived` is `false`
- Sort by `date_started` (oldest first)
- Cap at 5 items max - if more, show the 5 most relevant (overdue first, then oldest)

#### 2b. TOP OF MIND bullets

- Look up the meeting's notes folder from the registry
- Read the `0. TOP OF MIND.md` file in: `1. MeetingNotes/MeetingNotes/[notes_folder]/0. TOP OF MIND.md`
- Extract the current bullets (these are the live briefing context for this meeting's domain)
- If no TOP OF MIND file exists for this meeting, skip this section

#### 2c. Slack threads since last meeting

- Only for meetings that have a channel ID (skip for SCW, SLT Models, Data Council)
- Use `slack_conversations_history` to pull messages from the meeting's channel
- **Time window**: Last 7 days (calculate Unix timestamp for 7 days ago, use as `oldest` parameter)
- Pull up to 50 messages
- For threads with 3+ replies, use `slack_get_thread` to read the full thread
- Summarize: thread topic, key takeaway, reply count
- Cap at 5 threads max - pick the ones with most activity or most relevance

#### 2d. Recent decisions

- Check if `5. Automations/data/decision-log.md` exists
- If it exists, read it and extract the last 2-3 decisions that match this meeting's forum/domain
- If it doesn't exist, skip this section entirely (don't error, don't mention it)

#### 2e. Compute status (SCW/infra meetings ONLY)

- Only include this for `scw` meeting ID
- Check if `5. Automations/data/compute-ledger.json` exists
- If it exists, read it and extract the current allocation snapshot (cluster names + allocations)
- If it doesn't exist, skip this section (don't error, don't mention it)

#### 2f. Recent emails related to the meeting (Work IQ)

- Query Work IQ: "What recent emails have I sent or received about [meeting topic / meeting name]? Also check for emails from [key attendees listed in the meeting registry]."
- Extract: key threads, decisions communicated, open questions, any pre-reads or docs shared
- If no relevant emails found, skip this section silently

#### 2g. Teams threads related to the meeting (Work IQ)

- Query Work IQ for relevant Teams channel activity:
  - For `ai-council`: "What were the recent discussions in the MSFT AI Model Council Teams channel?"
  - For `scw`: "What were the recent discussions in the MAI Supercomputing Weekly Teams channel?"
  - For `data-council`: "What were the recent discussions in the AI Data Council Teams channel?"
  - For other meetings: "Any recent Teams messages about [meeting topic]?"
- Also check Teams DMs with key attendees: Kutta Srinivasan, Rolf Harms, Michael Yamartino, Bonita Armstrong, Eric Boyd, Mat McBride, Roy Vincent, Venkat PA
- Extract: relevant threads, decisions, open questions
- If no relevant Teams activity, skip silently

#### 2h. Last session transcript (Work IQ)

- Query Work IQ: "What were the key discussions and decisions from the most recent [meeting name] meeting transcript?"
- This provides context from the last session even if Maj didn't take manual notes
- Extract: 2-3 sentence summary of what was covered, any carry-over items
- If no transcript available, skip silently

### Step 3 - Format each meeting's brief

For each meeting, compose the brief using these sections. Only include sections that have content - skip empty sections rather than showing "None".

**Header format:**
```
[Meeting Name] prep - w/c [DD Mon] :thread:
```

**Reply 1 - Open actions** (if any exist):
```
**Open actions** ([X] items)
• [Action description] - [DRI/Owner] - [status context: due date, days open, or "no due date"]
• ...
```

**Reply 2 - TOP OF MIND** (if file exists):
```
**TOP OF MIND**
• [Bullet from briefing doc]
• ...
```

**Reply 3 - Slack threads since last session** (if channel exists and threads found):
```
**Slack threads since last session**
• [Thread topic] - [key takeaway] ([X] replies)
• ...
```

**Reply 4 - Recent decisions** (if decision log exists and has relevant entries):
```
**Recent decisions**
• [Decision] - [date]
• ...
```

**Reply 5 - Compute snapshot** (SCW only, if ledger exists):
```
**Compute snapshot**
• [Cluster]: [allocation details]
• ...
```

**Reply 6 - Email/Teams context** (if relevant content found via Work IQ):
```
**Email/Teams context**
• [Email thread or Teams discussion summary]
• [Pre-reads or docs shared]
• ...
```

**Reply 7 - Last session recap** (if transcript available via Work IQ):
```
**Last session recap** ([date])
• [2-3 sentence summary from transcript]
• [Carry-over items or unfinished threads]
```

### Step 4 - Post to Slack

**ONLY post to Maj's self-DM: `D07AKFZPGCB`**. Never any other channel.

For each meeting:

1. **Send header message** to `D07AKFZPGCB`:
   - Text: `[Meeting Name] prep - w/c [DD Mon] :thread:`
   - Capture `thread_ts` from the response

2. **Send each section as a reply** in the thread:
   - Use `thread_ts` from the header message
   - Send each content section as a separate reply (not one giant message)
   - Skip sections with no content

3. **Move to the next meeting** - each meeting gets its own thread

### Step 5 - Confirm completion

After all meetings are posted, briefly confirm in the terminal:
```
Posted prep briefs for [X] meetings to self-DM:
• AI Council prep - w/c 10 Mar
• SCW prep - w/c 10 Mar
• ...
```

---

## Known Slack User IDs

Use these when referencing people in the briefs.

| Person | Slack ID | Usage in messages |
|--------|----------|-------------------|
| Mustafa Suleyman | U06US8T3CQG | `<@U06US8T3CQG>` |
| Maj (self) | U07AD0R06R4 | `<@U07AD0R06R4>` |
| Paul Soulos | U094XBL8U0G | `<@U094XBL8U0G>` |
| James Cerra | U0AGP746ENT | `<@U0AGP746ENT>` |
| Chris Daly | U075KNETM7F | `<@U075KNETM7F>` |

For anyone else, use their name as it appears in actions.json.

---

## Key Channel IDs

| Channel | ID | Purpose |
|---------|----|---------|
| #ai-council | C08S37VTJM8 | Source - pull threads for AI Council prep |
| #msi-leads | C0A3NQWQ6H4 | Source - pull threads for MSI Leads prep |
| Mustafa DM | D07BV8JAMQX | Source - pull threads for Mustafa Sync prep |
| Maj self-DM | D07AKFZPGCB | Destination - post ALL briefs here ONLY |

---

## Style Rules

Follow Maj's Slack style from `../../2. Writing/CLAUDE.md`:

- No emdashes - only hyphens
- Use `•` (bullet character U+2022) for Slack lists, not `-` or `*`
- Direct, punchy, specific - names, dates, numbers
- Keep each reply tight - 3-5 bullets max per section
- No greeting or sign-off
- No corporate speak or filler language
- Bold section headers using `**Header**`
- Abbreviated where natural ("probs", "Mon/Tue", etc.)
- No emojis except `:thread:` on header messages

---

## Edge Cases

- **No open actions for a meeting**: Skip the "Open actions" section - don't include an empty section
- **No TOP OF MIND file**: Skip that section silently
- **Channel has no recent threads**: Skip the "Slack threads" section
- **Decision log doesn't exist**: Skip that section silently - do not create the file or mention it
- **Compute ledger doesn't exist**: Skip the compute section silently for SCW
- **Meeting has no channel**: Only include actions, TOP OF MIND, and email/Teams context sections (no Slack threads)
- **Work IQ unavailable**: Skip email/Teams/transcript sections. Note: "Email/Teams context unavailable" in the brief
- **No relevant emails or Teams threads**: Skip those sections silently - don't include empty sections
- **All sections empty for a meeting**: Still post the header thread but add one reply: "No open items or recent activity for this session"
- **Slack API rate limits**: If hitting rate limits on thread pulls, reduce to header messages only and note the limitation
- **Called from Monday briefing**: Behave identically but prep ALL meetings - the briefing skill handles sequencing
- **Called from morning briefing (`/morning`)**: Only prep the specific meeting IDs passed by the morning briefing - these are filtered to today's calendar. Do NOT default to "all"

---

## File Path Reference

All paths relative to project root (`4. AGENT/`):

| File | Path | Description |
|------|------|-------------|
| Action tracker | `5. Automations/data/actions.json` | Open actions by source_meeting |
| TOP OF MIND files | `1. MeetingNotes/MeetingNotes/[folder]/0. TOP OF MIND.md` | Per-meeting briefing context |
| Decision log | `5. Automations/data/decision-log.md` | Recent decisions (if exists) |
| Compute ledger | `5. Automations/data/compute-ledger.json` | Compute allocations (if exists) |
| Slack style guide | `2. Writing/CLAUDE.md` | Maj's Slack voice |

---

## Important Notes

- **ONLY post to D07AKFZPGCB** - never any other channel or DM
- **One thread per meeting** - never combine multiple meetings into one thread
- **Never invent content** - only surface what exists in the data sources
- **Skip empty sections** - don't include headers with "None" or "N/A"
- **Keep it scannable** - this is a 30-second-per-meeting read, not a report
- **Today's date** drives all time windows - always use the actual current date
