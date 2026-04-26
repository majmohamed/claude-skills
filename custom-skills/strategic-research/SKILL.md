# Skill: Strategic Memo Research Assistant

Takes a strategic question, interviews Maj on depth, auto-generates a research plan with numbered areas, executes parallel web research into numbered files, and produces a synthesis document. Does NOT write the final memo - Maj uses `/mustafa` or writes himself.

**Slash command**: `/research`

---

## Workflow

### Step 1 - Interview

If the topic/question was provided via arguments, use it. Otherwise, ask Maj:

1. **Strategic question** - What's the core question or topic to research? (e.g., "How are enterprises adopting RL for production workflows?", "What's the competitive landscape for on-device AI?")
2. **Context** - Any specific angle, audience, or framing Maj has in mind? What's this research ultimately for? (Optional - helps shape the research plan)

### Step 2 - Depth check

Ask Maj how deep to go using AskUserQuestion:

- **Light** (4-6 research areas, faster) - good for quick scans and time-sensitive questions
- **Full** (8-12 research areas, thorough) - the RL Enterprise-style deep dive
- **Custom** - Maj specifies the exact research areas

### Step 3 - Generate research plan

Based on the topic, context, and depth:

1. Generate a project name - short and descriptive, kebab-case (e.g., `rl-enterprise`, `oss-strategy`, `compute-scaling`, `on-device-ai`)
2. Create numbered research areas, each with:
   - Area number and name
   - 1-2 sentence description of what to research
   - 3-5 specific questions to answer
3. Check if related research already exists in `3. Strategy/Research/` - if so, note it and ask if Maj wants to build on it or start fresh

Present the full plan to Maj via AskUserQuestion for approval. Maj can:
- **Approve as-is**
- **Add areas**
- **Remove areas**
- **Modify areas**
- **Change the project name**

Do NOT proceed until Maj approves the plan.

### Step 4 - Create project structure

Create the output directory and save the approved plan:

```
3. Strategy/Research/[project-name]/
├── PROJECT-PLAN.md
└── research/
```

**PROJECT-PLAN.md format:**
```markdown
# Research Plan: [Topic]

**Project**: [project-name]
**Date**: [YYYY-MM-DD]
**Depth**: [Light / Full / Custom]
**Status**: In progress

## Strategic Question
[The core question]

## Context
[Any framing or context Maj provided]

## Research Areas

1. **[Area Name]** - [Description]
   - [Question 1]
   - [Question 2]
   - [Question 3]

2. **[Area Name]** - [Description]
   - [Question 1]
   - [Question 2]
   - [Question 3]

...
```

### Step 5 - Execute research

For each numbered research area:

1. Use WebSearch to run multiple targeted searches per area
2. Use WebFetch to pull key pages for deeper analysis where needed
3. Synthesize findings into a structured research file
4. Save as `research/0N-[area-name].md` (zero-padded, kebab-case)

Use Agent subagents for parallel execution where possible - multiple research areas can be investigated simultaneously.

**Research file format:**
```markdown
# [Research Area Title]

## Key Findings
- [Finding 1 with source]
- [Finding 2 with source]
- [Finding 3 with source]
- ...

## Implications for Microsoft AI
- [Implication 1]
- [Implication 2]
- ...

## Sources
- [URL 1]
- [URL 2]
- ...
```

**Rules for each research file:**
- Each file should be self-contained - readable on its own without needing the others
- Every finding must cite a source
- "Implications for Microsoft AI" should be specific, not generic platitudes
- No emdashes - only hyphens
- Be direct and factual - no filler language

### Step 6 - Synthesize

After all research files are complete, produce `synthesis.md` in the project root.

This is NOT a summary of each file. It connects findings across areas, identifies patterns, and draws out strategic implications.

**Synthesis format:**
```markdown
# Synthesis: [Topic]

## Common Themes (across all research areas)
1. [Theme] - supported by areas [X, Y, Z]
2. [Theme] - supported by areas [X, Y]
3. ...

## Key Insights
- [Insight 1 - connects areas X and Y]
- [Insight 2 - connects areas Y and Z]
- ...

## Strategic Implications for MSI
- [Implication 1]
- [Implication 2]
- ...

## Recommended Framework
[If applicable - a proposed structure for how to think about this topic]

## Open Questions
- [Question that research couldn't fully answer]
- [Question that emerged during research]
- ...
```

**Synthesis rules:**
- Connect findings, don't just summarize each file
- Each theme must reference which research areas support it
- Key insights should bridge multiple research areas - single-area findings stay in the individual files
- Strategic implications should be specific to MSI's position and priorities
- The recommended framework is optional - only include if the research naturally suggests one
- Open questions are critical - be honest about what the research didn't fully answer

### Step 7 - Update PROJECT-PLAN.md status

Update the status in PROJECT-PLAN.md from "In progress" to "Complete" and add the completion date.

### Step 8 - Done

Tell Maj the research is complete. Summarize:
- How many research areas were completed
- The top 3-5 findings from the synthesis
- Where all files are saved
- Remind Maj that no memo has been drafted - use `/mustafa` if he wants to turn this into a strategy doc

---

## Output Structure

All outputs go to: `3. Strategy/Research/[project-name]/`

```
3. Strategy/Research/[project-name]/
├── PROJECT-PLAN.md          <- Research plan with numbered areas
├── research/
│   ├── 01-[area-name].md
│   ├── 02-[area-name].md
│   ├── ...
│   └── 0N-[area-name].md
└── synthesis.md              <- Key findings + strategic implications
```

---

## Reads

- Web search results (WebSearch + WebFetch)
- Existing research in `3. Strategy/Research/` for related topics (check before starting)

## Writes

- All files in `3. Strategy/Research/[project-name]/`

---

## Key Rules

1. **Always interview on depth before starting** - never assume Light or Full
2. **Present research plan for approval before executing** - Maj must approve
3. **Each research file should be self-contained and sourced** - every finding cites a source
4. **Synthesis should connect findings, not just summarize each file** - cross-area patterns are the point
5. **No memo drafting** - that's a separate skill (`/mustafa`). This skill produces research and synthesis only
6. **Use Agent subagents for parallel research execution** where possible
7. **Project name should be short and descriptive** - kebab-case (e.g., `rl-enterprise`, `oss-strategy`, `compute-scaling`)
8. **No emdashes** - only hyphens
9. **Check for related existing research** before creating a new project
10. **Be honest about gaps** - the Open Questions section matters

---

## Edge Cases

- **Topic is too broad**: Push back during the interview. Ask Maj to narrow the question or specify which angle matters most
- **No useful search results for an area**: Note what was searched and what came up empty. Don't fabricate findings. Flag it in the research file and in synthesis Open Questions
- **Related research already exists**: Surface it in Step 3. Let Maj decide whether to build on it or start fresh
- **Maj wants to change scope mid-research**: Pause, update the plan, get re-approval, then continue
- **Very time-sensitive topic**: Recommend Light depth and flag that findings may shift quickly
