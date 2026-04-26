# Skill: Daily Morning Briefing

A comprehensive daily briefing combining a day overview + per-meeting prep. Pulls context from calendar, emails, Teams, Slack, meeting transcripts, and local files to give Maj a full picture before the day starts.

**Slash command**: `/morning`

**Schedule**: Daily, ideally ready by 08:00

---

## Overview

This skill does four things:

1. **Day snapshot** - Calendar overview, conflicts, open threads needing response, actions due
2. **Comms scan** - Unanswered emails/Teams/Slack from key people
3. **Meeting-by-meeting prep** - For each meeting today, full context from all sources
4. **Meeting prep briefs** - After the briefing is posted, automatically run the `/prep` skill for all of today's meetings (chains into `meeting-prep`)

**Chaining**: After the morning briefing is posted, this skill automatically calls the `meeting-prep` skill for today's meetings only (passing specific meeting IDs matched from the calendar, NOT "all"). The morning briefing gives the overview; the prep threads give the deep dive per meeting.

---

## Data Sources

This skill pulls from **all available channels** - local files, Slack MCP, AND Work IQ (M365 Copilot).

### Work IQ queries (emails, Teams, calendar, transcripts)

| Source | What to query | What to extract |
|--------|--------------|-----------------|
| **Calendar** | "What meetings do I have today?" | Full day schedule, times, attendees, conflicts |
| **Inbox emails (14 days)** | "What emails have I received in the last 14 days that I haven't replied to?" | Unanswered threads from key people |
| **Follow-up folder** | "What's in my Outlook follow-up folder?" | Flagged items needing action |
| **Sent emails (14 days)** | "What commitments did I make in emails I sent in the last 14 days? Look for 'I will', 'I'll', 'let me', 'will send', 'will follow up', 'I'll get back to you', 'will share', 'will check'" | Promises Maj made that may need follow-through |
| **Teams channels** | Query each monitored Teams channel (see registry below) | Recent threads, decisions, open questions |
| **Teams DMs** | Query each monitored Teams DM (see registry below) | Open asks, unanswered messages |
| **Meeting transcripts** | "What were the key points from my recent meeting transcripts?" filtered to meetings relevant to today's calendar | Context for recurring meetings - what happened last time |

### Teams Channels to Monitor

| Channel | What to look for |
|---------|-----------------|
| MSFT AI Model Council | Decisions, action items, strategic direction changes |
| AI Data Council | Data strategy updates, pipeline decisions, policy changes |
| MAI Supercomputing Weekly | Infra status, capacity updates, blockers |

### Teams DMs to Monitor

| Person | What to look for |
|--------|-----------------|
| Kutta Srinivasan | Open asks, coordination items, follow-ups |
| Rolf Harms | Open asks, strategic items, follow-ups |
| Michael Yamartino | Open asks, coordination items |
| Bonita Armstrong | Open asks, HR/people items |
| Eric Boyd | Compute/infra coordination, escalations |
| Mat McBride | Open asks, follow-ups |
| Roy Vincent | Open asks, coordination items |
| Venkat PA | Open asks, follow-ups |

### Slack MCP queries (same channels as existing skills)

| Channel | ID | What to look for |
|---------|----|-----------------|
| #ai-noteworthy | C098VHM0560 | Recent updates from team |
| #ai-council | C08S37VTJM8 | Council threads |
| #msi-leads | C0A3NQWQ6H4 | Open decisions, agenda items |
| #ms-strategy | C08128P9480 | Strategy updates |
| #hiring-ai-leadership | C08S4KSM32Q | Hiring asks of Maj |
| #ai-cluster-util | C09DDJZ1WGA | Compute requests |
| Mustafa DM | D07BV8JAMQX | Open asks from Mustafa |
| Karen DM | D07BG9FPWRX | Coordination items |
| Mustafa + Karen group | C07CG48QBL7 | Shared threads |

### Local file sources

| Source | Path | What to extract |
|--------|------|-----------------|
| Action tracker | `5. Automations/data/actions.json` | Actions due today/this week, overdue items |
| TOP OF MIND files | `1. MeetingNotes/MeetingNotes/[folder]/0. TOP OF MIND.md` | Per-meeting briefing context |
| Recent meeting notes | `1. MeetingNotes/MeetingNotes/` | Notes from previous sessions of today's meetings |
| Decision log | `5. Automations/data/decision-log.md` | Recent decisions relevant to today's meetings |
| Compute ledger | `5. Automations/data/compute-ledger.json` | Compute snapshot for infra meetings |

---

## Workflow

### Step 1 - Get today's calendar

Query Work IQ: "What meetings and events are on my calendar today, [date]? Include times, attendees, and any conflicts."

Parse the response into a structured list of meetings with:
- Start/end time
- Title
- Attendees (if available)
- Whether it's a recurring meeting
- Any conflicts

### Step 2 - Scan comms (parallel)

Run these queries in parallel:

**2a. Unanswered emails/Teams from key people (Work IQ)**
- Query: "What emails and Teams messages have I received in the last 7 days from Mustafa Suleyman, Karen Simonyan, Kevin Scott, Eric Boyd, Kutta Srinivasan, Rolf Harms, Michael Yamartino, Bonita Armstrong, Mat McBride, Roy Vincent, Venkat PA that I haven't replied to?"
- Extract: sender, subject/topic, date, urgency level

**2b. Follow-up folder (Work IQ)**
- Query: "What items are in my Outlook follow-up folder?"
- Extract: subject, sender, date flagged, any due dates

**2c. Slack unanswered (Slack MCP)**
- Check Mustafa DM (D07BV8JAMQX) for messages Maj hasn't responded to in last 3 days
- Check Karen DM (D07BG9FPWRX) for same
- Check Mustafa + Karen group (C07CG48QBL7) for same

**2d. Teams DMs (Work IQ)**
- Query for each monitored person: "Any recent Teams messages from [person] that I haven't replied to?"
- Or batch: "What Teams DMs do I have unread or unanswered from Kutta Srinivasan, Rolf Harms, Michael Yamartino, Bonita Armstrong, Eric Boyd, Mat McBride, Roy Vincent, Venkat PA?"

**2e. Actions due (local)**
- Read `actions.json`
- Filter to: overdue items, items due today, items due this week
- Separate by type (for_maj vs for_others)

### Step 3 - Per-meeting context gathering (parallel)

For each meeting on today's calendar:

**3a. Match to meeting registry**
- Check if the meeting title matches a registry entry in `actions.json` -> `meetings.registry`
- If matched: use the meeting ID for targeted queries

**3b. Pull context from all sources**

For each meeting, gather:

| Source | How |
|--------|-----|
| **Open actions** | Filter `actions.json` by `source_meeting` matching this meeting |
| **TOP OF MIND** | Read `0. TOP OF MIND.md` from the meeting's notes folder |
| **Last session's notes** | Find the most recent note file in the meeting's folder |
| **Last session's transcript** | Work IQ: "What were the key points from the last [meeting name] meeting transcript?" |
| **Relevant Slack threads** | Pull from the meeting's Slack channel (last 7 days) |
| **Relevant Teams threads** | Work IQ: "Any recent Teams messages about [meeting topic]?" |
| **Relevant emails** | Work IQ: "Any recent emails about [meeting topic] or from [key attendees]?" |
| **Recent decisions** | Check `decision-log.md` for entries matching this meeting |
| **Compute snapshot** | Only for SCW/infra meetings - read `compute-ledger.json` |

**3c. For non-registry meetings** (ad hoc, one-offs):
- Work IQ: "What context do I have about [meeting title]? Check emails, Teams messages, and previous meeting transcripts"
- Check if there are any relevant Slack threads mentioning the topic or attendees

### Step 4 - Format and post to Slack

Post to Maj's self-DM (`D07AKFZPGCB`) as a threaded message.

**Header message:**
```
Morning briefing - [DD Mon] :thread:
```

**Reply 1 - Day at a glance:**
```
*Today's calendar* ([N] meetings)

[Time] - [Meeting name] [conflict warning if applicable]
[Time] - [Meeting name]
...

[Note any gaps, back-to-back blocks, or conflicts]
```

**Reply 2 - Open threads needing response** (skip if empty):
```
*Unanswered comms*

*Email/Teams*
- [Person] - [subject/topic] - [date] [urgency flag if applicable]
- ...

*Slack*
- [Person] in [channel/DM] - [topic] - [date]
- ...

*Follow-up folder*
- [Subject] from [person] - flagged [date]
- ...
```

**Reply 3 - Actions due** (skip if empty):
```
*Actions due*

*Overdue* ([N])
- [Action] - [owner] - [days late]

*Due today/this week* ([N])
- [Action] - [owner] - due [date]
```

**Reply 4+ - Per-meeting prep** (one reply per meeting):
```
*[Meeting name] - [time]*

*Last session:* [1-2 sentence summary of last transcript/notes]
*Open actions:* [N] items - [list top 2-3]
*TOP OF MIND:* [bullets from TOP OF MIND.md]
*Recent threads:* [key Slack/Teams/email threads relevant to this meeting]
*Decisions to revisit:* [from decision log]
*Suggested talking points:*
- [Point based on open actions, recent threads, and TOP OF MIND]
- [Point based on email/Teams context]
```

### Step 5 - Confirm completion

After posting, briefly confirm in terminal:
```
Morning briefing posted for [DD Mon]:
- [N] meetings prepped
- [N] unanswered comms flagged
- [N] actions due today/this week
```

### Step 6 - Chain into /prep (TODAY'S MEETINGS ONLY)

After the morning briefing is posted, automatically run the meeting-prep skill for only the meetings that are on today's calendar:

1. Read `5. Automations/skills/meeting-prep/SKILL.md`
2. Use the calendar data from Step 1 to identify which meetings are happening today
3. Match today's calendar entries against the meeting-prep registry (by meeting name/title)
4. Run `/prep` with only the matched meeting IDs (e.g., `/prep ai-council msi-leads`) - NOT "all"
5. For any today's meetings that don't match a registry entry, skip them (they're already covered by the per-meeting prep in Reply 4+ of the morning briefing)
6. Do NOT ask for confirmation - just chain directly

**IMPORTANT**: Only prep meetings that are actually on today's calendar. Do NOT prep all weekly meetings - that was the old behavior and gave Maj prep for meetings he didn't have that day.

---

## Style Rules

Follow Maj's Slack style from `../../2. Writing/CLAUDE.md`:
- Direct, punchy, specific - names, dates, numbers
- Use `*bold*` for Slack formatting
- Use `bullet character` for lists
- No emdashes - only hyphens
- No corporate speak or filler
- No greeting or sign-off
- Keep each reply tight and scannable
- Abbreviated where natural ("probs", "Mon/Tue", "re", "btw")
- No emojis except :thread: on header

---

## Edge Cases

- **No meetings today**: Still post the briefing with comms scan and actions due. Skip the per-meeting prep section
- **Work IQ unavailable**: Fall back to Slack MCP + local files only. Note in the briefing: "Email/Teams context unavailable - Slack and local files only"
- **Meeting not in registry**: Use Work IQ to pull whatever context is available by meeting title and attendees. Don't skip unknown meetings
- **No transcript from last session**: Skip the "Last session" line for that meeting. Don't flag it (per Maj's preference to skip silently)
- **Very heavy calendar (10+ meetings)**: Group meetings into Morning/Afternoon/Evening blocks. Only do detailed prep for meetings where Maj is a key participant (not optional/FYI meetings)
- **Slack API rate limits**: Reduce to priority channels only (Mustafa DM, #msi-leads, #ai-council)
- **Duplicate context**: If the same thread appears in both Slack and Teams, deduplicate - show it once with the source noted

---

## File Path Reference

| Source | Path |
|--------|------|
| Action tracker | `5. Automations/data/actions.json` |
| TOP OF MIND files | `1. MeetingNotes/MeetingNotes/[folder]/0. TOP OF MIND.md` |
| Meeting notes | `1. MeetingNotes/MeetingNotes/` (all subfolders) |
| Decision log | `5. Automations/data/decision-log.md` |
| Compute ledger | `5. Automations/data/compute-ledger.json` |
| Slack style guide | `2. Writing/CLAUDE.md` |
| Maj self-DM | D07AKFZPGCB |

---

## Dependencies

- **Work IQ MCP**: Required for calendar, email, Teams, and transcript queries
- **Slack MCP**: Required for Slack channel reads and posting the briefing DM
- **Local files**: actions.json, TOP OF MIND, meeting notes, decision log, compute ledger

---

## Important Notes

- **ONLY post to D07AKFZPGCB** - never any other channel
- **No confirmations** - this skill runs end-to-end without pausing
- **Parallel where possible** - comms scan and meeting context queries should run in parallel for speed
- **Don't invent context** - only surface what exists in the data sources
- **Keep it scannable** - this is a 3-5 minute read at most, not a report
- **Today's date** drives everything - always use the actual current date
