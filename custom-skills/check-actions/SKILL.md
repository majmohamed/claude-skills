# Check Actions Skill

**Purpose**: Review all open action items from leadership meetings, surface what's overdue, and draft follow-up messages so Maj can chase people efficiently.

**When to use**: Daily, before key meetings, or whenever Maj says "check actions", "what's outstanding", "what needs chasing", etc.

**IMPORTANT — No Confirmations**: This skill runs end-to-end without asking for permission. Load the tracker, categorize actions, display the summary, draft follow-up messages, and write any changes directly to `actions.json`. Do not pause for confirmation at any step except when Maj explicitly provides status updates.

---

## Step 1: Load the Action Tracker

Read the action tracker file:

```
../../data/actions.json
```

Relative to this skill, that resolves to:
```
5. Automations/data/actions.json
```

Parse the `actions` array. If the array is empty, tell Maj there are no tracked actions and suggest using the `process-meeting` skill to extract actions from recent meeting notes.

---

## Step 2: Filter to Open Items

Select all actions where `status` is `"open"` or `"in_progress"`. Ignore `"done"` and `"cancelled"`.

Use today's date for all date comparisons.

---

## Step 3: Categorize Actions

Sort every open action into **exactly one** of these categories, in this priority order:

### OVERDUE
- `due_date` is in the past (before today)
- **These are the most important.** Always show these first, sorted by how many days overdue (most overdue first).

### DUE THIS WEEK
- `due_date` falls within the next 7 calendar days (today through today + 6 days)
- Sort by due date, soonest first.

### NO DUE DATE
- `due_date` is `null`
- Sort by `source_date`, oldest first — the longer an item has been sitting without a deadline, the more attention it deserves.

Within each category, further group by `type`:
- **`for_maj`** — Maj's own action items (from Mustafa syncs, personal todos)
- **`for_others`** — Items Maj needs to chase other people on

---

## Step 4: Display the Summary

### Step 3b: Cross-reference with email/Teams (Work IQ)

Before displaying, query Work IQ for recent activity on overdue items:

- For each overdue action, query: "Have I received any recent emails or Teams messages about [action title/topic] from [owner] in the last 7 days?"
- If recent email/Teams activity is found, annotate the item in the display: `(recent email/Teams activity found - [date])`
- This helps Maj know which items may have progressed even if actions.json wasn't updated

### Step 3c: Display the Summary

Present the summary in this exact format:

```
# Action Items — [Today's Date]

**[X] open items** | **[Y] overdue** | **[Z] due this week**

---

## OVERDUE ([Y] items)

### For Others to Chase

| # | Action | Owner | Meeting | Assigned | Due | Days Overdue |
|---|--------|-------|---------|----------|-----|--------------|
| 1 | [title] | [owner] | [source_meeting name] | [source_date] | [due_date] | [X days] |

### For Maj

| # | Action | Source | Assigned | Due | Days Overdue |
|---|--------|--------|----------|-----|--------------|
| 1 | [title] | [source_meeting name] | [source_date] | [due_date] | [X days] |

---

## DUE THIS WEEK ([Z] items)

[Same table structure as above, but "Days Until Due" instead of "Days Overdue"]

---

## NO DUE DATE ([N] items)

[Same table structure, but "Days Open" instead of due date column]

---

## By Meeting Source

- **AI Council**: [count] open ([count] overdue)
- **SCW**: [count] open ([count] overdue)
- **Mustafa Sync**: [count] open ([count] overdue)
- **MSI Leads**: [count] open ([count] overdue)
[etc.]
```

**Formatting rules**:
- Use the meeting `name` from the registry (not the ID) when displaying source
- If a category has zero items, show it with "None" rather than omitting it — Maj should see that nothing is overdue, not wonder if something was skipped
- Bold any action that is **more than 7 days overdue** — these are critically late
- If an action has `follow_ups`, note the last follow-up date in parentheses: `(last chased: [date])`

---

## Step 5: Draft Follow-Up Slack Messages

**Only draft messages for `for_others` items that are overdue or due within 2 days.**

### Rules

1. **One message per person.** If someone has multiple overdue items, consolidate into a single message.
2. **Reference the specific meeting** where the action was assigned.
3. **Include the date** it was assigned.
4. **Don't draft a message** if the action was already followed up on within the last 3 days (check `follow_ups` array).
5. **Never draft messages for `for_maj` items** — those are Maj's own reminders.

### Maj's Slack Style

- Direct but collaborative — not aggressive, not passive
- No emojis
- Specific about dates and meetings
- Short — 2-3 sentences max
- Doesn't say "just checking in" or "friendly reminder" — states what he's following up on and asks for an update

### Templates

**Single overdue item:**
```
Hey [Name], following up on the [topic/title] from [Meeting Name] on [source_date] — wanted to check where this landed. Any update?
```

**Multiple overdue items for one person:**
```
Hey [Name], wanted to follow up on a couple things:

- [Title 1] (from [Meeting] on [date])
- [Title 2] (from [Meeting] on [date])

Where are we on these? Let me know if anything's blocked.
```

**Item due soon (within 2 days, not yet overdue):**
```
Hey [Name], heads up — the [topic/title] from [Meeting Name] is due [tomorrow / on Friday / on date]. Are we on track?
```

**Item overdue AND previously chased:**
```
Hey [Name], circling back on [topic/title] from [Meeting Name] — I flagged this on [last follow-up date] and it's now [X] days past due. Can you give me a status update today?
```

### Output Format

Present each drafted message like this:

```
### Follow-Up Messages

**To: [Owner Name]** — [count] item(s)
> [Draft message]

Action IDs: [id1, id2]

---

**To: [Owner Name]** — [count] item(s)
> [Draft message]

Action IDs: [id1, id2]
```

Include the action IDs so Maj can reference them when updating statuses.

---

## Step 6: Offer Status Updates

After presenting the summary and draft messages, offer Maj the option to update statuses. Keep it brief:

```
You can update statuses: "Mark [#] done", "[#] in progress", "Cancel [#]", "I chased [#]", "Set [#] due [date]", or "send all" to log follow-ups for all drafted messages.
```

### Processing Updates

When Maj provides updates:

1. **Mark as done/cancelled**: Set `status`, set `completed_at` to current ISO timestamp, update `updated_at`.
2. **Mark as in progress**: Set `status` to `"in_progress"`, update `updated_at`.
3. **Log a follow-up**: Append to the action's `follow_ups` array:
   ```json
   {
     "date": "YYYY-MM-DD (today)",
     "method": "slack",
     "note": "Follow-up sent"
   }
   ```
   Update `updated_at`.
4. **"Send all"**: Log a follow-up entry for every action that had a draft message generated.
5. **Set due date**: Update `due_date`, update `updated_at`.

**Write all changes back to `../../data/actions.json`**, preserving the full file structure (schema_version, meetings, action_schema, skills_catalog — everything stays intact, only the `actions` array and `last_updated` field change).

---

## Edge Cases

- **No open actions**: Tell Maj the tracker is clear. Suggest running `process-meeting` if there are recent meetings that haven't been processed.
- **No overdue items**: Still show the full summary — it's good to know nothing is late.
- **Action with no owner**: Flag it — "This action has no owner assigned, you may want to assign someone."
- **Action with no due date and older than 14 days**: Call it out — "This has been open for [X] days with no due date. Worth setting a deadline or closing it?"
- **Duplicate-looking actions**: If two actions have very similar titles and the same owner, flag the potential duplicate.

---

## File Path Reference

All paths are relative to this skill's location (`5. Automations/skills/check-actions/`):

| File | Relative Path | Description |
|------|---------------|-------------|
| Action tracker | `../../data/actions.json` | Source of truth for all actions |
| Meeting registry | (embedded in actions.json -> `meetings.registry`) | Maps meeting IDs to names |
| Slack style guide | `../../2. Writing/CLAUDE.md` | Maj's Slack voice for follow-up messages |

---

## Important Notes

- **Never invent actions.** Only display what exists in the tracker.
- **Never send messages.** Only draft them. Maj copy-pastes to Slack himself.
- **Always preserve the full JSON structure** when writing back to actions.json.
- **Use the meeting registry** in actions.json to resolve meeting IDs to display names.
- **Today's date** drives all overdue/due-soon calculations — always use the actual current date, never a hardcoded one.
