# Skill: Competitive Intel Tracker

Pulls competitor signals from Slack channels and web search, maintains a running markdown file with a TABLE PER COMPANY. Focus is models and infrastructure ONLY - not product, org, or enterprise deals.

**Slash command**: `/intel`

---

### Date & Timestamp Accuracy

CRITICAL: All date-based filtering depends on the current date provided in the system context (e.g., "Today's date is YYYY-MM-DD").

**Unix timestamp calculation:**
- Reference point: 2026-01-01 00:00:00 UTC = 1767225600
- Add 86400 per day from there
- For a 14-day lookback: subtract 1209600 from today's timestamp

**Validation (MANDATORY):**
- After retrieving Slack messages, check the dates of the returned messages
- If ALL returned messages are older than your target window, your timestamp was calculated incorrectly - recalculate and retry
- Confirm the most recent message is from the current month/year. If you see content from a prior year (e.g., 2025 when it should be 2026), STOP and recalculate
- For `slack_search_messages`, always include `after:YYYY-MM-DD` using the calculated start date
- For web searches, always use the current year from the system context (do NOT hardcode a year like "2026") - construct the year dynamically

---

## Companies Tracked

1. **OpenAI** - GPT models, o-series, reasoning, infrastructure scale
2. **Anthropic** - Claude models, safety research, training approaches
3. **Google DeepMind** - Gemini models, TPU infrastructure, research

---

## Focus Areas (models & infra ONLY)

Track:
- Model releases, benchmarks, capabilities
- Training infrastructure, compute scale, data strategies
- Research publications and technical breakthroughs
- Architecture innovations

Do NOT track:
- Org moves, leadership changes, hiring
- Product launches, features, pricing
- Enterprise deals, partnerships, revenue
- Marketing, branding, go-to-market

---

## Workflow

### Step 1 - Load existing tracker

- Read `../../5. Automations/data/competitive-intel.md`
- If the file doesn't exist yet, initialize it with the template from the Output Format section below
- Parse existing tables to understand current state - what's already tracked, what dates are on each row

### Step 2 - Pull Slack signals

Search the following channels for competitor mentions in the last 14 days (or the time window specified by Maj):

| Channel | ID | What to look for |
|---------|----|------------------|
| #msi-leads | C0A3NQWQ6H4 | Model benchmarks, competitive positioning, infra intel |
| #ai-council | C08S37VTJM8 | Research updates, model comparisons, technical discussions |
| #ms-strategy | C08128P9480 | Strategic competitive analysis, market moves |

For each channel:
1. Use `slack_conversations_history` with `oldest` set to 14 days ago (calculate Unix timestamp)
2. Pull up to 100 messages
3. Scan for mentions of: OpenAI, GPT, o1, o3, o4, Anthropic, Claude, DeepMind, Gemini, TPU, Trillium
4. For relevant messages, use `slack_get_thread` to pull full thread context
5. Extract: what model/infra, what's new, any numbers/benchmarks, source attribution

Also search via `slack_search_messages` for recent competitor mentions:
- Query: `OpenAI OR GPT OR "o3" OR "o4" after:YYYY-MM-DD` (14 days ago)
- Query: `Anthropic OR Claude after:YYYY-MM-DD`
- Query: `DeepMind OR Gemini OR TPU after:YYYY-MM-DD`

### Step 3 - Web search for breaking news

Run web searches for each tracked company:
- `OpenAI model release [CURRENT_YEAR]` / `OpenAI infrastructure compute [CURRENT_YEAR]` (use the current year from system context, e.g., if "Today's date is 2026-04-26" then use "2026")
- `Anthropic Claude model [CURRENT_YEAR]` / `Anthropic training infrastructure [CURRENT_YEAR]`
- `Google DeepMind Gemini model [CURRENT_YEAR]` / `Google TPU infrastructure [CURRENT_YEAR]`

Focus on:
- New model announcements or benchmark results
- Infrastructure/compute scale updates
- Research papers with significant results
- Architecture changes or new training approaches

### Step 4 - One-time backfill (first run only)

On the FIRST run (when `competitive-intel.md` doesn't exist or is empty):
- Scan `../../2. Writing/Maj weekly updates/archive/` for historical competitor mentions
- Also check `../../2. Writing/Maj weekly updates/Weekly Update Archive.md`
- Extract any model names, compute figures, or infra details mentioned in past updates
- Use these to seed the initial tracker tables
- Mark source as "Weekly update archive" for backfilled entries

Skip this step on subsequent runs (when the tracker already has content).

### Step 5 - Merge intel into tracker

For each new signal found:

1. **Identify the company** - which table does this belong in?
2. **Identify the category** - is this about Team, Token mix, a specific Model, or Compute?
3. **Check for existing row** - does a row for this category/model already exist?
   - **If yes**: UPDATE the existing row's Detail, Last updated, and Source columns
   - **If no**: ADD a new row to the appropriate table
4. **Apply filtering** - skip anything that's product, org, deals, or hiring (see Focus Areas above)
5. **Deduplicate** - if the same signal appears in multiple sources, keep the most detailed version and note all sources
6. **Keep Detail concise** - 1-2 sentences max per cell

### Step 6 - Write updated tracker

- Write the updated file to `../../5. Automations/data/competitive-intel.md`
- Update the `Last updated` date at the top of the file
- Preserve existing rows that weren't updated (don't remove data)

### Step 7 - Present summary to Maj

After updating the tracker, present a brief summary:
- How many rows were updated vs. added
- Top 3-5 most significant new signals (1 sentence each)
- Any gaps flagged (e.g., "No recent Anthropic infra intel - may want to dig deeper")
- Link to the saved file

---

## Output Format

The tracker uses a TABLE PER COMPANY structure. NOT date-structured - structured by category/model.

```markdown
# Competitive Intel - Models & Infrastructure

Last updated: [YYYY-MM-DD]

---

## OpenAI

| Category | Detail | Last updated | Source |
|----------|--------|-------------|--------|
| **Team** | [Size, key leaders, research org structure] | [date] | [source] |
| **Token mix** | [Training data strategy, known data sources] | [date] | [source] |
| **[Model name]** | [Capabilities, benchmarks, timeline, compute needs] | [date] | [source] |
| **Compute ([type])** | [Infra details, scale, partnerships] | [date] | [source] |

---

## Anthropic

| Category | Detail | Last updated | Source |
|----------|--------|-------------|--------|
| **Team** | [Size, key leaders, research focus] | [date] | [source] |
| **Token mix** | [Training approach, data strategy] | [date] | [source] |
| **[Model name]** | [Capabilities, context window, benchmarks] | [date] | [source] |
| **Compute ([type])** | [Cloud partnerships, scale] | [date] | [source] |

---

## Google DeepMind

| Category | Detail | Last updated | Source |
|----------|--------|-------------|--------|
| **Team** | [Size, key leaders, org structure] | [date] | [source] |
| **Token mix** | [Training data, unique data advantages] | [date] | [source] |
| **[Model name]** | [Capabilities, multimodal, context, benchmarks] | [date] | [source] |
| **Compute ([type])** | [TPU details, custom silicon, scale] | [date] | [source] |
```

### Row types

Each row in a company table is one of:
- **Team** - headcount, key leaders, research org structure (one row per company)
- **Token mix** - training data strategy and known data sources (one row per company)
- **[Model name]** - one row per known model (e.g., GPT-5.2, o3, Claude 3.5 Sonnet, Gemini 2.0)
- **Compute ([type])** - one row per compute/infra type (e.g., "Compute (Azure)", "Compute (own)", "Compute (TPU v5)")

### Key rules for the table

- When new intel comes in, UPDATE the existing row rather than adding a duplicate
- New models get new rows added to the table
- "Last updated" column shows when that specific row was last refreshed
- Source column references either the Slack channel name (e.g., #ai-council), "Web", "SCW notes", or "Weekly update archive"
- Detail column is 1-2 sentences max - concise and specific
- No emdashes - only hyphens

---

## Data Sources

### Slack channels (via MCP)

| Channel | ID | Signal type |
|---------|----|-------------|
| #msi-leads | C0A3NQWQ6H4 | Model benchmarks, competitive positioning, infra intel |
| #ai-council | C08S37VTJM8 | Research updates, model comparisons |
| #ms-strategy | C08128P9480 | Strategic competitive analysis |

### Web search
- Breaking news on model releases, benchmark results, infrastructure announcements
- Research paper announcements (arXiv, blog posts)
- Investor/analyst reports on compute scale

### One-time backfill
- `2. Writing/Maj weekly updates/archive/` - historical competitor mentions from Maj's updates
- `2. Writing/Maj weekly updates/Weekly Update Archive.md` - same, if archive file exists

---

## File Paths (relative to this skill's location)

| Source | Path |
|--------|------|
| Tracker output | `../../5. Automations/data/competitive-intel.md` |
| Weekly update archive | `../../2. Writing/Maj weekly updates/Weekly Update Archive.md` |
| Weekly update folder | `../../2. Writing/Maj weekly updates/archive/` |

---

## Edge Cases

- **No new signals found**: Tell Maj there's nothing new in the last 14 days. Don't modify the tracker
- **Conflicting signals**: Note the conflict in the Detail cell (e.g., "Reports vary - X says 95%, Y says 92%"). Use the most recent or most credible source
- **Rumor vs. confirmed**: Prefix rumors with "Rumored:" in the Detail cell. Update to confirmed when validated
- **Can't read a Slack channel**: Flag the permissions issue to Maj. Continue with other sources
- **First run with no archive**: Start with web search data only. The tracker will build over time
- **Model renamed or merged**: Update the existing row and note the rename (e.g., "Previously codenamed Yosemite")
- **Stale rows**: Don't delete old rows. If a model is deprecated/superseded, note it in the Detail cell
- **User specifies a single company**: Only search and update that company's table. Leave others untouched
