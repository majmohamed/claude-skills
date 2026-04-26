# Skill: Weekly Update to Satya

## What This Is

Ghost-write Mustafa Suleyman's weekly update to Satya Nadella. This is the highest-stakes writing Maj does as Chief of Staff to Mustafa. The output must read as Mustafa writing directly to his boss - not as a staff summary.

---

## How to Run

When invoked, follow these three phases in order:

1. **Gather** - Read all source material for the current week
2. **Draft** - Write the update in Mustafa's voice (style rules in `2. Writing/Satya weekly updates/Claude.md`)
3. **Review & Save** - Present to Maj, iterate, then save

---

## Phase 1: Gather Source Material

All paths below are relative to the project root:
`C:\Users\majidmohamed\Microsoft\MAI - Strategy - 11. MSI strategy\1. Ad hoc\0. Maj Working Folder\`

### Determine the Current Week

- "This week" = the Monday-to-Friday window containing today's date.
- Calculate the Monday and Friday dates for the current week.
- File names in meeting notes use `YYMMDD` prefixes - search for files with dates falling within Mon-Fri of the current week.

### Sources to Read

Read these in parallel where possible:

| Source | Path | What to Extract |
|--------|------|-----------------|
| **Style guide** | `2. Writing/Satya weekly updates/Claude.md` | **Read this first.** Voice, tone, bullet format, key phrases, what to avoid, what Mustafa adds. This is the style authority. |
| **AI Council notes** | `1. MeetingNotes/MeetingNotes/AI Council + SPR/` | Key decisions, strategic discussions, direction changes, escalations |
| **Supercomputing Weekly (SCW)** | `1. MeetingNotes/MeetingNotes/Infra - SCW, Maia, Apollo, SLT/` | Infrastructure progress, capacity updates, build status, blockers |
| **Data Council** | Search `1. MeetingNotes/` for any Data Council notes from this week | Data strategy updates, pipeline progress, key metrics |
| **Action tracker** | `5. Automations/data/actions.json` | Recently completed items (wins to highlight) and significant open items |
| **Previous Satya updates** | `2. Writing/Satya weekly updates/` | Read the 2-3 most recent updates to calibrate voice, format, and level of detail |
| **Format examples** | `2. Writing/Satya weekly updates/Examples/` | Reference templates and formatting conventions |

### Sources via Work IQ

In addition to local files, query Work IQ for supplementary context:

| Source | Work IQ Query | What to Extract |
|--------|--------------|-----------------|
| **Email threads (AI Council topics)** | "What recent emails mention AI Council, model training, or frontier models?" | Strategic context, decisions communicated via email |
| **Email threads (SCW/infra topics)** | "What recent emails mention supercomputing, datacenter, capacity, GPU, or infrastructure?" | Infra context, escalations via email |
| **Email threads (data topics)** | "What recent emails mention data strategy, data council, or data pipeline?" | Data strategy context |
| **Teams channels** | "What were the key discussions in the MSFT AI Model Council and AI Data Council Teams channels this week?" | Decisions and themes from Teams |
| **Meeting transcripts** | "Summarize the key discussions and decisions from my meeting transcripts this week, especially AI Council, SCW, and Data Council meetings" | Catches meetings where local notes are thin or missing |
| **Mustafa's email activity** | "What emails has Mustafa Suleyman sent or been included on this week that I was also on?" | Things Mustafa is tracking via email (important for voice calibration) |

These Work IQ queries supplement (not replace) the local file sources. If Work IQ is unavailable, proceed with local sources only and note the gap.

### If Sources Are Missing

- If a meeting didn't happen this week (holiday, skip week), note it and omit that section.
- If notes files exist but are empty or thin, flag it: `[TODO - Maj to add: AI Council was light this week - anything to highlight?]`
- Never fabricate content. If you don't have source material, say so.

---

## Phase 2: Draft the Weekly Update

**Before drafting, read `2. Writing/Satya weekly updates/Claude.md` for all voice, style, and formatting rules.** That file is the single source of truth for how Satya weekly updates should read. Do not duplicate those rules here.

### Document Structure

Draft the update with the following sections, in this exact order:

#### 1. Path to Build

> This is the top section - the big picture on where MSI stands in the march to Build. Covers team progress, model training milestones, key wins, and strategic moves Mustafa wants Satya to know about.

- Draft a `[TODO - Maj to add: Path to Build highlights for the week]` placeholder.
- Below the placeholder, suggest candidate items pulled from:
  - Completed actions in `actions.json` that feel significant enough for Satya
  - Model training milestones, run progress, and key technical wins
  - Any cross-cutting themes from the meeting notes
  - Team and org moves (hiring, restructuring, culture)
- Format suggestions as a bulleted list Maj can pick from, edit, or replace entirely.
- Label these clearly: *"Suggested items from this week's tracker and notes - pick/edit/replace:"*

#### 2. AI Council update

- Key decisions made and their implications
- Strategic discussions and where they landed
- Any items escalated or flagged for Satya's awareness
- Keep to 3-4 bullet points max - each should convey a decision or direction, not a process recap

#### 3. Supercomputing weekly

- Progress on supercomputing builds, Maia, Apollo
- Capacity numbers if notable (new capacity online, utilization milestones)
- Blockers or risks with mitigation plans
- Translate technical details into business impact - Satya doesn't need architecture diagrams, he needs to know what's on track, what's not, and what it means

#### 4. Data updates

- Key items from Data Council or data strategy discussions
- Progress on data pipelines, quality, or collection efforts
- Only include if there's material worth reporting - omit the section rather than padding it

---

## Phase 3: Review & Save

### Present the Draft

- Show the full draft to Maj in the conversation
- Clearly mark all `[TODO]` items that need Maj's input
- List any sections you omitted and why (e.g., "No Data Council notes found this week")
- Ask Maj for feedback before saving

### Iterate

- Accept edits, additions, and tone adjustments
- If Maj provides team progress items, integrate them into the top section and re-present

### Save the Final Version

After Maj approves:

1. Determine the filename using the Monday date of the current week: `YYMMDD - Satya Weekly Update.md`
   - Example: If the week is Feb 10-14, 2026 -> `260210 - Satya Weekly Update.md`
2. Save the markdown file to: `2. Writing/Satya weekly updates/`
3. If converting to Word (.docx), save the .docx in the same folder alongside the .md file
4. Confirm the save path(s) to Maj

---

## Quick Reference: File Paths

```
Project Root: C:\Users\majidmohamed\Microsoft\MAI - Strategy - 11. MSI strategy\1. Ad hoc\0. Maj Working Folder\

Style Authority:
  Satya update voice/style .. 2. Writing/Satya weekly updates/Claude.md

Sources:
  AI Council notes ........ 1. MeetingNotes/MeetingNotes/AI Council + SPR/
  SCW / Infra notes ....... 1. MeetingNotes/MeetingNotes/Infra - SCW, Maia, Apollo, SLT/
  Data Council ............ 1. MeetingNotes/ (search for Data Council files)
  Action tracker .......... 5. Automations/data/actions.json
  Previous updates ........ 2. Writing/Satya weekly updates/
  Format examples ......... 2. Writing/Satya weekly updates/Examples/

Output:
  Markdown draft .......... 2. Writing/Satya weekly updates/YYMMDD - Satya Weekly Update.md
  Word doc (if converted) . 2. Writing/Satya weekly updates/YYMMDD - Satya Weekly Update.docx
```

---

## Checklist Before Presenting Draft

- [ ] Read `2. Writing/Satya weekly updates/Claude.md` for voice and style rules
- [ ] Read this week's AI Council notes
- [ ] Read this week's SCW / Infra notes
- [ ] Checked for Data Council notes
- [ ] Read `actions.json` for completed and open items
- [ ] Read 2-3 most recent Satya updates for voice calibration
- [ ] Checked `Examples/` folder for format reference
- [ ] All sections present (or intentionally omitted with explanation)
- [ ] `[TODO]` placeholders for anything needing Maj's input
- [ ] Voice check: reads as Mustafa, not as a staff summary
- [ ] Length check: scannable in under 3 minutes
