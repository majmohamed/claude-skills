# Skill: End-of-Day Processor

Unified end-of-day flow that captures everything from the day. Scans local unprocessed meeting notes AND pulls meeting transcripts via Work IQ, runs the full process-meeting pipeline on each, updates TOP OF MIND files, logs decisions, and posts a summary.

**Slash command**: `/eod`

**Chains**: `process-meeting` pipeline + `top-of-mind-refresh` + `decision-log` (all built into this flow)

---

## Overview

This is the single end-of-day skill. It replaces running `/notes` + `/eod` separately.

1. **Scan local files** - Check `1. MeetingNotes/MeetingNotes/` for unprocessed note files from today (same as process-meeting Mode A auto-scan)
2. **Pull transcripts** - Query Work IQ for all meetings attended today with transcripts
3. **Deduplicate** - Skip anything already processed (in processed-files.json or matching a local file)
4. **Process each meeting** - Extract actions, draft Slack summary, save file (Slack Summary + Raw Notes)
5. **Update TOP OF MIND** - For each processed meeting where a `0. TOP OF MIND.md` exists (chains `top-of-mind-refresh`)
6. **Log decisions** - Extract decisions from each processed meeting into `decision-log.md` (chains `decision-log`)
7. **Post summary** - Threaded summary to Maj's self-DM

**IMPORTANT - No Confirmations**: This skill runs end-to-end without asking for permission.

---

## Workflow

### Step 1 - Scan local unprocessed files

Run the same auto-scan logic as process-meeting Mode A:

**1a.** Scan all subfolders under `1. MeetingNotes/MeetingNotes/` for `.md` files from today (or last 24 hours).

Exclude: `Template/` folder, `0. TOP OF MIND.md` files, non-`.md` files.

**1b.** Read `5. Automations/data/processed-files.json`. A file needs processing if:
- Not in tracker at all
- Seeded only (`steps_completed: ["seeded"]`)
- Content changed (hash differs)

**1c.** Auto-detect meeting type from folder using the registry in `actions.json` -> `meetings.registry`.

**1d.** Check if file already has a `## Slack Summary` section (already processed).

### Step 2 - Pull today's transcripts from Work IQ

Query Work IQ: "What meetings did I attend today, [date]? For each meeting, provide the meeting title, start time, attendees, and a detailed summary from the transcript including key discussions, decisions made, and action items assigned. Only include meetings that were recorded/transcribed."

If Work IQ returns meetings without detailed transcript content, make a follow-up query per meeting: "Summarize the full transcript of [meeting name] from [date]. Include all key discussions, decisions, action items with owners, and any important details."

**Skip silently**: Meetings with no transcript or poor quality transcripts.

### Step 3 - Build combined processing queue

Merge local files (Step 1) and Work IQ transcripts (Step 2) into a single queue:

| # | Date | Source | File/Meeting | Type | Status |
|---|------|--------|-------------|------|--------|
| 1 | 2026-03-23 | local file | 260323 AI council.md | ai-council | raw |
| 2 | 2026-03-23 | Work IQ | Data Council sync | other | transcript |
| 3 | 2026-03-23 | local file | 260323 Mustafa Sync.md | mustafa-sync | formatted |

**Deduplication rules**:
- If a local file AND a transcript exist for the same meeting (matched by date + title/type), prefer the local file (it likely has Maj's personal annotations)
- Skip anything already in processed-files.json with matching hash

### Step 4 - Match transcripts to registry

For Work IQ-sourced meetings, match to the registry:

| Registry ID | Title patterns to match |
|-------------|------------------------|
| `ai-council` | "AI Council", "AIC", "AI Model Council", "MSFT AI Model Council" |
| `scw` | "SCW", "Supercomputing Weekly", "MAI Supercomputing" |
| `mustafa-sync` | "Mustafa", "1:1 with Mustafa" |
| `msi-leads` | "MSI Leads", "MSI leadership" |
| `slt-models` | "SLT Models", "AIMC" |
| `data-council` | "Data Council", "AI Data Council" |

Also match by attendee overlap (>50% same attendees = match).

Unmatched meetings: `meeting_type: "other"`, saved to `Ad hoc` subfolder.

### Step 5 - Process each meeting

For each item in the queue, run the full pipeline. Follow the process-meeting skill (`process-meeting/SKILL.md`):

**5a. Extract action items** (same as process-meeting Step 1)

- Read `5. Automations/data/actions.json` fresh before each batch write
- Extract actions from raw notes/transcript
- Set `type` based on registry mapping (for_maj vs for_others)
- Generate UUIDs, set priority, deduplicate against existing actions
- Append to `actions` array and write back

**5b. Draft Slack summary** (same as process-meeting Step 2)

Write a `## Slack Summary` section using the threaded format:

```markdown
## Slack Summary

### Thread heading
[Meeting Name] - [DD Mon YYYY] :thread:

### Summary notes and decisions
- [Key discussion point or outcome - 1 sentence]
- [Decision made]

### Action items
- [Action description] - [Owner]
- [Action description] - [Owner] - due [date if applicable]
```

Format rules:
- Thread heading = meeting name + date + :thread:
- Reply 1 = summary notes AND decisions combined into bullet points
- Reply 2 = action items only
- Use `*bold*` for headers
- Max 5-6 bullets in summary, be ruthless
- Skip action items reply if there are none

**5c. Save the meeting notes file**

File structure (all meeting types):
```markdown
## Slack Summary
[as drafted above]

---

# Raw Notes
[Original content preserved exactly]
```

For transcript-sourced meetings with no local raw notes, use `# Transcript Source` instead:
```markdown
---

# Transcript Source

Source: Meeting transcript via Work IQ
Meeting: [Meeting title]
Date: [Date and time]
Duration: [Duration if available]
Attendees: [List if available]
```

File path: `1. MeetingNotes/MeetingNotes/[subfolder]/[YYMMDD] [Max 3 words].md`

Subfolder routing:

| Meeting type | Subfolder |
|-------------|-----------|
| `ai-council` | `AI Council + SPR` |
| `scw` | `Infra - SCW, Maia, Apollo, SLT` |
| `mustafa-sync` | `Mustafa syncs` |
| `msi-leads` | `MSI leads` |
| `slt-models` | `SLT Models` |
| `data-council` | `Ad hoc` |
| `other` | `Ad hoc` |

**5d. Draft Slack summary (new threaded format)**

Write a `## Slack Summary` section into the notes file using the new threaded format:

```markdown
## Slack Summary

### Thread heading
[Meeting Name] - [DD Mon YYYY] :thread:

### Summary notes and decisions
• [Key discussion point or outcome - 1 sentence]
• [Key discussion point or outcome]
• [Decision made]

### Action items
• [Action description] - [Owner]
• [Action description] - [Owner] - due [date if applicable]
```

Format rules:
- Thread heading = meeting name + date + :thread:
- Reply 1 = summary notes AND decisions combined into bullet points
- Reply 2 = action items only
- Use `•` bullet character, `*bold*` for headers
- Max 5-6 bullets in summary, be ruthless
- Skip action items reply if there are none

**5e. Update TOP OF MIND (chains top-of-mind-refresh)**

- Check if `0. TOP OF MIND.md` exists in the target subfolder
- If yes: read it, update based on what was discussed/decided, remove stale items, add new items
- If no: **create it**. Use the folder-specific section structure from `1. MeetingNotes/CLAUDE.md` if one is defined for that folder, otherwise use 5-10 fulsome bullets covering the key topics from this meeting. Add a `Last updated: [YYYY-MM-DD]` line at the top
- Follow all TOP OF MIND rules from `1. MeetingNotes/CLAUDE.md`: write fulsome briefings (not sparse bullets), pull from Slack context, use bold labels for sub-topics, name people and their positions, flag what's unresolved, no arbitrary bullet count limits

**5f. Log decisions (chains decision-log)**

- Read `5. Automations/skills/decision-log/SKILL.md` for the extraction rules
- Scan processed notes for decisions (outcomes agreed/resolved, distinct from actions)
- Append new decisions to `5. Automations/data/decision-log.md` in the current month's table
- If decision-log.md doesn't exist, create it

**5g. Update processed-files.json**

- Add/update entry with `file_name`, `file_path`, `subfolder`, `meeting_type`, `file_hash`, `steps_completed: ["eod"]`, `processed_at`
- Update `last_run` and `last_run_status` at top level

### Step 6 - Post summary to Slack

Post to Maj's self-DM (`D07AKFZPGCB`):

**Header:**
```
EOD notes processed - [DD Mon] :thread:
```

**Reply 1 - What was processed:**
```
*Processed [N] meetings from today*

• [Time] [Meeting name] -> [subfolder] ([N] actions, [source: local/transcript])
• [Time] [Meeting name] -> [subfolder] ([N] actions, [source: local/transcript])

*Skipped* (no transcript): [N]
*Already processed*: [N]
*TOP OF MIND updated*: [N] files
*Decisions logged*: [N]
```

**Reply 2 - Actions extracted** (skip if none):
```
*Actions extracted today* ([N] total)

*For others to track:*
• [Action] - [Owner] (from [meeting])

*For you:*
• [Action] (from [meeting])
```

### Step 7 - Confirm in terminal

```
EOD processing complete for [DD Mon]:
- [N] meetings processed ([N] local files, [N] transcripts)
- [N] note files saved
- [N] action items extracted
- [N] TOP OF MIND files updated
- [N] decisions logged
```

### Step 8 - Chain into /compute

After processing is complete, automatically run the compute-tracker skill:

1. Read `5. Automations/skills/compute-tracker/SKILL.md`
2. Run the full compute workflow (read #ai-cluster-util, update ledger, post summary to self-DM)
3. Do NOT ask for confirmation - just chain directly

### Step 9 - Chain into /chase

After compute is done, automatically run the action-chaser skill:

1. Read `5. Automations/skills/action-chaser/SKILL.md`
2. Run the full chase workflow (categorize actions including today's newly extracted ones, draft chases, post status to self-DM)
3. Do NOT ask for confirmation - just chain directly

This ensures the end-of-day self-DM has three threads: EOD notes summary, compute update, and action tracker status.

---

## Style Rules

Follow Maj's Slack style from `../../2. Writing/CLAUDE.md`:
- No emdashes - only hyphens
- Direct, specific, no filler
- No greeting or sign-off
- No emojis except :thread: on header

For the notes themselves, all meeting types use the same format: Slack Summary + Raw Notes. Follow process-meeting/SKILL.md.

For Slack summaries, use the threaded format:
- Thread heading with date
- Reply 1: Summary notes and decisions (combined bullets)
- Reply 2: Action items

---

## Edge Cases

- **No local files AND no transcripts**: Post: "No meetings to process today" and exit
- **Work IQ unavailable**: Still process local files. Note in summary: "Transcripts unavailable - local files only"
- **Transcript is low quality**: Skip silently
- **Meeting already processed**: Skip - check processed-files.json and local note files
- **Duplicate across local + transcript**: Prefer local file, skip transcript version
- **Very long meeting (2+ hours)**: Multiple Work IQ queries for full coverage
- **Personal calendar items**: Skip (no transcripts)
- **User specifies a different date**: Use that date instead of today (e.g., "yesterday", "Friday")

---

## File Path Reference

| Source | Path |
|--------|------|
| Action tracker | `5. Automations/data/actions.json` |
| Processed file tracker | `5. Automations/data/processed-files.json` |
| Meeting notes root | `1. MeetingNotes/MeetingNotes/` |
| Decision log | `5. Automations/data/decision-log.md` |
| Decision log skill | `5. Automations/skills/decision-log/SKILL.md` |
| TOP OF MIND files | `1. MeetingNotes/MeetingNotes/[folder]/0. TOP OF MIND.md` |
| TOP OF MIND rules | `1. MeetingNotes/CLAUDE.md` |
| Process meeting templates | `5. Automations/skills/process-meeting/SKILL.md` |
| Slack style guide | `2. Writing/CLAUDE.md` |
| Maj self-DM | D07AKFZPGCB |

---

## Dependencies

- **Work IQ MCP**: Required for transcript access (falls back to local-only if unavailable)
- **Slack MCP**: Required for posting the summary DM
- **Local files**: actions.json, processed-files.json, decision-log.md, TOP OF MIND files

---

## Important Notes

- **ONLY post to D07AKFZPGCB** - never any other channel
- **No confirmations** - run end-to-end without pausing
- **This is THE unified end-of-day flow** - it replaces running `/notes` + old `/eod` separately
- **Chains three auto-skills**: process-meeting pipeline + top-of-mind-refresh + decision-log
- **Full process-meeting quality** - same templates, same rigor, same action extraction
- **Never invent content** - only work from what the transcript or local file contains
- **Deduplicate actions** - don't create duplicates across local files and transcripts
- **Today's date** drives everything unless user specifies otherwise
- **Skip meetings with no transcript silently**
