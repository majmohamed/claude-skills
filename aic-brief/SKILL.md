# Skill: AIC Brief

Reads the AI Council channel (#ai-council), pulls all weekly updates from the last few days, analyzes them for key themes, and posts a high-signal summary to #ai-noteworthy.

**Slash command**: `/aicbrief`

---

## Workflow

### Step 1 - Pull recent messages from #ai-council

- Use Slack MCP `slack_conversations_history` to read recent messages from the AI Council channel
- **Channel ID**: `C08S37VTJM8`
- **Time window**: Last 7 days (calculate Unix timestamp for 7 days ago and use as `oldest` parameter)
- Pull up to 100 messages to capture all weekly updates

### Step 2 - Filter to weekly update posts ONLY

- From the messages pulled in Step 1, filter to **only** posts where the header/parent message contains the word "update" (case-insensitive)
- These are personal weekly updates from AIC members (e.g., "Ben update :thread:", "Purvi update :thread:", "Dave update :thread:", "OMAI Update", "Prashant (Supercomputing) Update :thread:")
- **Ignore** all other threads - discussion threads, questions, agenda posts, competitive intel shares, presentation suggestions, etc. Only the personal "update" posts matter
- For each identified update post, use `slack_get_thread` to pull the full thread content
- Record the author (user name and user ID) for each update

### Step 3 - Analyze for signal

For each update post, use `slack_get_reactions` on the parent message to get reaction counts.

Score and rank content **within the weekly update posts only** using these criteria (in priority order):

1. **Common themes** - topics that appear across multiple people's updates (e.g., if 3+ people mention Neptune, Run 5 data, or hiring - that's a theme worth surfacing)
2. **Most reactions** - update posts that got the most emoji reactions from the group indicate high-signal content
3. **Most thread replies/chatter** - updates that generated follow-up discussion or questions from others
4. **Flagged concerns** - anything explicitly called out as a worry, risk, blocker, or lowlight in someone's update

### Step 4 - Synthesize into max 5 bullets

Distill all the analysis into exactly 5 (or fewer) high-signal bullet points:

- Each bullet should capture a theme, not just repeat one person's update
- **Attribute every bullet** to the person(s) whose updates it came from, using Slack user ID format: `<@USER_ID>`
- If a theme spans multiple people, attribute to all of them
- Prioritize: reactions > chatter > common themes > concerns
- Write in Maj's Slack style (see `../../2. Writing/CLAUDE.md`):
  - Direct, punchy, no corporate fluff
  - Specific with names, numbers, dates
  - No emdashes - only hyphens
  - Use `•` (bullet character U+2022) for list items when posting to Slack

**Bullet format:**
```
• [Theme/insight in 1-2 sentences] (from <@USER_ID>, <@USER_ID>)
```

If a bullet is about a concern or risk, lead with that framing. If it's about a win, lead with the win.

### Step 5 - Post to #ai-noteworthy

**ONLY post to #ai-noteworthy** - Channel ID: `C098VHM0560`

1. **Send header message** to #ai-noteworthy:
   - Text: `Summary of AIC weekly updates :thread:`
   - Capture `thread_ts` from the response

2. **Send the summary** as a single reply in the thread:
   - Use `thread_ts` from the header message
   - Format: 5 (or fewer) bullet points, each attributed
   - Keep it tight - this is a summary, not a repost

3. **Confirm** posting is complete and share the permalink

---

## Key Channel IDs

| Channel | ID | Purpose |
|---------|----|---------|
| #ai-council | C08S37VTJM8 | Source - read weekly updates from here |
| #ai-noteworthy | C098VHM0560 | Destination - post summary here ONLY |

---

## Known Slack User IDs

Use these for attributions. If a user isn't listed here, pull their user_id from the message metadata.

| Person | Slack ID | Usage in messages |
|--------|----------|-------------------|
| Mustafa Suleyman | U06US8T3CQG | `<@U06US8T3CQG>` |
| Maj (self) | U07AD0R06R4 | `<@U07AD0R06R4>` |
| Paul Soulos | U094XBL8U0G | `<@U094XBL8U0G>` |
| James Cerra | U0AGP746ENT | `<@U0AGP746ENT>` |
| Chris Daly | U075KNETM7F | `<@U075KNETM7F>` |

For anyone else, use the `user_id` field from the Slack message metadata and format as `<@USER_ID>`.

---

## Style Rules

- Follow Maj's Slack style from `../../2. Writing/CLAUDE.md`
- No emdashes - only hyphens
- No corporate speak or filler language
- Be specific with names and numbers
- Keep it punchy - this is a 30-second read, not a report
- Use `•` (bullet character) for list items, not `-` or `*`
- No greeting or sign-off

---

## Edge Cases

- **No updates found**: Tell Maj there were no weekly updates in #ai-council in the last 7 days. Don't post anything
- **Only 1-2 updates**: Still summarize, but note the limited sample. May result in fewer than 5 bullets
- **Can't read the channel**: Flag the permissions issue to Maj. Don't retry silently
- **Duplicate themes**: Merge into one bullet with multiple attributions rather than repeating similar points
- **Very long updates**: Focus on the headline items, not every sub-bullet. Extract the "so what", not the detail
