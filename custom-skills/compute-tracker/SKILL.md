# Skill: Compute Allocation Tracker

Reads #ai-cluster-util for compute allocation data, maintains a structured JSON ledger of GPU assignments by team/cluster/sprint, flags major changes for the weekly update, and sends a Slack DM summary to Maj.

**Slash command**: `/compute`

---

### Date & Timestamp Accuracy

CRITICAL: All date-based filtering depends on the current date provided in the system context (e.g., "Today's date is YYYY-MM-DD").

**Unix timestamp calculation:**
- Reference point: 2026-01-01 00:00:00 UTC = 1767225600
- Add 86400 per day from there
- For a 7-day lookback: subtract 604800 from today's timestamp

**Validation (MANDATORY):**
- After retrieving Slack messages, check the dates of the returned messages
- If ALL returned messages are older than your target window, your timestamp was calculated incorrectly - recalculate and retry
- Confirm the most recent message is from the current month/year. If you see content from a prior year (e.g., 2025 when it should be 2026), STOP and recalculate
- For `slack_search_messages`, always include `after:YYYY-MM-DD` using the calculated start date

---

## Workflow

### Step 1 - Read #ai-cluster-util messages from the last 7 days

- Use Slack MCP `slack_conversations_history` to read recent messages from #ai-cluster-util
- **Channel ID**: `C08DN2YG5LH`
- **Time window**: Last 7 days (calculate Unix timestamp for 7 days ago and use as `oldest` parameter). Reference: 2026-01-01 00:00:00 UTC = 1767225600. Add 86400 per day from there, then subtract 604800 for 7 days
- Pull up to 100 messages
- For any messages with threads, use `slack_get_thread` to pull the full thread content - allocation details are often in replies
- **Only read from #ai-cluster-util** - no other channels

### Step 2 - Extract allocation data

From the messages pulled in Step 1, extract structured allocation data:

- **Cluster name** (e.g., Condor, Phoenix, Eagle, etc.)
- **GPU count** - total and per-team allocations
- **Team** - which team/workload the GPUs are assigned to (e.g., reasoning, pre-training, post-training, evals, etc.)
- **Sprint** - current sprint identifier if mentioned
- **Changes** - any noted moves, swaps, or reallocations
- **Context** - any reasoning or notes about why changes were made

Look for patterns like:
- Tables or lists showing cluster breakdowns
- Allocation updates referencing GPU counts
- Sprint planning messages with compute assignments
- Reallocation announcements

### Step 3 - Load previous state

- Read `../../data/compute-ledger.json`
- If the file doesn't exist, create it with the initial schema (see JSON Ledger Structure below)
- Parse the previous `clusters` array and `current_sprint` to use as the baseline for comparison

### Step 4 - Compare and identify changes

Compare extracted data (Step 2) against previous state (Step 3):

- **New clusters** - any cluster not previously tracked
- **GPU count changes** - allocations that have increased or decreased
- **Team reassignments** - GPUs moved from one team to another
- **Sprint changes** - new sprint identifier detected
- **New teams** - teams appearing for the first time on a cluster

### Step 5 - Flag weekly-update-worthy changes

Mark changes as `weekly_update_worthy: true` if they meet any of these criteria:

- **Large reallocations** - 500+ GPUs moved between teams or clusters
- **New cluster assignments** - a team getting compute on a cluster they weren't on before
- **Sprint-over-sprint shifts** - notable changes from one sprint to the next
- **Turbo compute changes** - anything related to surge/turbo capacity shifts
- **Significant percentage shifts** - a team's allocation changing by 20%+ even if absolute numbers are smaller

For each flagged change, write a `suggested_bullet` in Maj's voice:
- Specific numbers, no fluff
- Direct and punchy
- No emdashes - only hyphens
- Example: "Condor: 4.5K to reasoning, up from 3K last sprint"

### Step 6 - Update the JSON ledger

- Update `last_updated` to current ISO timestamp
- Update `current_sprint` if a new sprint was detected
- Update `clusters` array with current state
- Populate `changes_this_week` with all changes identified in Step 4
- **Move previous `changes_this_week` to `history`** before overwriting - append, never delete
- Always read the full file before writing - never overwrite blindly

### Step 7 - Send Slack DM summary

Send a threaded message to Maj's self-DM channel.

**Channel ID**: `D07AKFZPGCB` - ONLY send to this channel, never anywhere else.

1. **Send header message**:
   - Text: `Compute changes this week :thread:`
   - Capture `thread_ts` from the response

2. **Send Reply 1 - Changes summary**:
   - Use `thread_ts` from the header
   - Format:
     ```
     *Changes (last 7 days)*
     • [Cluster]: [change description]
     • [Cluster]: [change description]
     • ...
     ```
   - If no changes detected: `No material compute changes this week.`

3. **Send Reply 2 - Weekly update suggestions** (only if there are weekly-update-worthy changes):
   - Use `thread_ts` from the header
   - Format:
     ```
     *Weekly update suggestions*
     • [Suggested bullet for weekly update]
     • [Suggested bullet for weekly update]
     • ...
     ```

### Step 8 - Display summary in terminal

After posting to Slack:
- Display the full changes summary in the terminal
- Confirm the ledger file has been saved
- Show the path to the updated ledger file
- Note how many changes were flagged as weekly-update-worthy

---

## JSON Ledger Structure

File path: `../../data/compute-ledger.json`

```json
{
  "last_updated": "2026-03-09T00:00:00Z",
  "current_sprint": "Sprint 4",
  "clusters": [
    {
      "name": "Condor",
      "total_gpus": 10000,
      "allocations": [
        {"team": "reasoning", "gpus": 4500, "updated": "2026-03-07"},
        {"team": "pre-training", "gpus": 3000, "updated": "2026-03-07"}
      ]
    }
  ],
  "changes_this_week": [
    {
      "date": "2026-03-07",
      "cluster": "Condor",
      "change": "4.5K GPUs moved to reasoning (was 3K)",
      "weekly_update_worthy": true,
      "suggested_bullet": "Condor: 4.5K to reasoning, up from 3K last sprint"
    }
  ],
  "history": []
}
```

### Ledger rules

- **Never delete data** - always append previous `changes_this_week` to `history` before updating
- `history` is an array of objects, each with a `week_ending` date and `changes` array
- `clusters[].allocations[].updated` tracks the last date each allocation was confirmed/changed
- If a cluster has no messages this week, keep its previous state unchanged - don't zero it out

---

## Weekly Update Feed

This ledger is designed to feed into the weekly update skill (`maj-weekly-update`):

- Changes flagged with `weekly_update_worthy: true` should be picked up by the weekly update skill
- The `suggested_bullet` field provides ready-to-use text for the compute section
- When Maj runs `/majupdate`, the weekly update skill should read `compute-ledger.json` and auto-include flagged changes in the Compute & Infra domain

---

## Key Channel IDs

| Channel | ID | Purpose |
|---------|----|---------|
| #ai-cluster-util | C08DN2YG5LH | Source - read compute allocation data from here ONLY |
| Maj self-DM | D07AKFZPGCB | Destination - send summary DM here ONLY |

---

## Known Slack User IDs

| Person | Slack ID | Usage in messages |
|--------|----------|-------------------|
| Mustafa Suleyman | U06US8T3CQG | `<@U06US8T3CQG>` |
| Maj (self) | U07AD0R06R4 | `<@U07AD0R06R4>` |

---

## Style Rules

- No emdashes - only hyphens
- Use `*bold*` for section headers in Slack messages
- Use `•` (bullet character U+2022) for list items in Slack, not `-` or `*`
- Keep suggested bullets in Maj's voice - specific numbers, direct, no corporate language
- No greeting or sign-off in Slack messages

---

## Edge Cases

- **No messages in #ai-cluster-util**: Tell Maj there were no compute messages in the last 7 days. Don't send a Slack DM - just display in terminal
- **Ledger file doesn't exist**: Create it with the empty initial schema (empty `clusters`, empty `changes_this_week`, empty `history`)
- **Can't parse allocation data**: Extract what you can, flag uncertain items with `[unclear]` in the change description. Don't guess numbers
- **Same data as last week**: Note "No changes from previous week" in the DM and terminal. Still update `last_updated` timestamp
- **Partial data**: If only some clusters have updates, update those and keep previous state for the rest
- **Channel read failure**: Flag the permissions issue to Maj. Don't retry silently

---

## File Paths (relative to this skill's location)

| Source | Path |
|--------|------|
| Compute ledger | `../../data/compute-ledger.json` |
| Slack style | `../../2. Writing/CLAUDE.md` |
