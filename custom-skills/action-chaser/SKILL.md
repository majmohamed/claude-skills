# Skill: Action Chaser

Scans `actions.json` for overdue and due-soon items, drafts chase messages in Maj's Slack voice, sends a status summary to Maj's self-DM, and supports batch/individual action closure.

**Slash command**: `/chase`

---

## Workflow

### Step 1 - Read and categorize actions

- Read `5. Automations/data/actions.json` fresh - never work from stale data
- Filter to items where `completed` is `false` and `archived` is `false`
- Identify **New today** - actions with `date_started` matching today's date (these were just extracted)
- Categorize all remaining open items into three buckets:
  - **Overdue** - has a `due_date` in the past (before today)
  - **Due This Week** - has a `due_date` within the next 7 days (today through 6 days from now)
  - **No Due Date** - `due_date` is null or missing
- If no `due_date` field exists on an action, infer overdue status from `date_started` - anything older than 14 days with no due date is treated as overdue
- Note: new-today items also appear in the appropriate backlog bucket (overdue/due this week/no due date) - the "New today" reply is a separate highlight, not a filter

### Step 2 - Group by ownership type

- Split categorized items into two groups:
  - **For others** (`dri` is NOT "Maj") - these are actions Maj needs to chase other people on
  - **For Maj** (`dri` is "Maj") - these are Maj's own action items / personal reminders
- Within each group, maintain the Overdue / Due This Week / No Due Date categorization

### Step 3 - Draft chase messages for overdue "for others" items

- For each overdue item where `dri` is NOT "Maj", draft a chase message in Maj's Slack voice
- Read `../../2. Writing/CLAUDE.md` for Maj's Slack style rules
- **Check email/Teams for recent activity before chasing (Work IQ)**:
  - Query Work IQ: "Have I received any recent emails or Teams messages from [owner name] about [action title/topic] in the last 7 days?"
  - If there IS recent activity: add a note to the chase draft: "(Note: [Owner] mentioned this in an email/Teams on [date] - check before chasing)"
  - If there is NO recent activity: draft the chase message as normal
  - This prevents Maj from chasing something that's already been addressed via email/Teams
- Chase message format:
  ```
  Hey [name] - quick follow up on [action title] from [source_meeting] on [date_started]. Where are we on this? [Additional context from notes if relevant]
  ```
- Style rules for chase messages:
  - Direct and conversational, not corporate
  - Use abbreviations where natural ("probs", "btw", "re")
  - Be specific with the action and meeting reference
  - No emdashes - only hyphens
  - No greeting fluff beyond "Hey [name]"
  - No sign-off
- **CRITICAL: Never auto-send chase messages.** Draft them and present to Maj for review. These are for Maj to copy-paste manually if he wants to send them

### Step 4 - Send status summary to Maj's self-DM

- **ONLY send to Maj's self-DM** - Channel ID: `D07AKFZPGCB`
- Use Slack threading format:

1. **Send header message** to D07AKFZPGCB:
   - Text: `Action tracker update :thread:`
   - Capture `thread_ts` from the response

2. **Reply 1 - New today** (in thread, skip if none):
   ```
   *New today* ([N] items)
   • [Action title] - [DRI name] (from [source_meeting])
   • [Action title] - [DRI name] - due [due_date] (from [source_meeting])
   • ...
   ```
   - Include all actions with `date_started` matching today's date (or the date being processed if chained from `/eod`)
   - Keep it clean and simple - title, owner, meeting source, due date only if set
   - This gives Maj a quick snapshot of what got added today before the backlog view

3. **Reply 2 - Overdue items** (in thread):
   ```
   *Overdue* ([X] items)
   • [Action title] - [DRI name] - [N] days late (from [source_meeting], [date_started])
   • ...
   ```

4. **Reply 3 - Due this week** (in thread):
   ```
   *Due this week* ([Y] items)
   • [Action title] - [DRI name] - due [due_date] (from [source_meeting])
   • ...
   ```

5. **Reply 4 - For you** (in thread):
   ```
   *For you* ([Z] items)
   • [Action title] - due [due_date or "no date"] - [notes context]
   • ...
   ```

- If a category has zero items, skip that reply entirely - don't post empty sections
- Use `•` (bullet character U+2022) for all list items, not `-` or `*`
- Use `*bold*` for section headers (Slack bold), not `**markdown bold**`

### Step 5 - Log follow-up activity

- For every overdue item included in the summary, add a follow-up entry to its record in `actions.json`:
  ```json
  {
    "date": "YYYY-MM-DD",
    "method": "auto-check",
    "note": "Surfaced in daily action chaser summary"
  }
  ```
- If the action has no `follow_ups` array, create one
- Update `last_chased` to today's date
- Update `updated_at` timestamp
- **Always read the full actions.json before writing** - never overwrite, always merge

### Step 6 - Offer closure (on-demand only)

- When invoked on-demand via `/chase` or "chase my actions":
  - After presenting the status report, ask: "Should I mark any of these done?"
  - Support batch-close: "Mark [ID1], [ID2], [ID3] done"
  - Support description-based close: "Mark the hiring blueprint one done"
- On closure, update the action in `actions.json`:
  - Set `completed` to `true`
  - Set `completed_at` to current ISO timestamp
  - Set `updated_at` to current ISO timestamp
- **Always read actions.json fresh before writing closure updates**

---

## Key Channel IDs

| Channel | ID | Purpose |
|---------|----|---------|
| Maj self-DM | D07AKFZPGCB | Destination - send status summary here ONLY |

**CRITICAL: Never send messages to any channel other than D07AKFZPGCB. Never send chase messages directly to action owners.**

---

## Known Slack User IDs

Use these for attributions and DRI matching. If a user isn't listed here, pull their user_id from Slack.

| Person | Slack ID | Usage in messages |
|--------|----------|-------------------|
| Mustafa Suleyman | U06US8T3CQG | `<@U06US8T3CQG>` |
| Maj (self) | U07AD0R06R4 | `<@U07AD0R06R4>` |
| Paul Soulos | U094XBL8U0G | `<@U094XBL8U0G>` |
| James Cerra | U0AGP746ENT | `<@U0AGP746ENT>` |
| Chris Daly | U075KNETM7F | `<@U075KNETM7F>` |

For anyone else, use the `dri` field name from actions.json and match against Slack user list if needed.

---

## Style Rules

- Follow Maj's Slack style from `../../2. Writing/CLAUDE.md`
- No emdashes - only hyphens
- No corporate speak or filler language
- Be specific with names, dates, meeting references
- Use `•` (bullet character U+2022) for Slack list items, not `-` or `*`
- Use `*bold*` for Slack formatting, not `**markdown bold**`
- No greeting or sign-off on the status summary
- Chase message drafts should sound like Maj talking to a colleague - direct, specific, conversational
- Calculate "days overdue" from `due_date` (or `date_started` + 14 days if no due date)

---

## Edge Cases

- **No open actions**: Tell Maj everything is clear - don't send a Slack summary with zero items
- **No overdue items**: Skip the overdue section and chase message drafts. Still send due-this-week and for-you sections if they have items
- **Action has no `follow_ups` array**: Create the array before appending
- **Action has no `due_date`**: Use `date_started` + 14 days as the implicit deadline. If `date_started` is also missing, categorize as "No Due Date" and don't calculate days overdue
- **DRI name doesn't match known Slack IDs**: Use the plain text name from actions.json. Don't guess Slack IDs
- **actions.json schema mismatch**: The file may use `completed` (boolean) instead of `status` field. Handle both - check for `completed: false` OR `status: "open"/"in_progress"`
- **Multiple actions for same DRI**: Group chase messages per person - don't send separate chase drafts for each action if someone has 3 overdue items. Combine into one message
- **Can't read actions.json**: Flag the error to Maj. Don't proceed with empty data
- **Can't send to Slack**: Show the summary in chat as fallback. Flag the Slack issue
