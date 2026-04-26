# Skill: Maj's Monday Morning Briefing

Chief of staff weekly briefing for Maj Mohamed. Reads Slack channels, emails, Teams messages, and meeting transcripts via Work IQ. Updates the MSI Issue Tracker, interviews Maj on gaps, then sends a structured weekly overview DM.

**Trigger**: `/monday` or "Monday briefing" or "maj-monday-briefing"

---

## Overview

This skill does six things in sequence:

1. **Read Slack** - Pull the last 7 days of Slack activity across key channels and DMs
2. **Read Emails/Teams** - Pull email and Teams context via Work IQ (inbox, follow-up folder, sent items, Teams channels, Teams DMs)
3. **Update** - Update the MSI Issue Tracker Excel file with latest status from Slack + email/Teams
4. **Interview** - Ask Maj about Red/missing items in a Claude Code interview
5. **Brief** - Send a structured weekly overview DM to Maj on Slack
6. **Chase** - Automatically chain into the action-chaser skill (`/chase`) to post action tracker status and draft chase messages

**Chaining**: After the Monday briefing is posted, this skill automatically calls the `action-chaser` skill (`/chase`). The briefing gives the strategic overview; the chase gives the tactical action status and draft follow-up messages.
4. **Interview** - Ask Maj about Red/missing items in a Claude Code interview
5. **Brief** - Send a structured weekly overview DM to Maj on Slack

---

## Slack Channel IDs

| Channel | ID | What to look for |
|---------|-----|------------------|
| #ai-noteworthy | `C098VHM0560` | Maj weekly update, Paul weekly update, James weekly update, any other weekly updates |
| #ms-strategy | `C08128P9480` | Weekly updates from Jon Fuchs, Myron Nagalingam, Amber Chi, Adam Sheppard |
| #ai-council | `C08S37VTJM8` | Weekly updates from all council members (Adam Sadovsky, Prashant, Purvi, Karén, Nando, Weizhu, Timo, Matt S, Hanxiao, Sujee, etc.) |
| #hiring-ai-leadership | `C08S4KSM32Q` | Weekly hiring updates, asks of Maj specifically |
| #msi-leads | `C0A3NQWQ6H4` | Open threads needing decisions, agenda items for upcoming meetings |
| Mustafa DM | `D07BV8JAMQX` | Open asks from Mustafa, commitments Maj made, things Mustafa is chasing |
| Karén DM | `D07BG9FPWRX` | Open asks, coordination items, things needing follow-up |
| Mustafa + Karén group | `C07CG48QBL7` | Shared threads needing response or action |
| #ai-cluster-util | `C09DDJZ1WGA` | Compute allocation requests, quota changes, cluster utilization flags |
| Maj self-DM (for sending briefing) | `D07AKFZPGCB` | Target for the output briefing |

### Key User IDs

| Person | User ID |
|--------|---------|
| Maj (Majid Mohamed) | `U07AD0R06R4` |
| Mustafa Suleyman | `U06US8T3CQG` |
| Karén Simonyan | `U06TWRQM28N` |
| Paul Soulos | `U094XBL8U0G` |
| James | `U0AGP746ENT` |

---

## Step 1 - Read Slack (last 7 days + prior week for context)

Read all channels in parallel. For each, pull the last 7 days of messages. For context/trends, also glance at the prior week's updates if relevant.

### 1a. #ai-noteworthy (`C098VHM0560`)

- Pull `conversations_history` with limit 100
- Find and read full threads for:
  - "Maj weekly update" posts from Majid Mohamed
  - "Weekly update" posts from Paul Soulos
  - "Weekly update" posts from James (U0AGP746ENT)
  - Any other weekly update threads
- Also find and read any topic-specific threads started by Maj, Paul, Mustafa, or James in the last 7 days
- Extract: key themes, decisions, concerns, action items, asks of specific people

### 1b. #ms-strategy (`C08128P9480`)

- Search for weekly update threads from the last 7 days from:
  - Jonathan Fuchs ("Jon weekly update")
  - Myron Nagalingam ("Myron Weekly Update")
  - Amber Chi ("Amber weekly update")
  - Adam Sheppard ("Adam Weekly Update")
- Read each thread fully
- Extract: key themes per person, anything that touches MSI or is relevant to Maj's workstreams

### 1c. #ai-council (`C08S37VTJM8`)

- Search for weekly update threads from all council members in the last 7 days
- Read each thread fully
- Extract cross-cutting themes (don't summarize per person - group by theme)
- Themes to watch for: infra issues, hiring, evals, post-training, data, safety, tooling, RL, agentic

### 1d. #hiring-ai-leadership (`C08S4KSM32Q`)

- Pull recent messages (last 7 days)
- Find the weekly hiring update from Ken Liu / Annie McKillop
- Extract: anything that asks for action from Maj specifically, any blockers that need Maj's input

### 1e. #msi-leads (`C0A3NQWQ6H4`)

- Pull recent messages (last 7 days)
- Identify open threads that need decisions this week
- Flag any topics Mustafa has raised that need follow-up
- Flag any items that should be on the MSI leads meeting agenda

### 1f. DMs

**Mustafa DM** (`D07BV8JAMQX`):
- Pull last 7 days of messages
- Extract: open asks from Mustafa that Maj hasn't responded to or actioned, commitments Maj made, things Mustafa is chasing or waiting on

**Karén DM** (`D07BG9FPWRX`):
- Pull last 7 days of messages
- Extract: open coordination items, things needing follow-up

**Mustafa + Karén group** (`C07CG48QBL7`):
- Pull last 7 days of messages
- Extract: shared threads needing response or action

### 1g. Maj's own messages

- Search Slack for all messages from `majidmohamed` in the last 7 days across all channels
- This catches anything posted in channels not explicitly listed above
- Use: `slack_search_messages` with query `from:@majidmohamed` filtered by date

### 1h. Compute allocation flags

This step gathers all open compute-related threads where Maj has been tagged or is involved.

**#ai-cluster-util** (`C09DDJZ1WGA`):
- Pull last 7 days of messages
- Look for quota change requests, allocation disputes, utilization flags
- Extract: who is asking, what cluster/resource, what they need, whether it's been resolved

**Search for compute tags on Maj**:
- Use `slack_search_messages` with queries:
  - `@majidmohamed condor` (last 7 days)
  - `@majidmohamed mango` (last 7 days)
  - `@majidmohamed gb200` (last 7 days)
  - `@majidmohamed h200` (last 7 days)
  - `@majidmohamed dfw` (last 7 days)
  - `@majidmohamed quota` (last 7 days)
  - `@majidmohamed allocation` (last 7 days)
  - `@majidmohamed gpu` (last 7 days)
  - `@majidmohamed falcon` (last 7 days)
- For each match, check if the thread is still open/unresolved
- Extract: who tagged Maj, what they need, which cluster/region, whether Maj has responded, what the current status is

---

## Step 2 - Read Emails, Teams, and Meeting Transcripts (via Work IQ)

Run these Work IQ queries in parallel with Step 1 where possible.

### 2a. Inbox and follow-up folder (14 days)

Query Work IQ: "What are the important emails in my inbox and follow-up folder from the last 14 days? Summarize the key threads, who they're from, and what action is needed. Pay special attention to emails from Mustafa Suleyman, Karen Simonyan, Kevin Scott, Eric Boyd, and other senior leaders."

Extract: subject, sender, date, whether a response is needed, key asks

### 2b. Sent emails - commitment tracker (14 days)

Query Work IQ: "In emails I sent over the last 14 days, what commitments did I make? Look for phrases like 'I will', 'I'll', 'let me', 'will send', 'will follow up', 'I'll get back to you', 'will share', 'will check', 'will look into'. List each commitment with the email subject, recipient, date, and what I committed to do."

Extract: commitment text, recipient, date, whether it appears to be fulfilled

### 2c. Unresponded emails and Teams messages

Query Work IQ: "What emails and Teams messages have I received in the last 7 days that I haven't replied to? Focus on messages from Mustafa Suleyman, Karen Simonyan, Kevin Scott, Eric Boyd, Kutta Srinivasan, Rolf Harms, Michael Yamartino, Bonita Armstrong, Mat McBride, Roy Vincent, Venkat PA, and any other senior leaders or direct reports."

Extract: sender, subject/topic, date, urgency

### 2d. Teams channels (7 days)

Query Work IQ for each monitored Teams channel:

| Channel | What to query |
|---------|--------------|
| MSFT AI Model Council | "What were the key discussions and decisions in the MSFT AI Model Council Teams channel this week?" |
| AI Data Council | "What were the key discussions and decisions in the AI Data Council Teams channel this week?" |
| MAI Supercomputing Weekly | "What were the key discussions in the MAI Supercomputing Weekly Teams channel this week?" |

Extract: key themes, decisions, action items, anything relevant to MSI

### 2e. Teams DMs (7 days)

Query Work IQ: "Summarize my Teams DM conversations from the last 7 days with Kutta Srinivasan, Rolf Harms, Michael Yamartino, Bonita Armstrong, Eric Boyd, Mat McBride, Roy Vincent, and Venkat PA. For each person, what are the open threads, asks, and follow-ups?"

Extract: open asks, coordination items, things needing follow-up

### 2f. Meeting transcripts (7 days)

Query Work IQ: "What were the key discussions, decisions, and action items from my meeting transcripts over the last 7 days? Focus on meetings where significant decisions were made or actions were assigned to me."

Extract: key themes, decisions, action items not captured in local meeting notes

---

## Step 3 - Update the MSI Issue Tracker

**File**: `C:\Users\majidmohamed\Microsoft\Microsoft AI-TA - Documents\12. AI Team\MSI ISSUE TRACKER v2.xlsx`

### 3a. Read current tracker state

- Open the Excel file with openpyxl (use `C:\Users\majidmohamed\AppData\Local\Python\bin\python.exe`)
- Read all rows: Workstream, Issue, Strat DRI, MSI DRI, Priority, RAG status, Horizon, Status + next steps
- Column mapping: B=Workstream, C=Issue, D=Strat DRI, E=MSI DRI, F=Priority, G=RAG, H=Horizon, I=Status, J=Docs

### 3b. Match Slack + email/Teams signal to tracker items

- For each tracker item, check if there is new signal from this week's Slack activity AND email/Teams activity
- Sources of signal:
  - Maj's weekly update in #ai-noteworthy
  - Paul's weekly update in #ai-noteworthy
  - James's weekly update in #ai-noteworthy
  - #ai-council weekly updates
  - #msi-leads threads
  - DM threads with Mustafa and Karen
  - **Email threads related to tracker items** (from Step 2a)
  - **Teams channel discussions** (from Step 2d)
  - **Teams DM exchanges** (from Step 2e)
  - **Meeting transcript decisions** (from Step 2f)
- If there is clear signal, draft a status update (max 20 words)
- If there is no signal, flag it for the interview in Step 4

### 3c. Write updates to Excel

- Use Python + openpyxl to update column I (Status + next steps) for each item that has new signal
- Save the file after updates

---

## Step 4 - Interview Maj (Red/missing items only)

Use Claude Code's `AskUserQuestion` tool to interview Maj about:

1. **Items with no Slack signal** - ask what the latest status is
2. **Items that are Red RAG** - ask if the priority/RAG is still accurate
3. **Any new items** - ask if there are new issues to add to the tracker

Interview rules:
- Only ask about Red or missing items (don't ask about everything)
- Batch questions efficiently (4 at a time max per AskUserQuestion call)
- Include the current status text so Maj has context
- After interview, update the Excel file with Maj's answers
- Also ask: "Do we need any new rows added to the tracker?"

---

## Step 5 - Send the Monday Briefing DM

Send a DM to Maj's self-DM channel (`D07AKFZPGCB`) using `slack_send_message`.

### Message structure

**Header message** (sent first, acts as thread title):
```
Weekly overview :thread:
```

**Then send each section as a reply in the thread** (use `thread_ts` from the header message):

---

#### Section 1: Unresponded comms (NEW)

Surface unanswered emails, Teams messages, and Slack DMs from key people:

```
*Unanswered comms*

*Email*
- [Person] - [subject] - [date] [urgency if high]
- ...

*Teams DMs*
- [Person] - [topic] - [date]
- ...

*Slack DMs*
- [Person] - [topic] - [date]
- ...
```

Only include people where a response seems expected. Skip informational/FYI emails.

#### Section 2: Commitments from sent mail (NEW)

Things Maj said he would do in emails/Teams over the last 14 days:

```
*Things you said you'd do*

- "[commitment text]" - to [recipient] - [date] - [status: appears done / still open / unclear]
- ...
```

Focus on concrete commitments ("I'll send the deck", "will follow up with X"). Skip vague pleasantries ("let's catch up soon").

#### Section 3: #ms-strategy weekly updates

Themed 2-minute scan. Group by person (Jon, Myron, Amber, Adam). For each:
- 2-3 bullet points of their key themes
- Flag anything relevant to MSI or needing Maj's attention

#### Section 4: #ai-noteworthy weekly updates

Themed summaries from Paul and James weekly updates:
- 2-3 key themes per person
- Flag concerns or recommendations they've raised
- Note anything that contradicts or aligns with Maj's own view

#### Section 5: #ai-council cross-cutting themes

Group all council member updates into themes, not per-person:
- Infra, hiring, evals, post-training, data, safety, tooling, RL, agentic, etc.
- Executive briefing style - what's the overall pulse of the team
- Flag any escalations or asks that need Mustafa/Maj attention

#### Section 6: Teams channels summary (NEW)

Key themes from monitored Teams channels (from Step 2d):

```
*Teams channels*

*MSFT AI Model Council*
- [Key theme/decision]
- ...

*AI Data Council*
- [Key theme/decision]
- ...

*MAI Supercomputing Weekly*
- [Key theme/update]
- ...
```

Cross-reference with Slack #ai-council and #msi-leads to avoid repeating the same info. Only include Teams-unique signal.

#### Section 7: Teams DMs summary (NEW)

Open threads and asks from monitored Teams DMs (from Step 2e):

```
*Teams DMs - open threads*

- [Person] - [topic/ask] - [date]
- ...
```

Only include items that need action or response. Skip informational exchanges.

#### Section 8: #hiring-ai-leadership

- Flag any asks specifically of Maj
- If there are blockers needing Maj's input, call them out clearly
- Keep very brief - only surface what needs action

#### Section 9: Compute allocation flags

Summary of open compute-related threads where Maj has been tagged or involved:

- Group by cluster/resource (Condor, Falcon, Mango, DFW, etc.)
- For each open thread: who is asking, what they need, whether Maj has responded
- Flag any unresolved requests that need a decision or response this week
- Include any quota change requests from #ai-cluster-util
- Note any allocation disputes or competing asks between teams
- Keep this punchy - just the open items and what's needed from Maj

#### Section 10: MSI Issue Tracker - priority items by DRI

Group high and medium priority items by Strat DRI:

**Maj's plate** (high priority):
- List each item with current RAG and status
- Bold any that are Red
- Flag which ones Maj should push forward this week

**James's plate** (high priority):
- Same format
- Flag anything James did not cover in his weekly update

**Paul's plate** (high priority):
- Same format
- Flag anything Paul did not cover in his weekly update

#### Section 11: Gap analysis

Explicitly call out tracker items that were NOT mentioned in weekly updates:
- "Paul did not mention: [list of tracker items on his plate with no weekly update signal]"
- "James did not mention: [list]"
- This helps Maj know what to chase

#### Section 12: MSI leads meeting prep

- Open threads from #msi-leads that need decisions
- Topics Mustafa has raised in DMs (Slack AND Teams) that should be on the agenda
- Suggested priority order for discussion

#### Section 13: Maj's action list for this week

Numbered list of concrete actions Maj should take this week, pulled from:
- Open asks from Mustafa in DMs (Slack AND Teams)
- Unanswered emails/Teams messages from key people (from Section 1)
- Unfulfilled commitments from sent mail (from Section 2)
- Red items on the tracker that are on Maj's plate
- Things the hiring team needs from Maj
- Follow-ups from #msi-leads threads
- Anything from Karen DMs needing action (Slack AND Teams)
- Open Teams DM threads needing response (from Section 7)
- Unresolved compute allocation requests where Maj has been tagged

Format: numbered list, each item is a specific action with a person and/or deadline where possible.

---

## Step 6 - Chain into /chase

After the Monday briefing DM is posted, automatically run the action-chaser skill:

1. Read `5. Automations/skills/action-chaser/SKILL.md`
2. Run the full chase workflow (read actions.json, categorize, draft chase messages, post status to self-DM)
3. This adds an "Action tracker update :thread:" thread to the self-DM alongside the "Weekly overview :thread:" thread
4. Do NOT ask for confirmation - just chain directly

---

### Writing style

Follow Maj's Slack style from `../../2. Writing/CLAUDE.md`:
- Confident, advisory, not deferential
- Tight bullets, no flowing prose
- Specific - names, dates, meeting references
- Abbreviated where natural ("probs", "Mon/Tue", "re", "btw")
- No emojis except :thread: on the header
- Bold section headers
- Bullet points (not dashes) for lists
- No intro or sign-off

---

## Sending Slack Messages

Use the `slack_send_message` MCP tool:

1. **Header**: Send to channel `D07AKFZPGCB` with text `Weekly overview :thread:`
2. **Each section**: Send as a reply using the `thread_ts` from the header message
3. Send sections as separate reply messages (not one giant message) so they're scannable
4. If any section is empty (e.g., no #hiring-ai-leadership asks), skip it rather than sending "nothing to report"

---

## Edge Cases

- **Missing weekly updates**: If Paul, James, or others haven't posted their weekly update yet (common if running early Monday), note this in the briefing and flag that Maj should check back later
- **Enterprise Slack API restrictions**: The `conversations.list` API is restricted. Use `search_messages` and direct `conversations_history` with known channel IDs instead
- **Excel file locked**: If the Excel file is open in another application and can't be saved, alert Maj and save to a temp file instead
- **DM send failures**: If `slack_send_message` fails (permissions), fall back to displaying the briefing in the terminal for copy-paste
- **Large channels**: Use `limit` parameter and date filtering to avoid pulling too much history. Focus on the last 7 days only for the primary scan
- **Work IQ unavailable**: If Work IQ queries fail, proceed with Slack-only data. Note in the briefing: "Email/Teams context unavailable this week - Slack only"
- **Duplicate info across Slack and Teams**: When the same topic appears in both Slack and a Teams channel, mention it once and note the cross-reference. Don't double-count
- **No sent email commitments found**: Skip Section 2 rather than posting an empty section

---

## File Paths

| Source | Path |
|--------|------|
| Issue tracker | `C:\Users\majidmohamed\Microsoft\Microsoft AI-TA - Documents\12. AI Team\MSI ISSUE TRACKER v2.xlsx` |
| Python executable | `C:\Users\majidmohamed\AppData\Local\Python\bin\python.exe` |
| Slack style guide | `../../2. Writing/CLAUDE.md` |
| Automations config | `../../5. Automations/CLAUDE.md` |

---

## Dependencies

- **Slack MCP**: Required for reading channels and sending DMs
- **Work IQ MCP**: Required for email, Teams, calendar, and transcript queries
- **Python + openpyxl**: Required for reading/writing the Excel tracker
- **AskUserQuestion**: Required for the Step 4 interview
