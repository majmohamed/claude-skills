# Skill: Turbo Compute Governance

Manages turbo (surge) compute allocations on a sprint-by-sprint basis. Tracks allocations, prepares review briefs, drafts DRI solicitation messages, and posts Slack-native summaries with RAG traffic lights to the Compute Council channel.

**Slash command**: `/turbo`

---

## Key files

| File | Path | Purpose |
|---|---|---|
| Cycle tracker | `3. Strategy/Compute allocations/Turbo compute tracking/C2-turbo-tracker.md` | Active cycle tracker (current: C2) |
| PRD | `3. Strategy/Compute allocations/Turbo compute tracking/PRD - Turbo Compute Governance.md` | Full system design |
| Solicitation template | `3. Strategy/Compute allocations/Turbo compute tracking/templates/solicitation-template.md` | "Leads are considering you for turbo" message to DRIs |
| Turbo summary template | `3. Strategy/Compute allocations/Turbo compute tracking/templates/turbo-summary-template.md` | Published Slack summary of all turbo allocations |
| Review brief template | `3. Strategy/Compute allocations/Turbo compute tracking/templates/review-brief-template.md` | Pre-review data pack for Compute Council |
| Top of minds | `3. Strategy/Compute allocations/Turbo compute tracking/compute-council-top-of-minds.md` | Compute Council top of minds - max 10 bullets |
| Compute ledger | `5. Automations/data/compute-ledger.json` | Source for utilization data (auto-pulled) |

---

## Slack channels - HARDCODED

**IMPORTANT**: Always use these exact channel IDs. Never look up or search for these channels.

| Channel | ID | URL | Purpose |
|---|---|---|---|
| **Compute Council group** | **C0AS2SE4F0F** | https://microsoft-ai.enterprise.slack.com/archives/C0AS2SE4F0F | Published turbo allocations summary, review RAG updates, top of minds |
| Maj self-DM | D07AKFZPGCB | - | Draft messages for Maj to review before sending, review brief prep |
| #ai-cluster-util | C08DN2YG5LH | - | Source for utilization data (read only) |

---

## RAG traffic lights

All turbo Slack messages use these emojis for RAG status:

| Status | Emoji | Slack code |
|---|---|---|
| Green | :large_green_circle: | `:large_green_circle:` |
| Amber | :large_orange_circle: | `:large_orange_circle:` |
| Red | :red_circle: | `:red_circle:` |
| TBU | :white_circle: | `:white_circle:` |

---

## CRITICAL: Markdown-first, then Slack

**Every Slack message must be drafted in markdown first and shown to Maj for approval before posting.**

The workflow for ANY Slack posting in this skill is:
1. Draft the message content in the cycle tracker markdown file (in a "Slack draft" section)
2. Show it to Maj in the terminal
3. Wait for Maj to green-light it (edit if needed)
4. Only then post to the Compute Council channel (C0AS2SE4F0F)

Never auto-post to C0AS2SE4F0F without Maj's explicit approval. The self-DM (D07AKFZPGCB) can be posted to without approval for prep/drafts.

---

## Modes

The `/turbo` command is context-aware. Determine intent from arguments or ask Maj:

### 1. Status (`/turbo` or `/turbo status`)

Show current sprint turbo allocations:

1. Read the active cycle tracker markdown file
2. Display the current sprint table in terminal, formatted with RAG emojis
3. If utilization data is available in the compute ledger, cross-reference and show current utilization per turbo allocation
4. Flag any allocations where RAG is still :white_circle: TBU (needs updating)

### 2. Allocate (`/turbo allocate`)

Set up new turbo allocations for the next sprint:

1. Read the active cycle tracker to see current state
2. Interview Maj using AskUserQuestion:
   - How many allocations this sprint? (typically 2-4)
   - For each: Squad, DRI, cluster, GPU count (native + H100e)
3. Read the solicitation template at `templates/solicitation-template.md`
4. For each allocation, draft a personalised solicitation message in Maj's Slack voice (Register 2 - operational/working, lowercase, no bolding, no sign-off)
   - Say "leads are considering allocating turbo compute to your squad" (not the squad name)
   - Do NOT ask for a turbo mission - the squad's existing mission is implicit
   - Ask only for success criteria and utilization commitment
5. **DM ALL draft solicitation messages to Maj's self-DM (D07AKFZPGCB)**. One message per DRI, as separate Slack messages. Maj will forward them to the right DRIs himself
6. Confirm in terminal that the messages have been DM'd
7. Once Maj confirms DRIs have responded, update the cycle tracker with success criteria and new sprint table (RAG = :white_circle:)
8. Draft the turbo allocations summary Slack message (all allocations in one message) using the turbo-summary-template
9. Write the draft into the cycle tracker markdown under a "Slack draft" section
10. Show the draft to Maj and wait for green light before posting to C0AS2SE4F0F

### 3. Prep (`/turbo prep`)

Thursday pre-review preparation:

1. Read the active cycle tracker for current allocations
2. Read compute-ledger.json for latest utilization data
3. Pull recent messages from #ai-cluster-util (last 14 days) via Slack MCP for any utilization data relevant to turbo clusters
4. Read the review brief template
5. Generate a review brief with:
   - Auto-populated utilization numbers per turbo allocation
   - Current success criteria from the tracker
   - Proposed RAG status based on utilization data (Maj will override in the review)
   - RAG traffic light emojis throughout
6. Draft DRI check-in messages: "Sprint ends Friday - please reply with a brief update on your turbo success criteria: what did you deliver, what's the status?"
7. **Update the Compute Council top of minds:**
   - Read `compute-council-top-of-minds.md`
   - Pull recent messages from #ai-cluster-util, #msi-leads, and the compute ledger for any new developments
   - Read the Compute Council Slack channel (C0AS2SE4F0F) for any recent threads, discussions, or context shared since the last update
   - Interview Maj using AskUserQuestion on each of these categories:
     - Future GPU needs / moves (e.g. pre-training migration path, cluster swaps)
     - Efforts to unlock more endpoints / graders (Azure subscriptions, Jina/Core AI)
     - OMAI parallel track compute needs (Weizhu's allocation, what's being clawed back)
     - GPUs to reclaim from 1C teams or other teams (e.g. Copilot Tuning 512 GPUs)
     - Any other live compute issues
   - Update the top of minds file: add a new sprint section at the top (keep previous sprints below for history). Max 10 bullets, each max 30 words
   - Draft a Slack message of the CURRENT SPRINT top of minds only. This gets posted as its own standalone thread in the Compute Council channel (not as a reply to the turbo allocations thread)
8. Write all drafts (review brief, DRI check-in messages, top of minds) into the cycle tracker markdown
9. Show all drafts to Maj in terminal
10. Post the review brief to Maj's self-DM (D07AKFZPGCB) - no approval needed for self-DM
11. Wait for Maj's green light before posting top of minds to C0AS2SE4F0F as its own thread
12. Maj reviews and sends the DRI check-in messages himself

### 4. Review (`/turbo review`)

Post-meeting review capture:

1. Read the active cycle tracker and the latest review brief (if prep was run)
2. For each turbo allocation, interview Maj using AskUserQuestion:
   - RAG status: :large_green_circle: Green / :large_orange_circle: Amber / :red_circle: Red
   - What did they deliver? (one sentence outcome)
   - Decision: Renew / Scale up / Scale down / Reallocate / Graduate to base
   - Commentary (free text)
3. Update the cycle tracker:
   - Fill in RAG emoji, utilization, outcome, and Compute Council commentary for the current sprint
   - Update the squad turbo history table with RAG status
   - Add Compute Council notes section for this sprint
4. Draft the review results Slack message (Reply 2 in the turbo summary thread) using the turbo-summary-template
5. Write the draft into the cycle tracker markdown under a "Slack draft - review" section
6. Show the draft to Maj and wait for green light
7. Only then post the review results to C0AS2SE4F0F:
   - Find the existing turbo allocations thread for this sprint
   - Post the review results as a reply with RAG traffic lights
8. If Maj is setting up next sprint allocations, transition to Allocate mode

### 5. History (`/turbo history`)

Show turbo allocation history:

1. Read the active cycle tracker
2. Display the squad turbo history table (shows each squad's turbo allocations across the cycle with RAG status plus their base quota)
3. If Maj asks about a specific squad, show their full turbo timeline with RAG outcomes

---

## GPU unit rules

- **Primary column**: native GPU type for the cluster (GB200 for Falcon, H100 for Condor)
- **Secondary column**: H100-equivalent (H100e) for cross-cluster comparison
- Conversion: 1 GB200 = 2 H100e

---

## Style rules

- No emdashes - only hyphens
- Use `*bold*` for section headers in Slack messages
- RAG traffic light emojis on every allocation line in Slack
- Keep language direct, specific, numbers-first
- No corporate language ("leverage", "unlock value", "paradigm shift")
- No "it's not X, it's Y" contrasting positive pattern
- Karen is always spelt Karen (with accent on the e). He is a man
- Solicitation messages say "leads" not "the Compute Council" - keeps it less formal

---

## Sprint cadence

| Day | Activity |
|---|---|
| Thursday (sprint end week) | `/turbo prep` - review brief, DRI check-ins, top of minds update |
| Friday (sprint end) | Compute Council review meeting (30 min). Post-meeting: `/turbo review` |
| Thursday (new sprint week) | `/turbo allocate` - next sprint allocations, solicitation messages, turbo summary |

---

## Automation hooks

This skill should eventually be wired into the automation schedule:

- **Thursday before sprint end**: Auto-run prep mode, post to Maj self-DM

For now, Maj triggers manually via `/turbo`.

---

## Presentation slides

When creating PowerPoint slides for Compute Council meetings (using the PPTX skill):

- **"Decision needed" strapline**: Any slide that requires a decision from the Council should have a small strapline at the bottom of the slide reading "Decision needed" in muted text (Khaki `#72675B`, Segoe UI, ~10pt). This makes it easy to scan through a deck and see which slides are discussion vs which need a call.
- **Maj's voice**: Keep Maj's language and tone intact on slides - don't sanitise "Maj note", "Maj recommendation", "tough response" etc. These are working docs for the Council, not polished external decks.
- **RAG colours**: When showing RAG status on slides, use the same traffic light convention: Green = met/exceeded, Amber = partial + credible path, Red = not met.
- **Actions slide**: Include a numbered list of actions/decisions needed at the top of the deck (after the title slide) so the Council knows what they need to get through.

---

## Edge cases

- **DRI doesn't respond to solicitation**: Flag to Maj after 24h. Default action: reallocate to next priority
- **No utilization data available**: Note "utilization data not available for this cluster" in the review brief. Don't guess numbers
- **Squad requests more than available**: Show Maj the total turbo pool vs requests. He decides the trade
- **Turbo allocation spans a cycle boundary**: Close out the current cycle tracker, create a new one for the next cycle, carry forward any active allocations with a note
- **Mid-sprint reallocation**: Supported but should be rare. Update the tracker with a note explaining why, and post to the Compute Council group
