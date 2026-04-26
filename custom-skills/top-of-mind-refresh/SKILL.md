# TOP OF MIND Auto-Refresh

**Purpose**: Automatically update the TOP OF MIND briefing doc for a meeting type after `process-meeting` finishes processing notes. Keeps exec-level briefing bullets fresh without any manual intervention.

**When to use**: This skill has NO slash command and is NOT invoked directly. It auto-triggers as the final step of `process-meeting` (Step 5). If `process-meeting` detects a `0. TOP OF MIND.md` file in the target folder, this skill's logic executes automatically.

**IMPORTANT - No Confirmations**: This skill runs silently. No review, no approval, no confirmation prompts. Read the new notes, update the relevant section, write the file, move on.

---

## Workflow

### Step 1: Detect Meeting Type

Read the meeting type from the notes just processed by `process-meeting`. This comes from either:

- The `meeting_type` variable already set during processing (Mode A auto-scan or Mode B manual paste)
- The meeting registry in `5. Automations/data/actions.json` -> `meetings.registry`

Map the meeting type to its folder using the registry:

| Meeting ID | Notes Folder |
|------------|-------------|
| `ai-council` | `AI Council + SPR` |
| `scw` | `Infra - SCW, Maia, Apollo, SLT` |
| `mustafa-sync` | `Mustafa syncs` |
| `msi-leads` | `MSI leads` |
| `slt-models` | `SLT Models` |
| `data-council` | `Data Council` |

**Always read the registry fresh** from `actions.json` - it may have been updated since this table was written.

---

### Step 2: Locate the TOP OF MIND File

Look for `0. TOP OF MIND.md` in:

```
1. MeetingNotes/MeetingNotes/[notes_folder]/0. TOP OF MIND.md
```

- **If the file exists**: proceed to Step 3.
- **If it does not exist**: **create it**. Use the folder-specific section structure from `1. MeetingNotes/CLAUDE.md` if one is defined for that folder (e.g. Infra has Nebius/Manifold/Maia/etc., SLT Models has GitHub/M365/etc.). For folders without a defined structure, use 5-10 fulsome bullets covering key topics from this meeting. Add a `Last updated: [DD Month YYYY]` line at the top. Then proceed to Step 4 (the file is now empty sections ready to be populated).

---

### Step 3: Read Current TOP OF MIND Content

Read the full `0. TOP OF MIND.md` file. Parse the existing sections to understand:

- Which sections exist (each meeting type folder has its own section structure - see below)
- Current bullet content for each section
- The "Last updated" date

---

### Step 4: Read the Newly Processed Meeting Notes

Read the meeting notes file that `process-meeting` just created or updated. Extract:

- Key decisions made
- Open action items and owners
- Risks or blockers surfaced
- Status updates on ongoing workstreams
- Anything that changes the "state of play" for this meeting type

Focus on what a busy exec needs to remember before walking into the next meeting of this type.

---

### Step 5: Update the Relevant Section

Replace the bullets in the section(s) relevant to this meeting type. Apply these rules strictly:

#### Format Rules

```
**[Section Name] (DD Month YYYY)**
- [Bullet 1 - max 20 words]
- [Bullet 2 - max 20 words]
- [Bullet 3 - max 20 words]
```

- **Maximum 3 bullets per section** - no exceptions
- **Maximum 20 words per bullet** - count them, trim if over
- **Date in the section header** updates to today's date (the date the notes were processed)
- **Hyphens only** - no emdashes, no endashes

#### Content Rules

- **Remove stale items** that were resolved or decided in this meeting
- **Add new items** that surfaced - risks, decisions pending, actions to track
- **Prioritize**: actionable items > risks > decisions needed > key updates
- **Write for a busy exec** needing quick reminders before their next meeting
- **Be specific** - names, dates, numbers. Not "discuss infrastructure" but "PHX 32K handoff complete, Nebius 8.5K at risk"

#### Section Structure by Folder

Each folder's TOP OF MIND has its own section layout (defined in `1. MeetingNotes/CLAUDE.md`):

**Infra - SCW, Maia, Apollo, SLT:**
- Nebius, Manifold, Maia, Nexus, Apollo, 2GW Path (one section per topic)

**SLT Models:**
- GitHub, M365, OAI/Yosemite, MAI Models, Compute

**Mustafa syncs:**
- Consumer, AI, SLT, Team

**Other folders (AI Council + SPR, MSI leads, Data Council):**
- 5-10 bullets total (no named sub-sections)

---

### Step 6: Preserve Other Sections

Only modify the section(s) directly relevant to the meeting just processed. All other sections in the TOP OF MIND file remain exactly as they were - same bullets, same dates, same formatting. Do not touch them.

---

### Step 7: Update the Last Updated Date

Update the "Last updated" line at the top of the file to today's date. Format: `DD Month YYYY`.

---

### Step 8: Write the File

Save the updated `0. TOP OF MIND.md` back to the same path. Overwrite in place - no backup needed, no new file.

---

## Reads

| Resource | Path (relative to `4. AGENT/`) |
|----------|-------------------------------|
| Newly processed meeting notes | `1. MeetingNotes/MeetingNotes/[subfolder]/[filename].md` |
| Existing TOP OF MIND file | `1. MeetingNotes/MeetingNotes/[subfolder]/0. TOP OF MIND.md` |
| Meeting registry | `5. Automations/data/actions.json` -> `meetings.registry` |
| TOP OF MIND format rules | `1. MeetingNotes/CLAUDE.md` |

---

## Writes

| Resource | Path (relative to `4. AGENT/`) |
|----------|-------------------------------|
| Updated TOP OF MIND file | `1. MeetingNotes/MeetingNotes/[subfolder]/0. TOP OF MIND.md` |

---

## Key Rules

1. **Write fulsome briefings, not sparse bullets** - each section should read like a mini-briefing. No arbitrary bullet count limits - let substance dictate length
2. **Be specific** - names, dates, numbers, who is pushing for what, what's unresolved
3. **Auto-update without review** - no confirmation prompts, no pausing
4. **Single meeting type only** - only update the TOP OF MIND doc for the meeting just processed. Do not scan or flag other folders' TOP OF MIND docs
5. **Preserve all other sections unchanged** - only touch sections relevant to this meeting
6. **Update the date** in both the section header and the "Last updated" line
7. **No emdashes** - only hyphens throughout
8. **Create TOP OF MIND files if they don't exist** - if `0. TOP OF MIND.md` doesn't exist in the folder, create it using the folder-specific section structure from `1. MeetingNotes/CLAUDE.md`
9. **Always read the registry fresh** - folder mappings may change

---

## Edge Cases

- **No TOP OF MIND file in the folder**: Create one using the folder-specific section structure from `1. MeetingNotes/CLAUDE.md`. Populate sections with content from the meeting just processed.
- **Meeting type is `other`**: Check if the folder has a `0. TOP OF MIND.md`. If yes, update it. If no folder was specified (ad hoc notes), skip.
- **Meeting type is `data-council`**: Data Council has no `notes_folder` in the registry. Skip unless a folder has been added.
- **TOP OF MIND file has sections not listed above**: Preserve them exactly as-is. Only modify sections you can confidently map to the meeting type.
- **Nothing actionable in the new notes**: Still update the date. Replace bullets with the most relevant current-state items rather than leaving stale content.
- **Multiple meetings processed in one Auto-Scan batch**: This skill runs once per meeting file processed. Each run only touches the TOP OF MIND for that specific meeting's folder.
- **Bullet exceeds 20 words**: Rewrite it shorter. Do not just truncate mid-sentence.
