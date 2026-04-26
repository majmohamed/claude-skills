# Skill: Mustafa SLT Writing

## What This Is

Style guide and voice rules for writing as Mustafa Suleyman in strategy/exec contexts - board memos, strategy papers, vision documents, exec comms to Satya and SLT. This is Mustafa's internal writing voice for senior audiences, not his public/blog voice.

Derived from analysis of 8+ memos authored by Mustafa to SLT, covering model strategy, compute utilization, infrastructure friction, competitive resourcing, FY retrospectives, and state-of-AI-training updates.

Trigger: `/mustafa`

---

## How to Run

When invoked, follow these steps:

### Step 1: Interview

Run an AskUserQuestion interview covering:

1. **Document type** - What are we writing? (Strategy memo, board paper, exec update, vision doc, competitive analysis, RAG status doc, retrospective, other)
2. **Audience** - Who is this for? (Board, Satya, SLT, cross-MSFT leadership, other)
3. **Source material** - Where should I pull from? Options:
   - Maj will paste content / give verbal brief
   - Read from a specific file path
   - Gather from meeting notes folders (specify which)
   - Rewrite an existing Maj draft in Mustafa's voice
4. **Output** - Where to save? (Specific file path, just show in chat, save to `2. Writing/` subfolder)

### Step 2: Write (or Rewrite)

Apply the voice and style guidance below to produce the output. Not every rule applies to every memo - use the frequency guide to judge which patterns fit the document type. If rewriting an existing draft, preserve the substance and messaging but transform the voice.

### Step 3: Iterate

Present the draft. Accept edits. Re-present. Save when Maj approves.

---

## Mustafa's Voice: Strategy & Exec Writing

### How to use these rules

These are patterns, not a checklist. Mustafa doesn't mechanically apply all 13 in every memo. Some are near-universal (no hedging, ground in specifics), others appear only in certain document types (competitor tables, escalation closes). The frequency guide below each rule indicates how often it shows up across the corpus. Use your judgment - if a rule doesn't fit the document, skip it.

### The 13 Rules

#### 1. No hedging
**Frequency: every memo, every time.**

Remove defensive qualifications entirely. No "if we're wrong" scenarios. No "we believe" or "our view is" softeners. State positions as facts.

- Bad: "Our conviction is that models are not going to commoditize."
- Good: "Only a handful of labs globally can train at the frontier, and the cost is only increasing."
- Bad: "If we're wrong, and models do commoditize, we are well prepared..."
- Good: Cut the sentence entirely.

From the state-of-training memo: "There is no path to being a frontier AI company by 2030, without training our own models end-to-end." No hedge. No "we believe." Just the statement.

#### 2. Name things
**Frequency: most memos, especially strategy and vision docs. Less so in short updates.**

Brand concepts with memorable names and acronyms. Create vocabulary that sticks.

- "RLEE" not "domain-specific enterprise partnerships"
- "The verification gap" not "the problem with subjective tasks"
- "The 7-layer cost stack" not "the various costs involved in AI delivery"
- "Rocket" for the RL infra stack
- "YOLO" (You Only Launch Once) for the pre-training codebase
- "Mango" (MAI Next Generation Orchestrator)
- "Data Switzerland" for the data governance layer
- "Compute classes" (Medium, Large, XL) to frame capability ceilings
- "Successful sessions" to replace DAU as a north star

If a concept doesn't have a name, give it one. If a framework can be numbered, number it. If a metric needs replacing, coin the replacement.

#### 3. Ground abstractions in specifics
**Frequency: every memo. This is one of his strongest patterns.**

Never leave a general statement unanchored. Pick a concrete example that makes the point land.

- Bad: "The right approach likely varies by product surface."
- Good: "For GitHub this is most tractable, since coding outputs are more stylistically neutral."
- Bad: "We've struggled with infrastructure."
- Good: "Storage was delayed by 3.5 months. The Portland cluster arrived four months late due to issues with local storage and fibre connectivity."
- Bad: "Hiring is competitive."
- Good: "Bluntly, Microsoft is not on anyone's top 5 list until we approach them and sell the opportunity."

From the FY25 retro: "28% of messages began with the phrase 'Certainly!'" - this is how he makes a quality problem vivid.

#### 4. Always tie back to the core argument
**Frequency: every memo. Sections that don't connect back feel orphaned.**

Every section must close by connecting back to the central thesis. Don't leave sections floating.

From the state-of-training memo, after laying out the compute gap: "Fundamentally, this means we can't compete in the SOTA compute class - and means we can't properly deliver on Microsoft's self-sufficiency mission."

From the COGS memo, after explaining RLEE: "This is a direct COGS lever. The more we post-train MAI models on real enterprise workflows, the more queries we can serve with our own models instead of paying for someone else's."

#### 5. Bold editorial judgments
**Frequency: most memos. Especially prominent in strategy docs and retrospectives. Lighter in pure data updates like compute utilization.**

State the problem bluntly. Don't soften.

- "This isn't sustainable."
- "We must build our own frontier models."
- "This has turned out to be a failed strategy."
- "That is shocking." (on MSFT being slower to integrate models than OpenAI)
- "We have committed the cardinal sin of deleting years of valuable data due to storage costs."
- "If we choose not to make this bet, and we're wrong, the downside is catastrophic."
- "There is no way to partially commit to this goal. We have to be all-in."

He will call something a failure. He will call something shocking. He does not mince words.

#### 6. Plug MSFT products naturally
**Frequency: about half the memos. Appears when the argument benefits from showing existing assets. Not forced into infra or competitive memos.**

Weave product references into the argument as evidence, not as marketing. They should feel like proof points.

- "Azure AI Model Router ships today as a first-party model in Azure Foundry."
- "Copilot Mode in Edge... will introduce features central to the future AI browser experience."
- "Copilot Search... launched in April 2025 and already has ~4 million WAU."

#### 7. Parallel paths, not timelines
**Frequency: strategy memos only. Doesn't apply to retrospectives, updates, or infra docs which naturally use chronological framing.**

Frame strategies as simultaneous paths, not sequential phases. Use numbered parallel tracks.

- Bad: "Near term: routing. Long term: frontier models."
- Good: "Three core paths: (1) Auto-routing, (2) RLEEs, (3) Product design."

Note: he does use timelines when telling a history or laying out a roadmap. The "parallel paths" rule applies specifically to strategy framing.

#### 8. Declarative framing
**Frequency: most memos. Particularly strong in strategy and vision docs.**

Anchor forward-looking statements in current business reality.

- Bad: "This is what carries us through the next great platform shift."
- Good: "Alongside our core Azure business, this is what carries us through the next great platform shift."

#### 9. Prefer impact numbers over threshold numbers
**Frequency: whenever data is involved. Universal across all data-heavy memos.**

Show the savings, the gap, the scale - not the percentage that needs the expensive thing.

- Bad: "Only 14-26% of queries actually required GPT-4"
- Good: "Cost reductions of over 85% on MT Bench while still achieving 95% of GPT-4's performance"

He loves stark comparative numbers: "91 MTS-AI... OAI ~1,000... GDM ~3,500." The comparison does the work.

#### 10. Think about the user experience dimension
**Frequency: about half the memos. Appears in product-facing and strategy docs. Less so in infra or compute memos.**

Don't just describe technical problems technically. Add the human/UX angle.

- Technical only: "The frontier model inherits a conversation history it didn't generate."
- Mustafa's version: "Most importantly it will result in a patchwork of styles. Models have very different personalities."

From the FY25 retro: He replaced DAU with "successful sessions" because DAU was "a blunt instrument" that led to "spammy upsells." He frames metrics in terms of what they mean for users.

#### 11. Competitor comparison tables
**Frequency: competitive analysis and resource memos. About 3 of the 8 memos use these.**

He uses tables to show MAI vs. competitors on talent, data spend, and compute. The tables are factual, stark, and the numbers do the talking.

```
Area        MAI     OAI      GDM      Anthropic   Meta     xAI
MTS-AI      91      ~1,000   ~3,500   ~450        ~1,700   ~300
MAI as %    n/a     9%       3%       20%         5%       30%
```

The "MAI as %" row is characteristic - he wants the reader to see the gap instantly without doing math. Always source the data: "These estimates are based on a comprehensive scraping of every team member at each company on LinkedIn."

#### 12. The escalation close
**Frequency: strategy memos and state-of assessments. About half the memos. Not used in pure updates or retrospectives.**

Strategy memos end with a numbered list of what he needs from SLT. Direct asks, not suggestions. From the state-of-training memo:

```
We urgently need to:
1. Increase the training plan of record...
2. Staff a large world class dedicated team...
3. Double down on our MAIA investments...
4. Unlock the ability to train on 1P product data...
```

"We urgently need to:" not "We recommend considering." The asks are numbered, specific, and action-oriented.

#### 13. Honest about failures - then pivot to the path forward
**Frequency: retrospectives and state-of assessments. Less prominent in forward-looking strategy docs.**

He will openly call out what went wrong. But he always follows it with what happened next or what needs to happen.

- "The big disappointment is that we haven't shipped a model yet. Obviously, this is a miss. We can't avoid this fact." - then immediately explains the root causes and the path forward.
- "This has turned out to be a failed strategy. Users want the very best capabilities available at any given time." - then pivots to the new approach.
- "We have committed the cardinal sin of deleting years of valuable data due to storage costs." - then explains the fix.

He does not hide bad news. But he also never leaves it hanging without a "so here's what we're doing about it."

---

### Tone

- **Authoritative, not academic.** He knows the domain deeply. The writing reflects command of the subject without being lecturing.
- **Urgent but measured.** The substance conveys urgency. The tone stays calm and strategic. Even the most alarming data points ("24 months behind the competition") are stated matter-of-factly.
- **Honest about challenges.** Flags problems directly and will call things failures. Always pairs with a path forward.
- **First-person plural, with occasional first-person singular.** "We must build..." "We cannot rely..." for organizational statements. "I'm delighted with..." "I'm deeply anxious about..." for personal accountability moments. The first-person singular appears when he's taking personal ownership or expressing personal conviction.
- **Gratitude where earned.** He names people and thanks them specifically: "Credit is due to Scott here." "We owe huge thanks to the Bing team." "I'm thrilled that Umesh Shankar... has joined us." This is deliberate - it builds loyalty and models accountability culture.
- **Conversational opener for some memos.** Several memos start with a brief personal note: "Hi both, I had sent you a retrospective in September..." or "Hi everyone, As Satya said today..." This softens the opening before the substance hits hard. Used when the audience is Satya/Kevin directly, less so for broader SLT distribution.

### Document Structure Patterns

Mustafa uses different structures depending on the document type. These are patterns, not templates - adapt as needed:

#### Strategy memo
1. Purpose / overview (1-2 paragraphs framing why this matters)
2. Numbered strategic pillars or paths (the "what we're doing")
3. Deep dives on each pillar with evidence
4. Risks / gaps
5. Escalation close with numbered asks

#### Retrospective
1. Personal opening ("Hi both...")
2. Numbered missions in priority order
3. Each mission covered in reverse order (starts with #4 and works up to #1)
4. Within each mission: what went well, where we fell short, what's next
5. Forward-looking close

#### State-of / assessment
1. Summary section with the thesis stated bluntly
2. History of key decisions (chronological)
3. "The good news" section (establishes credibility before the ask)
4. Status overview (RAG table or equivalent)
5. Deep dive on each area
6. Conclusion with numbered urgent asks

#### Competitive analysis
1. Purpose
2. Exec summary (3 bullet points max)
3. Comparison tables (talent, data, compute)
4. Key observations as bullets under each table
5. Appendices with data sources

### Sentence-Level Style

- **Short declarative sentences for impact.** "There is no way to partially commit to this goal." "We have to be all-in." These land as standalone paragraphs.
- **Colon-introduced lists within paragraphs.** "Three ingredients: talent, data, compute."
- **Parenthetical specifics, not hedges.** He uses parentheses for precision: "(which restricts the transfer of sensitive personal data to six 'countries of concern', including China)" - not for softening.
- **Dashes for emphasis.** "The most important thing in AI is the know-how. The compute can be acquired, the data can be ingested, the models can be trained and deployed, but knowing how to do it all is gained through practical, hands-on experience."
- **Uses "bluntly" and "put simply" before the most important statements.** "Bluntly, Microsoft is not on anyone's top 5 list." "Put simply and clearly, our goal is to deliver AI self-sufficiency."
- **Semi-formal register.** Not corporate, not casual. He writes "We've" and "can't" freely. He'll say "probs" in Slack but not in memos. The register is a senior leader writing to peers, not a consultant writing to a client.

### What to Avoid

- Passive voice ("It was decided..." - no. "We decided...")
- Hedging without substance ("We're looking into..." - instead: "We're evaluating X and Y, expect a decision by [date]")
- Corporate filler: "synergies", "leverage", "unlock value", "paradigm shift", "game-changer", "align stakeholders"
- The "it's not X, it's Y" rhetorical contrast - never use this pattern, not even once
- Parenthetical hedges and escape hatches
- Defensive positioning ("if we're wrong about this...")
- Process narration ("The team met and discussed..." - no. State the outcome.)
- Leaving sections without connecting them back to the core argument
- Hiding bad news or burying it in euphemism
- Celebrating revised timelines that are actually slips: "Instead of accountability, we saw emails celebrating a delivery that was only 'two weeks early' relative to a revised timeline that had already slipped by four months."
- Over-abstracting competitive gaps - use specific numbers, names, timelines
- Unnamed accountability - always name the person or team responsible

### Naming Conventions

- Use "MSI" or "Microsoft Superintelligence" in post-November 2025 documents (after the org rename)
- Use "MAI" or "Microsoft AI" in pre-November 2025 documents
- Always use the accent on Karen (Karen Simonyan)
- Use proper capitalisation for names and acronyms
- "Mustafa" not "Mustaf" in all contexts
- Name key people by first name when they're well known to audience (Satya, Karen, Nando, Jacob, Tim)
- Full name + title on first reference for newer hires: "Amar Subramanya (CVP, AI Product Acceleration) - VP of Engineering for Bard & Gemini"

---

## Calibration Sources

Before writing, read these if available and relevant:

| Source | Path | Purpose |
|--------|------|---------|
| SLT memos corpus (8 memos) | `2. Writing/mustafa-slt-memos/` | Full corpus of Mustafa's SLT writing |
| COGS strategy memo (v3) | `3. Adhoc/RL Enterprise Partnerships/DRAFTMEMO v3.md` | Shows Mustafa's edited voice vs. Maj's draft |
| Satya weekly updates | `2. Writing/Satya weekly updates/` | Mustafa's voice in weekly exec format |
| Mustafa voice styles | `2. Writing/Mustafa voice guide.md` | All Mustafa voice types: exec memos, team comms, partner thank yous, internal gratitude, SLT follow-ups |
| Memory store | Recall "Mustafa writing style" from local memory MCP | Stored editing patterns |

### Key reference memos by type:

| For this type of doc... | Read this memo first |
|------------------------|---------------------|
| Strategy / vision | `2025modelstrategy.md` and `stateofaitraining.md` |
| Competitive analysis | `mairesources.md` |
| RAG / state-of assessment | `stateofaitraining.md` |
| Infrastructure / ops | `researcherfriction.md` and `followonfriction.md` |
| Retrospective | `msfy25retro.md` |
| Data-heavy utilization update | `computeutil.md` |
| Model progress update | `stateofmodels.md` |

---

## Quick Reference: The 13 Rules

| # | Rule | When to use |
|---|------|-------------|
| 1 | No hedging | Always |
| 2 | Name things | Most memos, especially strategy/vision |
| 3 | Ground abstractions in specifics | Always |
| 4 | Always tie back to the core argument | Always |
| 5 | Bold editorial judgments | Most memos, lighter in pure data updates |
| 6 | Plug MSFT products naturally | When argument benefits from showing assets |
| 7 | Parallel paths, not timelines | Strategy framing only |
| 8 | Declarative framing | Most memos |
| 9 | Prefer impact numbers | Whenever data is involved |
| 10 | User experience dimension | Product-facing and strategy docs |
| 11 | Competitor comparison tables | Competitive analysis and resource memos |
| 12 | The escalation close | Strategy memos and state-of assessments |
| 13 | Honest about failures, then pivot | Retrospectives and state-of assessments |
