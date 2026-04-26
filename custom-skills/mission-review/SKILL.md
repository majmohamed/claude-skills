# Skill: Mission Review

Reviews MSI squad and workstream missions for quality of writing (clarity, falsifiability, success metrics) and substance (strategic value, alignment to Build goals, progression from last cycle). Outputs a structured .md file organized by workstream, then squads.

**Slash command**: `/missionreview`

---

## Workflow

### Step 1 - Gather missions

Try these sources in order:

1. **MAI Atlas** (preferred): Use WebFetch to pull MSI C2 missions from `https://mai-atlas.microsoft.com/missions?team=7&cycle=9`. If the page is accessible and contains structured mission data, parse it.
2. **Slack search**: Search Slack for `MSI C2 squads missions one-pager` in channels like `#ai-tpgm-cycle-mgmt`, `#msi-team`, `#temp-c2-msi-closing-pres`. Look for Alexei Dunayev's posts about Atlas being ready, or links to one-pager canvases.
3. **Paste-in fallback**: If neither Atlas nor Slack yields usable mission data, ask Maj to paste in the missions or provide a file path. Use AskUserQuestion:
   - "I couldn't pull missions automatically. Can you paste them in or provide a file path?"
   - Option 1: "I'll paste them in"
   - Option 2: "Here's a file path"
   - Option 3: "Let me share the Atlas link directly"

### Step 2 - Load strategic context

Read the following files to ground the substance review:

1. **Memory file**: `.claude/memory/memory.md` - for Build 2026 targets, current focus areas, strategic context, people context
2. **Strategy folder**: Scan `3. Strategy/` for relevant context:
   - `3. Strategy/Research/` - any strategic research outputs
   - `3. Strategy/Compute allocations/` - compute allocation context
   - `3. Strategy/MSI risk register/` - risk register for current risks
3. **Previous cycle data**: Search Slack for C1 closing presentation or C1 mission statements to compare against. Query: `C1 closing MSI workstream mission` in `#msi-team` or `#ai-tpgm-cycle-mgmt`
4. **Competitive intel**: Read `5. Automations/data/competitive-intel.md` if it exists, for grounding the "is this the right mission" assessment

### Step 3 - Confirm cycle and context with Maj

Before starting the review, briefly confirm using AskUserQuestion:

1. **Which cycle are we reviewing?** (default: the most recent / upcoming cycle)
   - "C2 2026 (current)"
   - "C3 2026 (upcoming)"
   - "Other"

2. **Any specific areas you want me to focus on?**
   - "Just do the full review"
   - "Focus on mission quality / writing"
   - "Focus on substance / strategic alignment"
   - "Flag specific squads I should look at closely" (then ask which ones)

### Step 4 - Review each mission

For each workstream and its squads, assess on two dimensions:

#### Dimension 1: Mission Quality (Writing)

Score each mission against these criteria, derived from MAI's own mission-writing guidance:

| Criterion | What good looks like | Source |
|-----------|---------------------|--------|
| **Brevity** | One short sentence, ideally < 12 words. No paragraphs. | Timothe (C6 DRI guidance) |
| **Action verb** | Starts with "Ship", "Launch", "Build", "Deliver". Not "Improve", "Continue", "Support". | Timothe (C6 DRI guidance) |
| **Falsifiability** | At the end of the cycle, you can objectively say "yes we did this" or "no we didn't". No weasel words. | henriloh, Davide, Purvi, Maj |
| **Specificity** | Names the thing being shipped/built. Not vague ("improve model quality") but concrete ("Ship MAI-2 text model to LM Arena top 3"). | henriloh (C1 guidance) |
| **Success criteria** | Separate from mission. Falsifiable, measurable bullets. Has target numbers, not "track" or "improve". | Timothe, PRD review bot patterns |
| **Squad sizing** | Mission scope matches squad size. A 15-person squad should have a bigger mission than a 3-person squad. | henriloh (C1 guidance) |
| **No conflation** | Mission doesn't conflate the why (objective), what (deliverables), and how (work). Keep them separate. | Timothe, Purvi feedback |

Rate each mission: **Strong** / **Adequate** / **Weak** on writing quality, with specific commentary on what's good and what to fix.

#### Dimension 2: Strategic Substance

Assess each mission against these questions:

1. **Build alignment**: Does this mission directly contribute to Build 2026 goals?
   - Build targets from memory: LM Arena Text ELO 1471, MMLU Pro 87%, Terminal-Bench 55%, SWE-Bench Verified 81%
   - Goal: "#1 in our compute class"
   - Key capabilities: reasoning climbing, model steerability, coding, multimodal
   - Adjacent goals: AI Foundry availability, VS Code MAI models, playground launch

2. **Value density**: Is this the highest-value thing this squad could be working on? Or is it a side quest?
   - Consider: Does this move a benchmark? Ship a product? Unblock another squad? Reduce a red risk?
   - Flag missions that feel like "keeping the lights on" work dressed up as a cycle mission

3. **Cycle-over-cycle progression**: How does this compare to their C1 mission?
   - Is there clear progression (C1 built the foundation, C2 ships the thing)?
   - Or is it the same mission restated with slightly different words?
   - Flag any squad that seems stuck - same mission 2+ cycles running

4. **Risk coverage**: Do the MSI squads collectively cover the known red risks?
   - From memory: CLIMB convergence, consolidation slipping, safety degradation after 30 RL steps, key people on leave
   - Any critical gaps not covered by any squad?

5. **Compute justification**: For squads that consume significant GPU resources, does the mission justify the allocation?
   - Reference compute allocation context from `3. Strategy/Compute allocations/`

Rate each mission: **High value** / **Medium value** / **Low value / Side quest** on substance, with specific commentary.

### Step 5 - Generate the review document

Save the output as a .md file in `3. Strategy/Ad hoc/` with the naming convention: `[YYMMDD] MSI Mission Review - [Cycle].md`

#### Document structure:

```markdown
# MSI Mission Review - [Cycle Name]

**Reviewer**: Maj Mohamed (via Claude)
**Date**: [YYYY-MM-DD]
**Source**: [MAI Atlas / Slack / Pasted in]

---

## Executive Summary

[2-3 sentences: overall quality of missions this cycle. How many are strong vs weak on writing? How well do they collectively cover Build goals? Any glaring gaps?]

## Scorecard

| Workstream | Squad | Mission (abbreviated) | Writing | Substance | Overall | Key flag |
|------------|-------|-----------------------|---------|-----------|---------|----------|
| Pre-training | [Squad name] | [First 8 words...] | Strong/Adequate/Weak | High/Med/Low | [emoji] | [one-line flag] |
| ... | ... | ... | ... | ... | ... | ... |

Legend: :large_green_circle: = Strong + High value | :large_yellow_circle: = Adequate or Medium | :red_circle: = Weak or Low value / Side quest

---

## Detailed Review

### [Workstream 1 Name]

**Workstream mission**: [if there is one]
**Workstream comment**: [1-2 sentences on whether the WS mission is clear, and whether the squads underneath collectively serve it]

#### [Squad 1 Name]

**Mission**: [full mission text]
**Success criteria**: [listed if available]
**Squad size**: [if known]

**Writing review**:
- Brevity: [comment]
- Falsifiability: [comment]
- Action verb: [comment]
- Specificity: [comment]
- Success criteria quality: [comment]
- **Rating**: Strong / Adequate / Weak

**Substance review**:
- Build alignment: [comment - which Build goal does this serve?]
- Value density: [is this the highest-value work for this squad?]
- Cycle progression: [how does this compare to C1?]
- Risk coverage: [does this address any known red risks?]
- **Rating**: High value / Medium value / Low value

**Suggested rewrite** (if Weak on writing):
> [Proposed improved mission statement]

---

[Repeat for each squad within workstream]

---

[Repeat for each workstream]

---

## Cross-cutting Observations

### Coverage gaps
[Are there Build 2026 goals or known risks NOT covered by any squad?]

### Redundancy
[Are any squads doing overlapping work?]

### Sizing mismatches
[Any large squads with small missions, or vice versa?]

### Missions to watch
[Top 3-5 missions that are either the strongest or most concerning]

---

## Appendix: Mission Writing Standards (Reference)

Summary of MAI mission-writing standards used in this review:

1. **Missions should be super short and memorable.** One sentence, ideally < 12 words. Start with "Ship", "Launch", "Build", "Deliver" - not "Improve", "Continue".
2. **Missions must be falsifiable.** At cycle end, you can say yes or no. No weasel words like "explore", "investigate", "support".
3. **Success criteria are separate.** The mission states WHAT. Success criteria state HOW YOU'LL KNOW. They need target numbers.
4. **Squad size should match mission scope.** Impact by team size matters.
5. **Prioritize ruthlessly.** The more you prioritize your squads, the better. A squad with too many objectives has no real mission.
6. **Show cycle-over-cycle improvement.** How are you improving from last cycle?
7. **Justify with impact.** What impact are you making that would allow a decision to prioritize based on reading the mission alone?
```

### Step 6 - Share summary with Maj

After saving the file, display in chat:
1. The executive summary
2. The scorecard table
3. Top 3 flags / concerns
4. Where the file was saved

Do NOT auto-post to Slack. This is a private review document.

---

## Reads

- MAI Atlas (via WebFetch): `https://mai-atlas.microsoft.com/missions?team=7&cycle=9`
- Slack MCP: Search for mission posts in `#msi-team`, `#ai-tpgm-cycle-mgmt`, `#temp-c2-msi-closing-pres`
- `.claude/memory/memory.md` - Build targets, strategic context, people
- `3. Strategy/` - Compute allocations, risk register, research
- `5. Automations/data/competitive-intel.md` - Competitive landscape
- Pasted input from Maj (fallback)

## Writes

- `3. Strategy/Ad hoc/[YYMMDD] MSI Mission Review - [Cycle].md`

---

## Key Rules

1. **Always load strategic context before reviewing.** The substance review is worthless without grounding in Build goals and current risks.
2. **Be direct and specific in commentary.** "This mission is too vague" is not helpful. "This mission says 'improve reasoning' but doesn't specify which benchmark, by how much, or what ship vehicle" is helpful.
3. **Suggest rewrites for weak missions.** Don't just flag problems - propose the fix.
4. **Compare to C1 missions.** Cycle-over-cycle progression matters. Flag squads that are stuck.
5. **No emdashes.** Only hyphens.
6. **Be honest about gaps.** If there's a Build goal with no squad coverage, say so clearly.
7. **Don't be artificially balanced.** If most missions are weak, say so. If most are strong, say so. Don't force a bell curve.
8. **Flag side quests.** A squad working on something tangential to Build goals should be called out, even if the mission is well-written.
9. **The scorecard table goes at the top.** Busy people read top-down. The detail is for reference.
10. **This is a private document.** Written for Maj's eyes, not for sharing with squad leads directly. Be candid.

---

## Edge Cases

- **Mission data is incomplete**: Note which squads are missing and flag it. Review what's available.
- **No C1 missions available for comparison**: Skip the cycle-over-cycle comparison for that squad. Note the gap.
- **Workstream has no overall mission**: Flag it. Workstreams should have a pithy mission that captures criticality.
- **Squad mission is a paragraph**: Review it, but flag the format issue prominently. Propose a compressed version.
- **Mission is well-written but low value**: These are the most important to flag. A beautifully written mission for a side quest is worse than a poorly written mission for critical work.
- **Maj wants to focus on specific squads only**: Skip the full review and deep-dive on the requested squads. Still produce the scorecard for context.
