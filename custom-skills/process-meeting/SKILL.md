---
name: process-meeting
description: Process meeting notes - auto-scans for recent unprocessed files in MeetingNotes, or accepts manually pasted notes. Extracts actions, drafts Slack summaries, preserves raw notes.
---

# Process Meeting Notes

Two modes:
- **Auto-Scan** (default): Scans `1. MeetingNotes/MeetingNotes/` for files from the last 7 days that haven't been processed yet, and runs the full pipeline on each.
- **Manual Paste**: When the user pastes raw notes, processes them as before.

Produces four outputs per meeting:
1. Action items extracted into `actions.json`
2. Slack summary written directly into the meeting notes file
3. Slack summary also shown in a code block for copy-paste
4. Updated TOP OF MIND.md (if one exists for the meeting folder)

The saved meeting notes file always has this structure:
```
## Slack Summary
[threaded summary - heading, notes+decisions, actions]

---

# Raw Notes
[original text preserved exactly as-is]
```

**IMPORTANT - No Confirmations**: This skill runs end-to-end without asking for permission. Do NOT pause to show formatted notes, do NOT ask to confirm actions, do NOT ask before saving files. Just execute all steps and show the Slack summary at the end. The only time to ask a question is when required information is genuinely missing (e.g., meeting type can't be inferred, no date can be found).

**IMPORTANT - Raw Notes**: The raw notes section is sacred. Never modify, rewrite, summarize, or clean up anything below the `# Raw Notes` header. Preserve the original text exactly as the user wrote or pasted it.

---

## Mode Detection

**Mode A (Auto-Scan)** - use when: the user's message is just `/mtg`, "process meetings", "any unprocessed notes?", "check for new meetings", or similar with no pasted content.

**Mode B (Manual Paste)** - use when: the user's message contains substantial text (>3 lines of meeting content), `#action`/`#conclusion` tags, or explicitly says "process these notes".

---

## Auto-Scan Logic (Mode A)

When triggered without pasted notes, run these steps before the processing pipeline:

### Step 0A: Discover files from the last 7 days

Scan all subfolders under `1. MeetingNotes/MeetingNotes/` for `.md` files.

**Exclude**: `Template/` folder, `0. TOP OF MIND.md` files, any non-`.md` files.

**Date extraction from filename** - try these patterns in order:

1. **YYMMDD prefix** (most common): filename starts with 6 digits followed by a space
   - `260211 AI council - VLM.md` -> `2026-02-11`
   - `251218 SFT Distillation Review.md` -> `2025-12-18`

2. **YYMMDD elsewhere**: 6 digits appear after a space or dash
   - `SPR 260210.md` -> `2026-02-10`
   - `Doug Finance chat - 260204.md` -> `2026-02-04`

3. **No date in filename**: files like `Clawdbot.md`, `SLT infra.md` -> **skip** in auto-scan mode

**Parsing**: `YYMMDD` -> `20YY-MM-DD`. Validate month (01-12) and day for that month.

**7-day window**: File date must be within 7 calendar days of today (inclusive on both ends).

### Step 0B: Filter to unprocessed files

Read `5. Automations/data/processed-files.json`. A file needs processing if ANY of:

1. **Not in tracker at all** - file path doesn't appear in `processed[]`
2. **Seeded only** - exists with `steps_completed: ["seeded"]`
3. **Content changed** - `steps_completed` includes `"process-meeting"` but file's current SHA-256 hash differs from stored `file_hash`

**Skip if**: `steps_completed` includes `"process-meeting"` AND hash matches (already processed, unchanged).

### Step 0C: Auto-detect meeting type from folder

Build a reverse lookup from `actions.json` -> `meetings.registry`:
- Map each registry entry's `notes_folder` to its meeting `id`
- Any subfolder not matching a registry entry -> `meeting_type: "other"`

### Step 0D: Check if file already has a Slack Summary

Read the file and check for `## Slack Summary` section.

- **Already has Slack Summary** -> skip Steps 1-2, but still run Steps 3-4
- **No Slack Summary** -> run full Steps 1-4

### Step 0E: Present scan results

Show a table:

```
Found N unprocessed meeting notes from the last 7 days:

| # | Date       | File                       | Folder           | Type       | Status    | Source     |
|---|------------|----------------------------|------------------|------------|-----------|------------|
| 1 | 2026-02-10 | SPR 260210.md              | AI Council + SPR | ai-council | raw       | local file |
| 2 | 2026-02-11 | 260211 AI council - VLM.md | AI Council + SPR | ai-council | has-summary | local file |
| 3 | 2026-02-12 | Data Council sync          | Ad hoc           | other      | transcript| Work IQ    |
```

Status values: `raw` (needs full processing), `has-summary` (already has Slack Summary, needs action extraction only), `modified` (was processed but content changed since), `transcript` (from Work IQ, no local file).

### Step 0F: Check Work IQ for meetings with transcripts but no local notes

After scanning local files, also query Work IQ: "What meetings did I attend in the last 7 days that have transcripts? List the meeting title, date, and time for each."

For each meeting returned by Work IQ:
- Check if a corresponding local note file already exists (match by date + meeting title/type)
- Check if it's already in `processed-files.json`
- If no local file exists AND not already processed: add it to the processing queue with `Source: Work IQ`

For Work IQ-sourced meetings:
- Query Work IQ for the full transcript summary: "Summarize the full transcript of [meeting name] from [date]. Include all key discussions, decisions, action items with owners, and important details."
- Use this transcript summary as the raw input for the processing pipeline (same as pasted notes in Mode B)
- Auto-detect meeting type from title (same matching logic as Step 0C)
- Unmatched meetings go to `Ad hoc` subfolder

**Skip silently**: Meetings with no transcript or poor quality transcripts.

If no files found: "No unprocessed meeting notes from the last 7 days. Paste notes manually to process them."

Then immediately process all files. Do not ask for confirmation - just run the pipeline on every file in the table.

---

## Inputs (Mode B only)

When the user invokes this skill with pasted notes, expect:

- **Raw notes** - pasted text (rough bullets, transcript, shorthand - any format)
- **Meeting type** - one of the meeting IDs from the registry (see below). Ask if not provided.
- **Date** - extract from the notes if present, otherwise ask. Format: YYYY-MM-DD for storage, DD Month YYYY for display.

### Meeting Registry

Read the registry from `5. Automations/data/actions.json` -> `meetings.registry`. Current meetings:

| ID | Name | Action Type | Notes Folder |
|----|------|-------------|--------------|
| `ai-council` | AI Council | for_others | `AI Council + SPR` |
| `scw` | Supercomputing Weekly | for_others | `Infra - SCW, Maia, Apollo, SLT` |
| `mustafa-sync` | Mustafa Sync | for_maj | `Mustafa syncs` |
| `msi-leads` | MSI Leads | for_others | `MSI leads` |
| `slt-models` | SLT Models | for_others | `SLT Models` |
| `data-council` | Data Council | for_others | *(no folder)* |
| `other` | Other / Ad hoc | mixed | *(no folder - ask user)* |

**Always read the registry fresh** from `actions.json` - it may have been updated since this table was written.

---

## Step 1: Extract Action Items to Tracker

Read `5. Automations/data/actions.json`, append new actions to the `actions` array, and write back.

### Extracting actions from raw notes

Scan the raw notes for action items. Look for:
- `#action`, `#actions`, `#Actions` tags
- "to do", "follow up", "need to", "[Name] to [verb]" patterns
- Clear commitments: "will share", "going to draft", "agreed to prepare"
- ETA/deadline language: "by Friday", "ETA: 1/16", "due next week"

### Action Item Schema

Each action must follow the schema defined in `actions.json` -> `action_schema`:

```json
{
  "id": "<generate a UUID>",
  "title": "Short description of the action",
  "owner": "Person's name",
  "source_meeting": "<meeting ID from registry>",
  "source_date": "YYYY-MM-DD",
  "due_date": null,
  "status": "open",
  "priority": "medium",
  "type": "<for_maj | for_others>",
  "notes": "Additional context if needed",
  "follow_ups": [],
  "created_at": "<ISO timestamp>",
  "updated_at": "<ISO timestamp>",
  "completed_at": null
}
```

### Action Type Logic

- If `source_meeting` is `mustafa-sync` -> `type: "for_maj"` (these are Maj's personal action items from Mustafa)
- If `source_meeting` is `ai-council`, `scw`, `msi-leads`, `slt-models`, `data-council` -> `type: "for_others"` (actions Maj needs to track and chase with other people)
- If `source_meeting` is `other` -> determine from context. Actions assigned to Maj = `for_maj`. Actions assigned to others = `for_others`.

### Priority Rules

- Default: `medium`
- Set `high` if: explicitly flagged as urgent, has a hard deadline within 2 weeks, or is a P0/blocker
- Set `low` if: "when you get a chance", "at some point", or clearly non-urgent

### Important

- **Read the existing JSON first** - never overwrite existing actions.
- **Append only** - add new actions to the end of the `actions` array.
- **Update `last_updated`** at the top level to today's date.
- **Generate real UUIDs** - use `crypto.randomUUID()` format (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`).
- **Deduplicate**: If a very similar action already exists (same owner, similar title, same meeting), don't add a duplicate. Flag it to the user instead.

---

## Step 2: Draft Slack Summary

Generate a Slack-ready summary. This is the primary formatted output of the skill - all meeting types (AI Council, SCW, standard) use the same Slack summary format.

### Slack summary format (threaded - 3 messages)

The Slack summary is designed to be posted as a thread with 3 messages:

**Message 1 - Thread heading:**
```
[Meeting Name] - [DD Mon YYYY] :thread:
```

**Message 2 - Summary notes and decisions (first reply):**
```
*Summary notes and decisions*

- [Key discussion point or outcome - 1 sentence]
- [Key discussion point or outcome - 1 sentence]
- [Decision made]
- [Decision made]
```

**Message 3 - Action items (second reply):**
```
*Action items*

- [Action description] - [Owner]
- [Action description] - [Owner] - due [date if applicable]
```

### Format rules for the Slack summary:
- Thread heading is just the meeting name and date with :thread: emoji
- Reply 1 combines the summary narrative AND decisions into one message using bullet points
- Reply 2 is action items only
- Use `*bold*` for section headers (Slack bold)
- If there are no decisions, just include the summary bullets
- If there are no action items, skip Reply 2 entirely
- Keep each bullet to one line - no multi-line bullets
- Maximum 5-6 bullets in Reply 1 (be ruthless - "so what" only)
- Specific names, dates, numbers - no vague language

### Writing the summary from raw notes

Read the raw notes and extract:
- **What was discussed** - the key topics and substance, not every detail
- **What was decided** - conclusions, agreements, resolved items. Look for `#conclusion`, `#Conclusion`, "agreed that", "decision:", "aligned on"
- **Action items** - cross-reference the actions you just extracted in Step 1 for the authoritative list

For AI Council meetings: focus on the strategic/technical substance - what was debated, what was concluded. These tend to be richer discussions.

For SCW meetings: focus on site-by-site delivery status - what's on track, what's at risk, what changed.

For Mustafa syncs: keep it concise - these are 1:1s. Skip decisions section unless there are real decisions.

---

## Step 3: Save the Meeting Notes File

Save the file with the Slack summary and raw notes preserved.

### File Structure (all meeting types)

```markdown
## Slack Summary

### Thread heading
[Meeting Name] - [DD Mon YYYY] :thread:

### Summary notes and decisions
- [Key discussion point or outcome]
- [Decision made]

### Action items
- [Action description] - [Owner]
- [Action description] - [Owner] - due [date]

---

# Raw Notes

[Original pasted text preserved exactly as-is - do not modify anything below this header]
```

### File Path

```
1. MeetingNotes/MeetingNotes/[notes_folder from registry]/[YYMMDD] [Max 3 words].md
```

### File Naming

- Date prefix: `YYMMDD` (e.g., `260215`)
- Title: Maximum 3 words describing the meeting topic (e.g., `Mustafa Sync`, `VLM Discussion`, `RL Environments`)
- Space between date and title, space before `.md`
- Examples from the codebase:
  - `260211 AI council - VLM.md`
  - `260107 Mustafa Sync.md`
  - `260128 AIC - MAI playground and MAIDAS.md`

### Edge Cases

- If `notes_folder` is `null` (e.g., Data Council, Other), ask the user where to save.
- If the file already exists, overwrite it - no need to ask.
- In Mode A, the file already exists in its folder - update it in place rather than creating a new file.

### Preserving raw notes when updating existing files

When updating a file that already has content (Mode A):
1. Read the existing file
2. Find the `# Raw Notes` section (or the entire file content if no Raw Notes header exists)
3. Treat everything from `# Raw Notes` onwards (or the full original content) as the raw notes to preserve
4. Write the new file with: `## Slack Summary` + `---` + `# Raw Notes` + original content

### Show Slack summary in chat

After writing the file, also present the Slack summary in three separate code blocks in the chat (one per message) so Maj can copy-paste directly:

```
Thread heading:
[Meeting Name] - [DD Mon YYYY] :thread:
```

```
Reply 1:
*Summary notes and decisions*
- ...
```

```
Reply 2:
*Action items*
- ...
```

### Update processed-files.json

After saving, update `5. Automations/data/processed-files.json`:

1. Read the current file
2. Find the entry matching this file's path, or create a new one
3. Set/update fields:
   - `file_name`: the filename
   - `file_path`: relative path from `1. MeetingNotes/` root (using `\` separators to match existing entries)
   - `subfolder`: the immediate subfolder name
   - `meeting_type`: the detected or specified meeting type
   - `file_hash`: SHA-256 of the file contents after saving
   - `steps_completed`: `["process-meeting"]`
   - `processed_at`: current ISO timestamp
   - `log_file`: null
4. Update `last_run` and `last_run_status` at the top level
5. Write back the full JSON

---

## Step 4: Update TOP OF MIND.md

Check if a `0. TOP OF MIND.md` exists in the target meeting notes folder.

### If it exists:

- Read the current TOP OF MIND.md
- Update it based on what was discussed and decided in this meeting
- Follow the rules from `1. MeetingNotes/CLAUDE.md`:
  - Write fulsome briefings with narrative arc, not sparse bullets
  - Pull from Slack context for latest discussions
  - Use bold labels for sub-topics
  - Include people and their positions
  - Flag what's unresolved
  - No arbitrary bullet count limits - let substance dictate length
  - Update the "Last updated" date
  - Write for a busy exec needing quick reminders before meetings
- **Remove stale items** that were resolved in this meeting
- **Add new items** that surfaced

### If it doesn't exist:

- Skip this step. Do not create a new TOP OF MIND.md unprompted.

---

## Execution Order

### Mode A: Auto-Scan

1. **Run Steps 0A-0E** - scan, filter, detect types, show results table
2. **Process all files immediately** - no confirmation needed. For each file, in chronological order (oldest first):
   a. Read the file content
   b. If no Slack Summary -> run Steps 1-4 (extract actions, Slack summary, save, TOP OF MIND)
   c. If already has Slack Summary -> run Steps 1, 4 only (extract actions, TOP OF MIND)
   d. Update `processed-files.json` with new hash and steps
   e. **Run decision-log skill** - auto-extract decisions from the processed notes into `data/decision-log.md` (see `5. Automations/skills/decision-log/SKILL.md`)
3. **After all files**, show a batch summary with all Slack summaries:
   ```
   Processed N files
   - X action items extracted
   - N Slack summaries generated
   - M TOP OF MIND files updated
   - Y decisions logged
   ```

### Mode B: Manual Paste

Run Steps 1-4 in sequence. **Do not pause for confirmation at any step.** Execute everything, save all files, then present the Slack summary at the end.

After completing Mode B, also update `processed-files.json` so the file won't appear as unprocessed in future scans.

After both modes, **run the decision-log skill** to extract and log any decisions from the processed notes. This runs automatically - no user confirmation needed.

---

## File References

| Resource | Path (relative to `4. AGENT/`) |
|----------|-------------------------------|
| Action tracker | `5. Automations/data/actions.json` |
| Processed file tracker | `5. Automations/data/processed-files.json` |
| Meeting notes | `1. MeetingNotes/MeetingNotes/[subfolder]` |
| Notes template & rules | `1. MeetingNotes/CLAUDE.md` |
| Slack writing style | `2. Writing/CLAUDE.md` |
| Meeting registry | `5. Automations/data/actions.json` -> `meetings.registry` |
| Decision log | `5. Automations/data/decision-log.md` |
| Decision log skill | `5. Automations/skills/decision-log/SKILL.md` |

---

## Examples

### Example 1: Standard Meeting (e.g., Mustafa Sync)

#### Input

```
User: Process these notes from today's Mustafa sync

- need to hire a new PM for consumer
- #action Maj to draft JD by Friday
- discussed frontier model strategy
- #conclusion stick with current approach for now, revisit in March
```

#### Output (saved file)

```markdown
## Slack Summary

### Thread heading
Mustafa Sync - 15 Feb 2026 :thread:

### Summary notes and decisions
- Discussed PM hiring for consumer team and frontier model strategy
- Agreed to stick with current frontier model approach - revisit in March

### Action items
- Draft PM job description by Friday - Maj

---

# Raw Notes

- need to hire a new PM for consumer
- #action Maj to draft JD by Friday
- discussed frontier model strategy
- #conclusion stick with current approach for now, revisit in March
```

### Example 2: AI Council

#### Input

```
User: Process these notes from today's AI Council

VLM integration discussion
- agreed to combine mid-training, not staged
- MFU impact: zero if encoder frozen
- timeline impact: 36h combined vs 48h staged
- #conclusion go with combined approach
- #actions Jordan to deliver VLM checkpoint by end of Feb
- data self-sufficiency vs speed debate
- Nando says don't blindly SFT Gemini
- #conclusion revisit in a month, don't take shortcuts now
- #actions Paul looking into acquisitions for RL environments
```

#### Output (saved file)

```markdown
## Slack Summary

### Thread heading
AI Council - 15 Feb 2026 :thread:

### Summary notes and decisions
- Discussed VLM mainline integration - combined vs staged mid-training approach
- Zero MFU impact with frozen encoder, 36h combined vs 48h staged timeline
- Agreed to combined mid-training for VLM (not staged)
- Data self-sufficiency debate - consensus to hold the line, no shortcuts, revisit in one month

### Action items
- Deliver VLM checkpoint by end of Feb - Jordan
- Investigate acquisitions/partnerships for RL environments - Paul

---

# Raw Notes

VLM integration discussion
- agreed to combine mid-training, not staged
- MFU impact: zero if encoder frozen
- timeline impact: 36h combined vs 48h staged
- #conclusion go with combined approach
- #actions Jordan to deliver VLM checkpoint by end of Feb
- data self-sufficiency vs speed debate
- Nando says don't blindly SFT Gemini
- #conclusion revisit in a month, don't take shortcuts now
- #actions Paul looking into acquisitions for RL environments
```

### Example 3: SCW

#### Input

```
User: Process these SCW notes

PHX update
- Azure handed off 32K GB200 on Jan 6
- maintenance completed successfully - IB merge, power cutover, CX7 firmware
- MAI HPC continuing with node certification

Nebius
- 8.5K GB200 handoff to MAI by 2/1 at risk
- Asus firmware issues affecting ~50% of GPUs
- parallelised validation plan agreed - use functioning 4K early
- #action Mark H to share detailed handoff definitions by 1/16
- #action Bhumi and Prashant to share Manifold exit criteria by 1/16
```

#### Output (saved file)

```markdown
## Slack Summary

### Thread heading
SCW - 15 Feb 2026 :thread:

### Summary notes and decisions
- PHX: 32K GB200 handed off, maintenance complete, node cert ramping
- Nebius: 8.5K handoff at risk - Asus firmware issues on ~50% of GPUs
- Agreed to parallelised validation plan using functioning 4K early

### Action items
- Share detailed handoff definitions by 1/16 - Mark H
- Share Manifold exit criteria by 1/16 - Bhumi, Prashant

---

# Raw Notes

PHX update
- Azure handed off 32K GB200 on Jan 6
- maintenance completed successfully - IB merge, power cutover, CX7 firmware
- MAI HPC continuing with node certification

Nebius
- 8.5K GB200 handoff to MAI by 2/1 at risk
- Asus firmware issues affecting ~50% of GPUs
- parallelised validation plan agreed - use functioning 4K early
- #action Mark H to share detailed handoff definitions by 1/16
- #action Bhumi and Prashant to share Manifold exit criteria by 1/16
```
