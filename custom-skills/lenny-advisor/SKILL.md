# Lenny Advisor

Uses Lenny Rachitsky's newsletter and podcast archive (~600 files) as a knowledge base to help Maj think through product, strategy, leadership, and growth problems with frameworks and advice from top operators.

**Slash command**: `/lenny`

---

## Trigger

`/lenny [problem or question]`

Examples:
- `/lenny How should I think about pricing our AI product?`
- `/lenny I need to restructure my team for AI`
- `/lenny How do I get buy-in from SLT for a risky bet?`
- `/lenny What's the best way to run a planning process at scale?`

---

## Steps

### Step 1 - Understand the problem

If the problem/question was provided via arguments, use it. Otherwise, ask Maj:

1. **What's the problem or question?** - One sentence describing what he's wrestling with
2. **Any context?** - (Optional) Who's involved, what's been tried, what the constraints are

Do NOT interview beyond this. The skill's value is speed - Maj throws a question, gets a synthesized perspective back. No depth checks or approval gates.

### Step 2 - Read the newsletter index

Read the newsletter category index:

```
G:\My Drive\1. Career and edu\6. Lennys Newsletter\index.md
```

This contains 10 categories with every newsletter and podcast file mapped to categories and a one-line insight. Categories: AI Strategy & Product Building, AI-Powered Coding & Tools, Growth Retention & Marketplace, Pricing & Monetization, Go-to-Market & Sales, Founder Stories & Company Building, Leadership & Team Scaling, Product Management Craft, Personal Effectiveness & Career, How [Company] Builds Product.

### Step 3 - Identify relevant content

Based on Maj's problem, identify:

1. **2-4 primary categories** most relevant to the problem
2. **3-8 specific files** from those categories that are most likely to contain applicable frameworks, advice, or case studies
3. **1-3 podcast files** by guest name if any guests are known experts on this topic (podcasts are in `03-podcasts/` named by guest, e.g. `april-dunford.md`, `ben-horowitz.md`)

Prioritization logic:
- Files with a directly relevant "Insight" column value rank highest
- Files tagged with dual categories that both match the problem rank above single-category matches
- "How [Company] Builds Product" (CO-BUILDS) files are useful when the problem is about process, org design, or planning
- Podcast files are named by guest - if you recognize a guest as an authority on the topic, include them
- Prefer depth over breadth - 4 deeply relevant files beat 8 loosely related ones

### Step 4 - Read the source files

Read the full content of each selected file:

- Newsletters: `G:\My Drive\1. Career and edu\6. Lennys Newsletter\02-newsletters\[filename]`
- Podcasts: `G:\My Drive\1. Career and edu\6. Lennys Newsletter\03-podcasts\[filename]`

Read all selected files before starting synthesis. Don't read-then-write sequentially - gather all the material first, then synthesize.

### Step 5 - Synthesize and respond

Produce a single structured response. This is NOT a summary of each article. It's a synthesized advisory perspective that pulls the best thinking across multiple sources and applies it to Maj's specific situation.

---

## Output format

```
## The question
[Restate the problem in one line]

## Frameworks that apply

**[Framework name]** - [Source: Guest name, article/podcast title]
- [How it works - 2-3 bullets max]
- [Why it applies to Maj's situation]

**[Framework name]** - [Source: Guest name, article/podcast title]
- [How it works - 2-3 bullets max]
- [Why it applies to Maj's situation]

[Repeat for 2-4 frameworks]

## What the best operators say

- **[Guest name]** ([context - role, company]): "[Key insight or direct advice]" - and here's how that maps to your situation: [1-2 sentences]
- **[Guest name]** ([context]): "[Key insight]" - [application]
- [3-6 perspectives total]

## Where they disagree
[If multiple sources offer conflicting advice, surface the tension. If they're aligned, skip this section.]

- [Perspective A] vs [Perspective B] - [why both have merit in Maj's context]

## What to do with this

- [Actionable recommendation 1 - specific to Maj's role and constraints]
- [Actionable recommendation 2]
- [Actionable recommendation 3]

## Questions you should be asking yourself

- [Probing question 1 that the frameworks surface]
- [Probing question 2]
- [Probing question 3]

## Go deeper

If you want to dig into any of this further, these are the source files:
- [Filename] - [one-line reason it's worth reading in full]
- [Filename] - [reason]
```

---

## Key paths

| What | Path |
|------|------|
| Newsletter index | `G:\My Drive\1. Career and edu\6. Lennys Newsletter\index.md` |
| Newsletter files | `G:\My Drive\1. Career and edu\6. Lennys Newsletter\02-newsletters\` |
| Podcast files | `G:\My Drive\1. Career and edu\6. Lennys Newsletter\03-podcasts\` |

---

## Rules

1. **Index first, then read.** Always read `index.md` first to identify files. Never try to scan or glob all 600 files.
2. **Synthesize, don't summarize.** The output should feel like advice from a well-read advisor, not a book report. Connect ideas across sources into a coherent perspective.
3. **Always cite by name.** Every framework, quote, or piece of advice must name the person and source. Maj wants to know who said it so he can go deeper.
4. **Tailor to Maj's context.** Maj is a senior exec at Microsoft AI in a strategy/operations role, not a startup founder or IC PM. Translate startup-focused advice into his context. "Hire your first PM" becomes "How to structure a new function." "Finding PMF" becomes "How to validate a new internal initiative." Don't force-fit advice that doesn't apply.
5. **Bullets over prose.** Keep it scannable. Frameworks get 2-3 bullets, not paragraphs. Quotes are one line, not block quotes.
6. **Present tensions, don't resolve them artificially.** When Julie Zhuo and Ben Horowitz disagree on management style, say so. Maj can hold nuance.
7. **Cap the reading.** Read 3-8 files max. More sources doesn't mean better advice. Pick the most targeted files.
8. **Podcasts by guest expertise.** Podcasts are named by guest. If you know April Dunford talks about positioning, or Shreyas Doshi talks about prioritization, pull their file directly. If unsure, lean on the indexed newsletters.
9. **No emdashes.** Only hyphens in all output.
10. **Skip irrelevant sections.** If the "Where they disagree" section has no real tension, omit it. Don't force structure.
11. **Speed matters.** This skill should feel fast. No interview gates beyond the initial question. No approval steps. Question in, synthesized advice out.

---

## Edge cases

- **Question is too broad** (e.g. "How do I be a better leader?"): Push back. Ask Maj to narrow it - what specifically about leadership? Delegation? Hiring? Managing up? Reorgs?
- **No relevant content in the archive**: Be honest. Say "Lenny's archive doesn't cover this well" and offer to use `/research` for a web-based deep dive instead.
- **Question maps to a single file**: That's fine. Read it deeply and supplement with 1-2 adjacent files. The synthesis should still connect ideas, not just regurgitate one article.
- **Maj wants to go deeper on one framework**: Point him to the source file path so he can read it, or offer to read it and expand on that section.
