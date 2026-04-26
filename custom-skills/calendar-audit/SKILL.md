# Skill: Calendar Audit

A weekly calendar policy checker that reviews the following week's calendar against Maj's 13 scheduling policies and sends a polite, structured Slack message to the Rosie/CC group DM flagging clashes and suggesting fixes.

**Slash command**: `/calaudit`

**Schedule**: Every Friday morning (loop automation, 168h)

---

## Overview

This skill does three things:

1. **Pull next week's calendar** from Work IQ (Monday through Friday of the following week)
2. **Check every event against 13 scheduling policies** Maj has shared with Rosie and CC
3. **Post a warm, structured Slack message** to the Rosie/CC group DM flagging all clashes with suggested fixes

---

## Timezone Handling

**This is critical - read carefully.**

Maj's policies use two timezones. Getting this wrong will produce bad flags.

### Timezone reference table

| Policy | Times stated in | Example |
|--------|----------------|---------|
| 1. Meeting window | **PT** | 8am-12pm PT (= 4pm-8pm UK) |
| 2. Interview slots | **PT** | 8-9am PT on Mon/Tues/Thurs |
| 3. Working hours & finish times | **UK** | 11am UK start Tues/Thurs, 7pm UK Wed finish, 10pm UK Mon/Tues/Thurs finish |
| 6. Deep work blocks | **UK** | Mornings UK (= afternoons PT) |
| 8. Commute block | **UK** | 8-9pm UK every day |
| 9. EOD block | **UK** | 9-10pm UK on Mon/Tues/Thurs |
| All other policies | Timezone-agnostic | (count-based or category-based checks) |

### Calendar timezone

Maj's Outlook calendar **floats with his location** (normally UK, sometimes PT when on the West Coast). Meetings are typically scheduled in Pacific Time.

### How to handle timezone conversion

1. **Step 1 - Detect Maj's location next week.** Look at the calendar events for travel clues:
   - Flight bookings / travel events
   - Meeting locations mentioning Seattle, Redmond, SVC, Bay Area, or US offices
   - If location is ambiguous, **default to UK**
   - Note the detected location in the Slack message header so Rosie/CC can sanity-check it

2. **Step 2 - Normalize all event times to UK (GMT/BST).**
   - Whatever timezone the calendar returns events in, convert everything to UK time first
   - This is the baseline for Policy 3 (working hours), Policy 8 (commute), and Policy 9 (EOD)

3. **Step 3 - Convert to PT for Policy 1 and Policy 2 checks.**
   - For the meeting window check (Policy 1): convert each event to PT and check if it falls within 8am-12pm PT
   - For interview slot check (Policy 2): convert each interview to PT and check if it's in the 8-9am PT slot on Mon/Tues/Thurs
   - UK to PT conversion: subtract 8 hours (GMT) or 7 hours (BST). Use the correct offset for the date in question

4. **Step 4 - Adjust daily policies if Maj is on the West Coast.**
   - If auto-detect shows Maj will be in the US next week, the daily lifestyle policies (Policy 3, 8, 9) shift to PT:
     - Tues/Thurs gym morning: no meetings before **11am PT** (instead of 11am UK)
     - Wednesday evening free from **7pm PT** (instead of 7pm UK)
     - Friday finish by **6:30pm PT** (instead of 6:30pm UK)
     - Normal finish times: **10pm PT** Mon/Tues/Thurs, **7pm PT** Weds/Fri
     - Commute block: **8-9pm PT** (instead of 8-9pm UK)
     - EOD block: **9-10pm PT** (instead of 9-10pm UK)
     - Deep work: mornings PT / afternoons PT still works (just the absolute times shift)
   - Policies 1 and 2 stay in PT regardless of location (they're always PT)

5. **Step 5 - Display times in the Slack message.**
   - Show times in whichever timezone Maj is in that week (the "local" timezone)
   - Add the other timezone in brackets for meeting window / interview checks where PT matters
   - Example when in UK: "Team standup (5pm UK / 9am PT) - this falls within the meeting window :white_check_mark:"
   - Example when in US: "Team standup (9am PT / 5pm UK) - this falls within the meeting window :white_check_mark:"

### BST vs GMT

- UK observes BST (UTC+1) from the last Sunday in March to the last Sunday in October
- PT observes PDT (UTC-7) from the second Sunday in March to the first Sunday in November
- The offset between UK and PT is usually 8 hours but can be 7 hours during transition weeks
- **Always calculate the correct offset for the specific dates being checked**

---

## Meeting-Specific Rules

Before running policy checks, apply these meeting-specific rules. These override generic policy flags.

### Immovable meetings (don't suggest moving these - just note any policy clashes as FYI)
- **Strategy weekly (risk register)** - Monday evening. Can't move. If it clashes with a policy, note it but don't suggest a fix
- **Any meeting with Mustafa Suleyman as organizer or attendee** - these are hard to move. Flag the policy clash but note "Mustafa is on this so may be tricky to move" rather than suggesting Rosie/CC reschedule it. **IMPORTANT: Always check attendees/organizer before suggesting a meeting time change.** If Mustafa is on it, don't suggest moving. This includes meetings like Build GTM Weekly, MAI in VSC weekly, Build Reviews, Strategy weekly, etc.
- **Any meeting with Satya Nadella in the invite** - cannot be changed at all. Just note whether Maj should join or not. Don't suggest moving, rescheduling, or declining
- **AI Infra (Friday evenings)** - this is an SLT meeting, NOT the same as "AI Infra Leads Weekly". Maj must attend and can't change it. Do NOT flag this for deletion. Only "AI Infra Leads Weekly" (organised by Yunchao Gong, typically Monday) is on the should-be-deleted list
- **Compute-Data-Talent (Friday evenings)** - SLT meeting. Maj must attend, can't change timing. Same treatment as AI Infra
- **GPU Mtg / GPU Mtg Copy (Wednesday evenings)** - Maj keeps this. Don't suggest moving or removing it even if it falls during the Wednesday block or outside the meeting window

### Meetings Maj will decline / not join
- **BizStrat meetings** (BizStrat: Mission Check-in, BizStrat: LT Updates and Deep Dives, etc.) - Maj will decline and not join these. Flag them as "Maj will decline - can be ignored" rather than suggesting they move
- **Copilot All Hands** (any variant - C2 All Hands, Copilot Mid-Cycle All Hands, etc.) - Maj will never attend these. Flag for deletion/decline
- **Meetings in the "should be deleted" list** (Policy 11) - these should be removed entirely, not just declined

### Meetings Maj won't attend - flag for deletion
- **SkillUp sessions** (e.g. "SkillUp: Agent Speed Skills", any SkillUp variant) - Maj won't attend. Should be deleted
- **Reading Group invites** (e.g. "Reading Group: TurboQuant", any Reading Group variant) - should be deleted, not just declined
- **MAI Memo Prep Review w/Chris** (organised by Natasha Milovic) - Maj doesn't join this. Flag for deletion
- **Azure Databricks (ADB) Office Hours** - Maj won't join. Should be deleted

### How to handle overlapping meeting slots
When multiple meetings overlap in the same time slot, Claude should make the call on which ones Maj needs to attend rather than asking Rosie/CC to figure it out. Use these rules:
- **Build Reviews** (Weekly Build Review: Post-Training, Reasoning, SWE, etc.) - Maj WILL attend these. Keep in diary
- **Workstream weekly meetings** (WS-Pretraining Weekly, (BW) Post-Training WS, etc.) - these stay in the diary but Maj does NOT need to attend. Note "stays in diary, Maj won't join"
- **Mustafa/SLT meetings** - Maj attends. Takes priority over workstream meetings
- **One-off meetings with senior leaders** - Maj likely attends. Flag but don't suggest declining
- When listing overlaps, state clearly which ones Maj will attend and which he won't, rather than asking "could we work out which ones Maj needs to attend?"

### Meeting clustering
- **Look for scattered meetings across a day.** If a day has meetings spread out with gaps (e.g. one meeting at 3pm, nothing til 6pm, then another at 7pm), flag the poor clustering and suggest whether meetings could be moved closer together to create larger blocks of uninterrupted time
- **Ideal pattern**: meetings clustered in the 4pm-8pm UK window (the PT overlap), with mornings free for deep work
- **How to flag**: In the "Worth adjusting" section, add a note like "Tuesday has meetings at 4pm, then a gap, then 5pm-6pm, then another gap, then 7pm - could we cluster the 4pm and 7pm meetings closer together?"

---

## The 13 Policies

Every calendar event for the following week must be checked against ALL of these. Flag any violation. All timezone references below use the **source timezone** (PT or UK) as noted in the timezone table above.

**Important**: Before flagging a violation, check the Meeting-Specific Rules above. Some meetings are immovable, some Maj will decline, and some need different handling.

### Policy 1: Meeting window - *times in PT*
- All meetings should fall within **8am-12pm PT** (which is 4pm-8pm UK during BST, 3pm-7pm UK during GMT - but always check as 8am-12pm PT)
- Flag: Any meeting outside this window
- Suggested fix: "Could we move this into the 8am-12pm PT window?"

### Policy 2: Interview cap - *times in PT*
- Maximum **3 interviews per week**
- Preferred slots: **8-9am PT** on Monday, Tuesday, Thursday (= 4-5pm UK during BST)
- Flag if: More than 3 interviews scheduled in the week
- Flag if: Any interview is NOT on Mon/Tues/Thurs in the 8-9am PT slot
- Suggested fix: "We've got [N] interviews next week - can we reschedule [specific ones] to the 8-9am PT Mon/Tues/Thurs slots or push to the following week?"

### Policy 3: Daily working hours and finish times - *times in UK (shift to PT if Maj is in the US)*
- **Monday**: Start early, finish late. Full day to get on top of everything. Finish by **10pm UK**
- **Tuesday**: Start work ~**11am UK** (gym morning). Ideally free til **4-5pm UK** for work. Finish by **10pm UK**
- **Wednesday**: Start early, finish early. **Every Wednesday evening free from 7pm UK.** Ideally 100% meeting-free. Finish by **7pm UK**
- **Thursday**: Same as Tuesday (gym morning, start ~**11am UK**). Finish by **10pm UK**
- **Friday**: As meeting-light as possible. Finish by **6:30pm UK** every other week (for prayers when there's no SLT compute-data-talent meeting). Normal finish **7pm UK**
- Flag: Meetings on Tuesday/Thursday before 11am UK (unless it's an interview in the 8-9am PT slot, which is 4-5pm UK - no conflict)
- Flag: Any meeting on Wednesday evening (after 7pm UK)
- Flag: Any meetings on Wednesday (ideally meeting-free)
- Flag: Meetings on Friday after 6:30pm UK
- Flag: Heavy meeting load on Friday (should be meeting-light)
- **If Maj is in the US**: All UK times above shift to PT (e.g. 11am UK becomes 11am PT, 7pm UK becomes 7pm PT)

### Policy 4: 1-1s policy - *timezone-agnostic*
- **No recurring 1-1s** - these should all be removed
- Exceptions: Weekly 30min (or 1hr) with **James, Maj, and Paul** - ideally Tuesday mornings
- People whose recurring 1-1s should be removed: Myron, Yunchao, Purvi, Jon, Amber
- 1-1s happen once per cycle at the meetup, or ad hoc
- Flag: Any recurring 1-1 that isn't the James/Paul weekly

### Policy 5: MSI team calendar meetings - *timezone-agnostic*
- Maj joins: purple, orange, pink, yellow, and MSI-team weekly
- Maj does NOT join: green or reading group
- Interviews should be scheduled in the green blocks on Tues/Thurs if possible
- Flag: If Maj is on a "green" or "reading group" meeting
- Note: Colour-coding can't be checked via Work IQ - use meeting title/series name to identify

### Policy 6: Deep work blocks - *times in UK (shift to PT if Maj is in the US)*
- **4-5 hours of deep work time daily** in mornings UK time (= afternoons PT when in UK)
- These should be visible as blocks in the calendar
- Flag: Days with no deep work block, or deep work blocks shorter than 3 hours
- Flag: Deep work blocks that have been overridden by meetings
- Suggested fix: "No deep work block on [day] - could we add a 4-hour block in the morning?"
- **If Maj is in the US**: Deep work shifts to mornings PT / afternoons PT (the concept stays the same - block out non-meeting hours for focused work)

### Policy 7: Cycle calendar audit - *timezone-agnostic*
- 30-minute live session at the start of every cycle with Rosie/CC to review the calendar
- This is a reminder, not a weekly check - mention if the next cycle is approaching which you can tell when a meetup week is approaching

### Policy 8: Commute blocks - *times in UK (shift to PT if Maj is in the US)*
- **8-9pm UK block every day** for commute home and dinner
- When Maj is in the UK, this is literally his commute. When in the US, it functions as a lunch/break block at the PT equivalent
- Flag: Missing commute block on any day
- Flag: Meetings booked over the commute block
- Suggested fix: "Commute block (8-9pm UK) is missing/overbooked on [day]"
- **If Maj is in the US**: Check for an **8-9pm PT** block instead (same concept, local time)

### Policy 9: End-of-day close-up - *times in UK (shift to PT if Maj is in the US)*
- **9-10pm UK block on Monday, Tuesday, Thursday** for Emails/Slack close-up
- Flag: Missing EOD block on Mon/Tues/Thurs
- Flag: Meetings booked over the EOD block
- Suggested fix: "EOD close-up block (9-10pm UK) missing on [day]"
- **If Maj is in the US**: Check for **9-10pm PT** blocks instead

### Policy 10: Week ahead review - *timezone-agnostic*
- THIS skill IS policy 10 - the Friday automation that reviews next week's calendar
- No check needed - just running this skill fulfils policy 10

### Policy 11: Declining/deleting irrelevant stuff - *timezone-agnostic*
- Flag any of these meetings if they appear on the calendar:
  - AI Infra Leads weekly (organised by Yunchao Gong - NOT the same as "AI Infra" which is an SLT meeting Maj must attend)
  - Mango + Manifold biweekly
  - MAI metrics deepdive
  - MAI Copilot / CoreAI sync
  - Multiturn eval office hour
  - Maia VM Platform syncs (note this does not include Maia executive syncs that have Mustafa on them)
  - Copilot All Hands (any variant - C2 All Hands, Mid-Cycle All Hands, etc.)
- Suggested fix: "These are in the 'should be deleted' list - can we remove them?"
- Note: Workstream weekly meetings should be declined but left visible (don't delete those)
- **IMPORTANT**: "AI Infra" on Friday evenings is an SLT-level meeting - do NOT flag it for deletion. Only "AI Infra Leads Weekly" (Yunchao Gong, typically Monday slot) should be flagged

### Policy 12: Calendar colour coding - *timezone-agnostic*
- Categories: MSI strategy team, workstream meetings, leadership meetings (MSI leads, supercomputing weekly, data council), SLT, 1-1s, ad hoc/non-recurring meetings
- Can't directly check colours via Work IQ - but flag if any meeting appears uncategorised or hard to classify
- This is more of a reminder check - mention if colour coding seems off

### Policy 13: Meetup weeks - *timezone-agnostic*
- If next week is a meetup week:
  - **Monday must be fully clear** (leadership offsite day)
  - **No interviews** during meetup week
  - **No external calls** with people not at the meetup
  - Lots of 1-1s expected (this is when they happen instead of recurring ones)
  - Maj flies out on Sunday
- Flag: Any violations of meetup week rules
- Note: Need to identify if next week is a meetup week - check for meetup-related calendar events or ask Maj

---

## Data Sources

### Work IQ (primary)
- **Calendar**: "What meetings and events are on my calendar for the week of [next Monday's date]? Include times with timezone, titles, attendees, recurrence info, and any categories/colours. Please include any travel events or flights too."
- Query for the full Monday-Friday of the following week
- **Important**: Request times with explicit timezone info so we can convert accurately

### Local files (supplementary)
- **Memory file** (`.claude/memory/memory.md`): Check for any meetup week mentions or travel plans
- **Actions.json meeting registry**: Cross-reference meeting titles against known meeting types

---

## Workflow

### Step 1 - Determine next week's dates

Calculate the Monday-Friday dates for the following week (next Monday through next Friday).

If today is not Friday, still calculate the next full working week.

### Step 2 - Check for meetup week and detect location

Before running policy checks:

**2a. Meetup week check:**
- Work IQ: "Do I have any meetup or offsite events next week?"
- Memory file: Any travel/meetup mentions
- If it's a meetup week, apply Policy 13 rules on top of everything else

**2b. Location detection (determines which timezone to apply for daily policies):**
- Scan next week's calendar for: flights, travel events, meeting locations mentioning Seattle/Redmond/SVC/Bay Area/San Francisco
- Check memory file for travel plans
- **If US indicators found**: Set `location = "US"` - daily policies (3, 6, 8, 9) will use PT times
- **If no US indicators or ambiguous**: Set `location = "UK"` (default) - daily policies use UK times
- **Policies 1 and 2 always use PT** regardless of location
- Note the detected location in the Slack message so Rosie/CC can sanity-check it

### Step 3 - Pull next week's calendar

Query Work IQ for the full calendar for next week. Get:
- Event title
- Start time, end time (with explicit timezone)
- Recurrence (is it a recurring meeting?)
- Attendees (if available)
- Category/colour (if available)
- Location (if available - helps identify meetup vs remote)

### Step 3b - Normalize all times

- Convert all event times to both UK and PT
- For each event, store: `time_uk`, `time_pt`, `original_tz`
- Calculate the correct GMT/BST and PST/PDT offsets for the specific dates (watch for clock change weekends)

### Step 4 - Run all policy checks

Process the calendar day by day, checking every event against all 13 policies. Build a structured list of violations:

For each violation, capture:
- **Day**: Which day
- **Policy**: Which policy number + short name
- **Meeting**: The specific meeting
- **Issue**: What's wrong
- **Suggested fix**: What Rosie/CC should do

### Step 5 - Prioritize and group

Group violations into:
1. **Must fix** - Meetings in the "should be deleted" list (Policy 11), meetings outside the 8am-12pm PT window that CAN be moved (check Meeting-Specific Rules first), Wednesday evening meetings (Policy 3), recurring 1-1s that should be removed (Policy 4)
2. **Should fix** - Interview placement issues (Policy 2), missing blocks (Policies 6, 8, 9), Friday heaviness (Policy 3), poor meeting clustering (scattered meetings with gaps)
3. **FYI / can't change** - Immovable meetings that clash with policies (Mustafa meetings, Satya meetings, Strategy weekly, AI Infra SLT, GPU Mtg), BizStrat meetings Maj will decline, colour coding reminders (Policy 12), cycle audit reminder (Policy 7), meetup week notes (Policy 13)

### Step 6 - Format and post to Slack

Post to Rosie/CC group DM (`C0AM6V2L892`) as a threaded message. **Keep it concise** - aim for 4 replies max. Avoid duplicating the same meeting across multiple sections. Each meeting should appear only once, in the most relevant section.

**Header message:**
```
Week ahead calendar review - [DD Mon - DD Mon] :thread:
```

**Reply 1 - Intro + context:**
```
Hey team - this is from Claude :wave:

Ran through Maj's calendar for next week. [N] things to flag - here's a breakdown.

*Maj is [in the UK / on the West Coast] next week. Daily policies checked against [UK / PT] times, meeting window always in PT.*

[If heavy week: "It's a heavy week - [N] meetings across [N] working days. Flagging what we need to sort below - happy to discuss async here with Maj."]
[If meetup week: "Next week is a meetup week - Monday fully clear, no interviews, no external calls with people not at the meetup."]
[If bank holiday: ":warning: [Day] is a UK bank holiday - worth confirming with Maj if he's working."]
```

**Reply 2 - Action items (the core of the message):**

Combine "things to sort" and "worth adjusting" into a single day-by-day list. Use emoji prefixes to indicate severity:
- :red_circle: for must-fix items (deletions, removed 1:1s, badly placed interviews)
- :large_orange_circle: for should-fix items (meeting window, clustering, missing blocks)
- :information_source: for FYI (immovable clashes, declining)

```
*Day-by-day review*

*Monday [DD]*
:red_circle: AI Infra Leads Weekly (7pm) - should be deleted
:red_circle: Maia200 VM Platform sync (7:05pm) - should be deleted
:information_source: Strategy weekly (8:30pm) - outside meeting window but can't move, this is fixed

*Tuesday [DD]*
:large_orange_circle: Phone Screen (5pm / 9am PT) - fine day but ideally 8-9am PT slot
:information_source: BizStrat: Mission Check-in (4pm) - Maj will decline, can be ignored
:large_orange_circle: No deep work block - could we add an 11am-3pm block after gym?
:large_orange_circle: No commute (8-9pm) or EOD (9-10pm) blocks

*Wednesday [DD]*
:red_circle: 1:1 Yunchao (3:30pm) - recurring 1:1, should be removed
:red_circle: 1:1 Myron (6:30pm) - recurring 1:1, should be removed
:red_circle: Maia200 VM Platform sync (7:05pm) - should be deleted
[... etc]

*Clustering note:* [Day] has meetings at [times] with gaps - could we move [movable ones] closer together?
```

Rules for the day-by-day list:
- **One entry per meeting, in one section only** - don't repeat the same meeting
- **For overlapping slots**: State which meetings Maj will attend and which he won't (use the overlap rules above), rather than asking Rosie/CC to figure it out
- **For immovable meetings** (Mustafa, Satya, Strategy weekly, SLT calls): Use :information_source: and note why it can't move
- **For workstream meetings**: Note "stays in diary, Maj won't join" - don't flag as a problem
- **Missing blocks**: Fold into the relevant day rather than a separate section. One line per day: ":large_orange_circle: No commute (8-9pm) or EOD (9-10pm) blocks"
- **Deep work blocks**: One line per day if missing: ":large_orange_circle: No deep work block - could we add [suggested time]?"

**Reply 3 - Meetings to delete/decline (compact list):**

Only if there are deletion-list or decline-list meetings. Keep it tight.

```
*Bulk cleanup* :wastebasket:

*Delete:*
• Maia200 VM Platform sync - Mon, Wed, Fri (3 instances)
• AI Infra Leads Weekly - Mon
• Copilot C2 Mid-Cycle All Hands - Thu

*Decline (leave visible):*
• BizStrat: Mission Check-in - Tue
• BizStrat: LT Updates - Thu
```

**Reply 4 - Summary + reminders:**

Keep this short. No duplication of what's already been said.

```
*Stats:* [N] meetings | Interviews: [N]/3 | Deep work blocks: [N]/5 days | Clashes: [N]

[Any reminders that don't fit elsewhere - colour coding, cycle audit approaching, Mustafa in London, etc.]

_Note: Some meetings flagged above have Mustafa on them so the timing is what it is - just flagging the policy clashes for awareness._

Thanks so much for sorting these :pray: Anything to discuss, flag here and we can loop in Maj async.
```

**IMPORTANT - never say**: "Might be worth a quick chat with Maj about what can be dropped" or suggest a live meeting. Always frame as "flag here and we can discuss async with Maj."

### Step 7 - Confirm completion

After posting, confirm in terminal:
```
Calendar audit posted for week of [DD Mon]:
- [N] policy clashes flagged
- [N] must-fix items
- [N] should-fix items
- Posted to Rosie/CC group DM
```

---

## Style Rules

This message goes to Rosie and CC - NOT SLT, NOT Mustafa. The tone should be:

- **Super polite and warm** - these are the people managing Maj's diary and he's grateful for their help
- **Mention "This is from Claude"** at the top so they know it's automated
- **Concise** - 4 threaded replies max. No duplication. Each meeting appears once. Missing blocks are folded into the day, not a separate section
- **Day-by-day** in the main review so they can work through the week linearly
- **Make the call** on overlapping meetings (who attends what) rather than asking Rosie/CC to figure it out
- Use `*bold*` for Slack formatting
- Use bullet points for lists
- No emdashes - only hyphens
- Include :pray: and :wave: emoji - this is a friendly collaborative message
- Don't use corporate speak
- **Never suggest a "quick chat" or sync meeting with Maj** - always frame as "flag here and we can discuss async with Maj"
- Sign off with gratitude

---

## Edge Cases

- **Clean calendar**: If no violations found, still post a short "All clear!" message: "Hey team - this is from Claude :wave: Ran through next week's calendar and everything looks good against Maj's policies. No clashes to flag! :tada:"
- **Work IQ unavailable**: Post a message saying the calendar couldn't be checked and to flag to Maj
- **Can't determine meetup week**: Default to non-meetup week rules. Mention "I wasn't able to confirm whether next week is a meetup week - worth double-checking with Maj"
- **Timezone ambiguity**: If location can't be determined, default to UK. Show times in UK with PT in brackets. Always note the assumption in the Slack message so Rosie/CC can correct if wrong
- **Clock change weeks**: If next week spans a BST/GMT or PDT/PST transition, be extra careful with offsets. The UK and US don't always change clocks on the same weekend - double-check the specific dates
- **Split-week travel**: If Maj appears to be in the UK for part of the week and US for the rest (e.g. flies out Wednesday), split the policy checks accordingly and note this in the message
- **Very heavy week (20+ meetings)**: Still check everything. Add a note: "This is a particularly heavy week - [N] meetings. Flagging anything we need to sort below - happy to discuss async here with Maj."
- **Friday evening prayer check (Policy 3)**: Flag Friday meetings after 6:30pm. Note: "Every other week Maj needs to finish by 6:30pm for prayers (when there's no SLT compute-data-talent meeting). Worth checking if this is a prayer week."

---

## File Path Reference

| Source | Path |
|--------|------|
| Memory file | `.claude/memory/memory.md` |
| Action tracker | `5. Automations/data/actions.json` |
| Slack style guide | `2. Writing/CLAUDE.md` |
| Rosie/CC group DM | C0AM6V2L892 |
| Maj self-DM | D07AKFZPGCB |

---

## Dependencies

- **Work IQ MCP**: Required for calendar queries (next week's schedule)
- **Slack MCP**: Required for posting the audit message to the group DM
- **Local files**: Memory file for meetup/travel context

---

## Important Notes

- **Post to C0AM6V2L892 only** - this goes to the Rosie/CC group DM, not Maj's self-DM
- **No approval needed** - this runs end-to-end without pausing
- **Tone is key** - polite, warm, grateful. These are teammates helping Maj manage his life
- **Don't invent violations** - only flag things the calendar data actually shows
- **Timezone precision is critical** - Policies 1 and 2 are ALWAYS in PT. Policies 3, 6, 8, 9 are in UK time (or PT if Maj is in the US that week). Auto-detect location from calendar. When in doubt, default to UK and note the assumption
- **Show times in Maj's local timezone** with the other timezone in brackets for cross-reference
- **"This is from Claude"** must appear at the top of the message every time
