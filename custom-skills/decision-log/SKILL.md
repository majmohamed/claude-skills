# Decision Log Skill

**Purpose**: Auto-extract decisions from meeting notes and maintain a running decision log in table format. Decisions are outcomes that were agreed or resolved - distinct from action items, which are tasks to do.

**When to use**: This skill has NO slash command. It auto-triggers as a post-processing step after `process-meeting` completes. Every time `/notes` processes meeting notes, this skill runs immediately after to extract and log any decisions.

**IMPORTANT - No Confirmations**: This skill runs automatically without asking for permission. Trust Claude's judgment on what constitutes a decision vs an action. Extract decisions, append to the log, and move on.

---

## Decision vs Action Distinction

This is the core logic of the skill. Get this right.

| Type | What it is | Example |
|------|-----------|---------|
| **Decision** | An outcome that was agreed, approved, or resolved | "We agreed to open-source the ASR model" / "MSI leads approved Sprint 4 compute allocations" |
| **Action** | A task someone needs to do | "Nando to prepare the ASR open-source proposal by March 15" |

- Decisions are **outcomes** - they answer "what was decided?"
- Actions are **tasks** - they answer "who needs to do what?"
- A single discussion often produces both: the decision ("go with combined mid-training") and the action that flows from it ("Jordan to deliver VLM checkpoint by end of Feb")
- If in doubt, ask: "Is this something that was resolved, or something that still needs doing?" Resolved = decision. Needs doing = action.

---

## Step 1: Extract Decisions from Processed Notes

After `process-meeting` finishes formatting notes and extracting actions, scan the processed meeting notes for decisions.

### Where to look

- The `## Conclusions` section (standard template)
- `#conclusion` / `#Conclusion` tags in raw notes
- AI Council topic sections - look for "agreed", "consensus", "decision", "approved"
- SCW exec summary - look for alignment decisions, approved plans
- Any language indicating something was resolved: "agreed to", "decided", "approved", "signed off on", "aligned on", "confirmed that", "deferred", "rejected", "killed", "paused"

### What to extract for each decision

| Field | Source | Rules |
|-------|--------|-------|
| Date | Meeting date from the notes (YYYY-MM-DD) | Use the meeting date, not today's date |
| Forum | Meeting type from registry | Use short labels: `ai-council`, `msi-leads`, `mustafa-sync`, `scw`, `slt-models`, `data-council`, `other` |
| Decision | The decision itself | 1-2 sentences max. Clear and specific. Include key details (numbers, names, scope). |
| Decided by | Key decision makers | Names of people who made or approved the decision. Use first names. If unclear, use the forum name (e.g., "MSI Leads consensus") |
| Rationale | Why this was decided | 1 sentence. What drove the decision - the reason, not the decision restated. |
| Status | Current state | Default: `Active`. Only use `Superseded` or `Reversed` when updating old entries (see Step 3). |

### What NOT to log

- Discussion points that didn't reach a conclusion
- Tentative or conditional statements ("we might", "if X then maybe")
- Action items (these go to `actions.json` via process-meeting)
- Information updates or status reports without a decision component

---

## Step 2: Read Existing Decision Log

Read the existing decision log:

```
5. Automations/data/decision-log.md
```

If the file doesn't exist, create it with the initial structure:

```markdown
# Decision Log

Last updated: [today's date YYYY-MM-DD]

---
```

---

## Step 3: Append New Decisions

### Placement rules

1. Find the current month's section (e.g., `## March 2026`)
2. If the month section exists, add new rows to the **TOP** of that month's table (newest decisions first within the month)
3. If the month section doesn't exist, create it **above** all existing month sections (most recent month first)
4. Every month section gets its own table with the full column headers

### Table format

```markdown
## [Month YYYY]

| Date | Forum | Decision | Decided by | Rationale | Status |
|------|-------|----------|------------|-----------|--------|
| [rows] |
```

### Superseding previous decisions

When a new decision supersedes a previous one:

1. Add the new decision as normal
2. Find the old decision's row in the log
3. Change its Status from `Active` to `Superseded (see [YYYY-MM-DD])`  - referencing the date of the new decision
4. This is the ONLY case where existing entries get modified

### Update the header

Update `Last updated: [today's date YYYY-MM-DD]` at the top of the file.

---

## Step 4: Write the Updated Log

Write the full file back to:

```
5. Automations/data/decision-log.md
```

---

## Execution Order

This skill runs as part of the `process-meeting` pipeline, after all other steps:

1. `process-meeting` completes Steps 1-5 (format, actions, save, Slack summary, TOP OF MIND)
2. **This skill triggers automatically**:
   a. Scan the processed meeting notes for decisions (Step 1)
   b. Read existing `decision-log.md` (Step 2)
   c. Append new decisions to the top of the current month's table (Step 3)
   d. Write the updated log (Step 4)
3. If no decisions were found, skip silently - don't create empty entries or notify the user

---

## File Path Reference

All paths relative to project root (`4. AGENT/`):

| File | Path | Description |
|------|------|-------------|
| Decision log | `5. Automations/data/decision-log.md` | Running log of all decisions (this skill's output) |
| Processed meeting notes | `1. MeetingNotes/MeetingNotes/[subfolder]/` | Source of decisions (this skill's input) |
| Action tracker | `5. Automations/data/actions.json` | Cross-reference to avoid logging actions as decisions |
| Meeting registry | `5. Automations/data/actions.json` -> `meetings.registry` | Maps meeting IDs to display names |

---

## Reads

- Newly processed meeting notes (output of process-meeting - the formatted file, not raw notes)
- Existing `5. Automations/data/decision-log.md` (to append, not overwrite)
- `5. Automations/data/actions.json` -> `meetings.registry` (for forum labels)

## Writes

- `5. Automations/data/decision-log.md`

---

## Key Rules

1. **Auto-extract without review** - trust Claude's judgment on the decision vs action distinction. Don't ask Maj to confirm decisions.
2. **Append new decisions to the TOP of the current month's table** (newest first within each month).
3. **Never delete or modify existing entries** - the only exception is marking an old decision as `Superseded` when a new decision overrides it.
4. **Keep rationale to 1 sentence** - the reason behind the decision, not a restatement of it.
5. **Group by month with most recent month first** - March 2026 appears above February 2026.
6. **Each month section gets its own table** with the same column headers repeated.
7. **No emdashes** - only hyphens.
8. **Skip silently when there are no decisions** - not every meeting produces decisions. Don't clutter the log or the chat.
9. **Use short forum labels** - `ai-council`, `msi-leads`, `mustafa-sync`, `scw`, `slt-models`, `data-council`, `other`. Match the meeting registry IDs.
10. **Decided by uses first names** - "Mustafa, Karen, Maj" not "Mustafa Suleyman, Karen Mills, Maj Mohamed". If the decision was a group consensus, say "[Forum] consensus" (e.g., "MSI Leads consensus").

---

## Edge Cases

- **No decisions in a meeting**: Skip silently. Many meetings (especially status updates and syncs) don't produce formal decisions.
- **Ambiguous decision vs action**: If something looks like both, log the decision aspect here AND let process-meeting handle the action aspect. Example: "Approved Sprint 4 compute allocations" is a decision; "Maj to send allocation confirmation to teams by Friday" is the action that flows from it. Both get logged in their respective places.
- **Decision log doesn't exist yet**: Create the file with the initial header structure and the first month's table.
- **Decision supersedes an old one**: Mark the old entry as `Superseded (see [date])` and add the new decision. This is the only case where old entries change.
- **Multiple decisions from one meeting**: Log each as a separate row. Don't combine unrelated decisions.
- **Decision from a meeting type not in the registry**: Use `other` as the forum label.
- **Rationale not clear from notes**: Use best judgment to infer the "why". If genuinely unknowable, write "Context not captured in notes".

---

## Example

### Input (from a processed MSI Leads meeting on 2026-03-07)

Conclusions section contains:
```
- Sprint 4 compute allocations approved - Condor: 4.5K reasoning, 3K pre-training, 2.5K multimodal
- ASR open-source timeline deferred to align with SLT review
```

### Output (appended to decision-log.md)

```markdown
# Decision Log

Last updated: 2026-03-07

---

## March 2026

| Date | Forum | Decision | Decided by | Rationale | Status |
|------|-------|----------|------------|-----------|--------|
| 2026-03-07 | msi-leads | Sprint 4 compute allocations approved - Condor: 4.5K reasoning, 3K pre-training, 2.5K multimodal | Mustafa, Karen, Maj | Reasoning team has strongest near-term benchmark targets | Active |
| 2026-03-07 | msi-leads | ASR open-source timeline deferred pending SLT review | MSI Leads consensus | Need SLT alignment before committing to OSS timeline | Active |
| 2026-03-04 | ai-council | Combined mid-training approach approved for VLM integration over staged pipeline | AI Council consensus | Zero MFU impact with frozen encoder and 12h timeline savings vs staged | Active |
```
