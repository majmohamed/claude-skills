# Skill: Maj Weekly Update

Drafts and posts Maj Mohamed's weekly update to the MSI leadership team. Each topic is a separate Slack reply in a thread. Follows Maj's established weekly update style precisely.

**Slash command**: `/weeklyupdate`

**Replaces**: `weekly-update-maj`

---

## Workflow

### Step 1 - Determine the week

- Get today's date and calculate the current Monday-to-Friday window
- All date filtering below uses this window
- File names use `YYMMDD` format (e.g., `260210` = 10 Feb 2026) - match against the current week's dates
- The output file uses `DD Month YYYY` format (e.g., `08 March 2026`)

### Step 2 - Gather context

Read all of the following in parallel. Be thorough - the quality of the update depends on complete data collection.

**Meeting notes**
- Read ALL files from the current week across every subfolder in `../../1. MeetingNotes/MeetingNotes/`
- Subfolders include: `1-1s`, `Ad hoc`, `AI Council + SPR`, `Humanist AI`, `Infra - SCW, Maia, Apollo, SLT`, `MSI leads`, `MSI team updates`, `Mustafa syncs`, `SLT Models`, `Technical teach ins`
- Match files by `YYMMDD` prefix falling within the current Mon-Fri window
- Also check for files with written-out date formats
- For each note, extract: key topics discussed, decisions made, actions assigned to Maj, actions assigned to others, any risks or concerns raised

**Action tracker**
- Read `../../5. Automations/data/actions.json`
- Pull all actions where `type` = `"for_maj"` and `status` = `"open"` or `"in_progress"` - these feed priorities and worry list
- Pull all actions where `type` = `"for_maj"` and `status` = `"done"` and `completed_at` falls in the current week - these feed "what I worked on"
- Pull all actions where `type` = `"for_others"` and `status` = `"open"` and `due_date` is past - these are overdue items for others, feed the worry list
- Pull any high-priority actions regardless of owner

**Ad hoc work**
- Scan `../../3. Adhoc/` for any files created or modified this week
- Look inside subfolders too
- Extract what deliverables were produced and for whom

**Writing style guide**
- Read `../../2. Writing/Maj weekly updates/Weekly Update Style Guide.md`
- This is the comprehensive style reference - follow it precisely

**Golden example (MUST READ)**
- The golden example is embedded at the bottom of the Style Guide (`../../2. Writing/Maj weekly updates/Weekly Update Style Guide.md`)
- This is the canonical format. Every draft MUST look and feel exactly like it
- Match the structure: opening mood-setter, domain separator headings with numbered emojis, topic sections with RAG at end of header, Week Ahead Priorities, Personal/Highlights
- Match the voice: conversational, punchy, 2-4 bullets per section, natural headers, Maj's abbreviations and gut feel

**Slack - Maj's sent messages and note-to-self DM (HIGH SIGNAL)**
- This is a critical source of topics. Maj often tracks what he's worked on through his Slack activity.
- **Note-to-self DM (D07AKFZPGCB)**: Check for a thread with heading "weekly update w/c [date]" for the current week. If found, this contains Maj's rough top-of-mind topics and should be treated as the primary outline for the update. Pull all content from that thread.
- **Sent messages**: Search Slack for messages sent by Maj (from:@Majid) in the current week. Look across key channels:
    - #ai-noteworthy (C098VHM0560)
    - #ms-strategy-cmm (C08RG06T0F9)
    - #msi-leads
    - #ai-council
    - #ai-datacentres / #hpc-squad
    - Any other channels where Maj has posted substantive updates or replied to threads
- Extract topics, decisions communicated, items pushed forward, concerns raised
- These Slack messages are the richest source of "what I actually worked on this week" - prioritize them

**Emails and Teams messages (via Work IQ - HIGH SIGNAL)**
- Query Work IQ for email and Teams context from the current week. These supplement Slack as sources of "what Maj actually worked on."
- **Sent emails**: Query: "What emails did I send this week? Summarize the key topics, decisions, and commitments I made."
  - Extract: topics communicated, decisions shared, items pushed forward, commitments made
- **Received emails (key people)**: Query: "What important emails did I receive this week from Mustafa Suleyman, Karen Simonyan, Kevin Scott, Eric Boyd, and other senior leaders?"
  - Extract: asks of Maj, strategic context, escalations
- **Teams channels**: Query Work IQ for recent activity in monitored Teams channels:
  - MSFT AI Model Council - decisions, strategic direction
  - AI Data Council - data strategy updates
  - MAI Supercomputing Weekly - infra status, capacity
- **Teams DMs**: Query for substantive exchanges with: Kutta Srinivasan, Rolf Harms, Michael Yamartino, Bonita Armstrong, Eric Boyd, Mat McBride, Roy Vincent, Venkat PA
  - Extract: topics discussed, decisions, commitments
- **Meeting transcripts**: Query: "Summarize the key discussions and decisions from my meeting transcripts this week"
  - This catches meetings where Maj didn't take manual notes but still discussed important topics
- Combine email/Teams context with Slack activity to build the fullest picture of the week

**Past updates for reference**
- Read `../../2. Writing/Maj weekly updates/Weekly Update Archive.md`
- Use the most recent 2-3 updates as reference for tone, format and topic selection
- Do NOT copy content - use for calibration only

**MSI Issue Tracker (for Week Ahead Priorities)**
- Read `C:\Users\majidmohamed\Microsoft\Microsoft AI-TA - Documents\12. AI Team\MSI ISSUE TRACKER v2.xlsx`
- Surface any RED or high-priority items that should inform Maj's Week Ahead Priorities
- Flag items that haven't been updated recently or need attention
- This helps ground the "Week Ahead" section in the actual tracked issues rather than just what came up in meetings

### Step 3 - Interview Maj for top-of-mind items

After gathering all source data, use AskUserQuestion to interview Maj on anything else that should go in the update. The interview should:

- Summarize what you found from the sources ("I've got context on X, Y, Z from this week's notes and Slack")
- Ask what else is top of mind that isn't captured in the source files
- Ask which domain feels hottest this week (to lead with)
- Ask about any people shout-outs, personal items, or OOO notices
- Use structured AskUserQuestion format with options where possible, not prose questions

This interview fills gaps - Maj's Slack activity and meeting notes capture 70-80% of what matters, but there's always context that only exists in his head.

### Step 4 - Draft the update as a markdown file

Structure the update as SEPARATE SECTIONS, each representing a separate Slack reply message.

**Domain-grouped structure:**

The update follows a domain-grouped format. The ONLY change from the existing update style is:
1. A **separator message** (its own thread reply) with a numbered emoji (:one:, :two:, :three: etc.) and domain name is inserted before each group of related topics
2. Topics are reordered so related items sit together under their domain
3. The domain with the hottest content that week goes first

**CRITICAL: The domain separators are the ONLY structural addition. Each topic section is written EXACTLY the same way Maj already writes them - same headers, same bullet style, same length, same voice. Do NOT change how individual sections are written. The RAG emoji goes at the END of the section header (e.g., "OMAI SLT Presentation :large_green_circle:"), not at the start.**

**Golden example: embedded at the bottom of the Style Guide (see Step 2 sources)**
Read it before drafting every time. The output should look and feel exactly like it.

**Standing domains:**

| Domain | Typical topics |
|--------|---------------|
| Compute & Infra: Training Compute & Allocation | GPU swaps, cluster utilization, allocation decisions, Weizhu requests |
| Compute & Infra: Datacenter & POR | Nebius, site readiness, Maia, long-term capacity, POR changes |
| Models & Research | Pre-training runs, post-training, releases, evals, competitive positioning |
| Org & People | Team build/hiring, org health, performance flags, people intel, retention |
| Data & Partnerships | 1P data, scraping, Apple/GitHub/YouTube, Data Council strategy |
| Satya / SLT Interface | Satya weekly digest, SLT presentations, exec interface work |
| Strategic Papers & Memos | Papers in progress, key written outputs, memo status |

**Standing closing sections (not domain-grouped):**
- **Week Ahead Priorities** - numbered 1-5 list of focus areas for the coming week. Always include
- **Worry List** - 2-4 bullets of strategic worries/risks. Include ad hoc when genuine, don't manufacture
- **Personal / Highlights** - OOO, travel, team wins, personal notes. Always include if there's anything to say

**File format:**

```markdown
# Maj Weekly Update - [DD Month YYYY]

## Header Message
Maj weekly update :thread:

---

## Opening
[One sentence mood-setter: "Good week overall", "Pretty messy week", "Quieter week, mostly writing"]

---

## :one: [Hottest Domain Name]

---

## Topic 1 Header [RAG emoji]
- Bullet point content
- More content
    - Sub-bullet with detail

---

## Topic 2 Header [RAG emoji]
- Bullet point content

---

## :two: [Second Domain Name]

---

## Topic 3 Header [RAG emoji]
- Bullet point content

---

[...more domains and topics...]

---

## Week Ahead Priorities
1. Priority one
2. Priority two
3. Priority three

---

## Personal / Highlights
- Personal items, OOO, team wins
```

**Content requirements - must include at minimum:**
- At least 2 domain groups with separator headings
- RAG emoji at the end of every topic section header (except Personal/Highlights and Week Ahead)
- Week Ahead Priorities (numbered list)
- Personal / Highlights (if anything to say)
- Opening mood-setter line

**Style rules (from the Style Guide):**
- Confident advisory tone - not deferential
- Candid about people and org dynamics - name individuals
- Specific with dates, meetings, links, numbers
- Abbreviated where natural: "probs", "btw", "fyi", "atm", "imo", "tbh", "wdyt", "lmk"
- Use `•` (bullet character) for all list items when posting to Slack, NOT `-` or `*` for bullets. Slack renders `•` as proper bullet points
- Bold headers with asterisks: `*Topic Name*`
- Backticks used very sparingly or not at all - plain text is fine for calls to action
- :arrow-right: for action items directed at Mustafa. MUST use Slack user ID format `<@U06US8T3CQG>` to trigger a real @mention - plain text "@Mustafa Suleyman" does NOT trigger a notification
- RAG emojis REQUIRED on every topic section header (:red_circle: :large_orange_circle: :large_green_circle:) - except Personal/Highlights and Week Ahead Priorities
- No flowing prose, no corporate speak, no em dashes
- No greeting or sign-off
- Each topic is self-contained as a separate reply

**CRITICAL - Keep sections short (learned from Mar 2026 edit sessions):**
- 2-4 bullets per section MAX. Claude consistently over-writes at 5-6+. Cut ruthlessly
- State the "so what" and the next action, not the background or how things work. The audience knows the domain
- Include Maj's personal voice: gut feel, political reads, honest hedges, shout-outs to people who did good work
- Add direct :arrow-right: asks to Mustafa using `<@U06US8T3CQG>` (his Slack user ID) where Maj needs a response. Plain text @mentions do NOT trigger notifications. BUT: don't over-use :arrow-right: - only when you genuinely need Mustafa to do something. Informational sections should end with status, not a manufactured ask
- Section headers should be natural and conversational, not formal/corporate (e.g. "Eric Boyd / capacity stuff" not "Compute Infrastructure Governance")
- Short 1-2 bullet sections about people are totally valid (e.g. just "James - will look for time so you can meet him")
- Do NOT manufacture standard sections (Priorities, Worry List, Hiring) if there's nothing substantial to say. Only include what earns its place
- Credit people who did good work: "X did a great job", "shoutout Y for..."
- If a topic can be covered in a sentence within the opening or folded into a related section, don't give it its own section
- Don't recap meetings the audience was in - they were there. State what you want them to know or do
- When something is stuck/frustrating, say so directly ("still going back and forth which is frustrating") instead of framing it as a technical question
- Opening should feel like catching up with a friend: use "lol", "haha", parenthetical asides, genuine reactions. Personal life in brackets when secondary
- Hiring sections: focus on pipeline quality and personal colour, not process complaints
- Week Ahead Priorities: bare items only, no explanations - the body provides context
- Section name: "Personal" not "Personal / Highlights"
- When sharing information without an ask, add "No action for now, just sharing for awareness" to calibrate expectations

**Mark uncertain items with `[TODO: ...]`**

Save draft to: `../../2. Writing/Maj weekly updates/[DD Month YYYY] DRAFT.md`

### Step 5 - Present for review

- Show the full draft to Maj
- Mark any items where Claude was uncertain or couldn't find supporting data with `[TODO: ...]`
- Flag if any key data sources were missing (e.g., no meeting notes found for the week, empty action tracker)
- Ask Maj to review, edit, and approve
- Iterate as needed

### Step 6 - Confirm and post to Slack

After Maj approves (or edits and approves), use AskUserQuestion to confirm:

1. **Which channel to post on**
   - Default: #ai-noteworthy (C098VHM0560)
   - Never a different channel without confirming first - THIS IS ABSOLUTELY CRITICAL. Posting in the wrong channel would be a major breach of trust. Always confirm with Maj before posting.

2. **Whether to proceed with posting**

Once confirmed:

1. **Send the header message** to the confirmed channel:
   - Text: `Maj weekly update :thread:`
   - Capture the `thread_ts` from the response

2. **Send the opening mood-setter** as the first reply in the thread

3. **Send domain separators and topic sections as SEPARATE REPLIES** in the thread:
   - **Domain separator messages**: Each domain group starts with its own reply message containing just the numbered emoji and domain name (e.g., `:one: Compute & Infra`, `:two: Org & People`). These are visual dividers
   - **Topic sections**: Each topic within a domain is a separate reply after its domain separator
   - Use `thread_ts` from the header message for all replies
   - Each reply = one topic section from the draft
   - **Formatting for Slack replies:**
     - Header line: `*Topic Name*` (bold using single asterisks) - Slack does not support underline
     - Use `•` (bullet character U+2022) for all list items, NOT `-` or markdown `*`
     - Use `◦` or indentation with `•` for sub-bullets
     - For @mentions: use `<@USER_ID>` format (e.g. `<@U06US8T3CQG>` for Mustafa). Plain text @mentions do NOT trigger notifications
     - Preserve emojis, links, backticks where used
   - Send in order from top to bottom of the draft
   - Wait briefly between messages to maintain ordering

3. **Confirm posting is complete** and share the permalink to the thread

### Step 7 - Save final version

After posting:
- Remove the "DRAFT" suffix from the file name
- Save the final posted version to: `../../2. Writing/Maj weekly updates/[DD Month YYYY].md`
- Confirm file saved and provide the path
- Append the update content to the Weekly Update Archive file at `../../2. Writing/Maj weekly updates/Weekly Update Archive.md` following the archive format (newest first, with date header and channel note)

### Step 8 - Chain into /compute

After the weekly update is posted and saved, automatically run the compute-tracker skill to refresh the compute ledger for next week:

1. Read `5. Automations/skills/compute-tracker/SKILL.md`
2. Run the full compute workflow (read #ai-cluster-util, update ledger, post summary to self-DM)
3. Do NOT ask for confirmation - just chain directly

---

## File Paths (relative to this skill's location)

| Source | Path |
|--------|------|
| Meeting notes | `../../1. MeetingNotes/MeetingNotes/` (all subfolders) |
| Action tracker | `../../5. Automations/data/actions.json` |
| Style guide | `../../2. Writing/Maj weekly updates/Weekly Update Style Guide.md` |
| General Slack style | `../../2. Writing/CLAUDE.md` (Maj's Slack voice - Weekly Update Style Guide takes precedence for this skill) |
| Archive of past updates | `../../2. Writing/Maj weekly updates/Weekly Update Archive.md` |
| Ad hoc work | `../../3. Adhoc/` |
| Output folder | `../../2. Writing/Maj weekly updates/` |
| Maj note-to-self DM | D07AKFZPGCB (search for "weekly update w/c" threads) |
| Maj sent messages | Search from:@Majid across key channels |
| MSI Issue Tracker | `C:\Users\majidmohamed\Microsoft\Microsoft AI-TA - Documents\12. AI Team\MSI ISSUE TRACKER v2.xlsx` |
| Default Slack channel | #ai-noteworthy (C098VHM0560) |

**Key Slack User IDs (for @mentions that trigger notifications):**

| Person | Slack ID | Usage in messages |
|--------|----------|-------------------|
| Mustafa Suleyman | U06US8T3CQG | `<@U06US8T3CQG>` |
| Paul Soulos | U094XBL8U0G | `<@U094XBL8U0G>` |
| James Cerra | U0AGP746ENT | `<@U0AGP746ENT>` |
| Chris Daly | U075KNETM7F | `<@U075KNETM7F>` |
| Maj (self) | U07AD0R06R4 | `<@U07AD0R06R4>` |

---

## Edge Cases

- **No meeting notes found for the week**: Flag this to Maj. Ask if notes haven't been captured yet or if it was a light week. Still draft from whatever data is available (action tracker, ad hoc work).
- **Empty action tracker**: Note this in the draft. Focus the update on meeting notes and ad hoc work.
- **Mid-week run**: If invoked before Friday, note that the week isn't complete and the update may need additions.
- **Multiple notes per day**: Read all of them. A busy day = more content, not a reason to skip files.
- **Files without date prefixes**: Read them if they appear to be from the current week based on content or modification date. Flag uncertainty.
- **OOO weeks**: If Maj is OOO for part of the week, note this in the update and adjust content accordingly. Past updates show OOO notices are common and handled naturally.
- **Slack posting failure**: If any individual reply fails to post, retry once. If still failing, save the remaining content and alert Maj to post manually.
- **Archive file missing**: If the archive file doesn't exist yet, create it with the standard header before appending.
- **Very light week**: If there genuinely isn't much to report, keep the update short. Past updates range from 5 to 14 topic replies - there's no minimum. Don't pad with filler.

---

## Differences from Old `weekly-update-maj` Skill

| Aspect | Old skill | This skill |
|--------|-----------|------------|
| Output format | Single markdown doc with 3 sections | Multiple separate sections (one per Slack reply) |
| Style reference | General Slack style from Writing CLAUDE.md | Dedicated Weekly Update Style Guide |
| Posting | Manual copy-paste | Direct Slack posting via MCP |
| Archive | None | Appends to Weekly Update Archive |
| Past reference | None | Reads archive for calibration |
| Sections | Fixed 3 (worked on / priorities / worry list) | Flexible topic-based (matches actual update style) |
| Channel | Not specified | Defaults to #ai-noteworthy |
