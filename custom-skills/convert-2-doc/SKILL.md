---
name: convert-2-doc
description: Convert a markdown file into a professionally formatted Word document (.docx) using docx-js. Applies Aptos 11pt body text, Word-styled headings (not bold), and proper bullet lists. Saves output to the relevant folder within 2. Writing/.
---

# Convert Markdown to Word Document

## Overview

Takes a markdown file (or pasted markdown content) and converts it into a clean, professionally formatted Word document using the `docx-js` library. The output follows Maj's specific formatting preferences — not the docx-js defaults.

**IMPORTANT — No Confirmations**: Run end-to-end without pausing. Read the markdown, generate the .docx, save it, and confirm. Only ask a question if the save location is genuinely ambiguous.

---

## Inputs

- **Markdown source** — one of:
  - A file path to an existing `.md` file
  - Pasted markdown content in the chat
- **Save location** (optional) — subfolder within `2. Writing/`. If not specified, infer from the content or ask.

### Clean Notes Only Rule

**CRITICAL**: When converting a meeting notes file, only convert the **clean formatted sections at the top** of the file. Meeting notes follow the template in `1. MeetingNotes/CLAUDE.md` and have this structure:

```
# Meeting Title           <-- INCLUDE
Date                      <-- INCLUDE
## Agenda                 <-- INCLUDE
## Actions                <-- INCLUDE
## Conclusions            <-- INCLUDE
## Slack Summary          <-- INCLUDE (if present)
---                       <-- STOP HERE
# Raw Notes              <-- EXCLUDE everything from here down
[original rough notes]    <-- EXCLUDE
```

- **Stop at the `# Raw Notes` header** (or the `---` horizontal rule immediately before it). Do not include any content from `# Raw Notes` onward.
- If the file has no `# Raw Notes` section, convert the entire file as normal.
- The goal is to only ever produce a Word doc from clean, structured content - never from rough unformatted notes.
- When reading the source markdown, strip everything from the line matching `# Raw Notes` (or the `---` immediately preceding it) to the end of the file before parsing.

---

## Formatting Specification

### Font & Size

| Element | Font | Size | Spacing After | Notes |
|---------|------|------|---------------|-------|
| Body text | Aptos | 11pt (size: 22) | 120 (6pt) | Default for all text |
| Title (`#` at top of doc) | Aptos Display | 28pt (size: 56) | 60 (3pt) | Word Title style, NOT bold, Title Case |
| Heading 1 (`#`) | Aptos Display | 16pt (size: 32) | 120 (6pt) | Word Heading 1 style, NOT bold, color #2F5496, Sentence case |
| Heading 3 (`##`) | Aptos Display | 12pt (size: 24) | 80 (4pt) | Word Heading 3 style, NOT bold, color #2F5496 |
| Underlined text (`###`) | Aptos | 11pt (size: 22) | 80 (4pt) | Plain body text with underline, NOT bold |

### Title Casing

- **Title** (`#` first occurrence): Apply **Word Title Case** - capitalise the first letter of each major word. Articles (a, an, the), conjunctions (and, but, or), and short prepositions (in, on, at, to, for, of, with, by) stay lowercase unless they're the first word. Example: `AIC: VLM Mainline Integration`, `AIC: Data Strategy and Self-Sufficiency`
- **Heading 1** (`#` subsequent): Use **sentence case** - capitalise only the first word and proper nouns. Example: `Action items`, `VLM integration status and dependencies`, `Post-training and serving infrastructure`

### Paragraph Spacing

Use `spacing: { after: N }` on paragraphs to create clean visual separation:

| Element | Spacing Before | Spacing After |
|---------|---------------|---------------|
| Title | 0 | 60 |
| Heading 1 | 240 | 120 |
| Heading 3 | 160 | 80 |
| Body paragraph | 0 | 120 |
| Bullet item (level 0) | 0 | 40 |
| Bullet item (level 1) | 0 | 20 |
| Underlined subheading | 160 | 80 |

### Heading Mapping

Markdown headings map to Word styles as follows:

| Markdown | Word Style | Casing | Rationale |
|----------|-----------|--------|-----------|
| `#` (first occurrence only) | **Title** | Title Case | Document title |
| `#` (subsequent) | **Heading 1** | Sentence case | Top-level sections |
| `##` | **Heading 3** | As-is | Sub-sections (skips Heading 2 for visual hierarchy) |
| `###` | **Plain text, underlined** | As-is | Minor sub-headings rendered as emphasised body text |

**CRITICAL**: Headings must NOT be bold. Word's styled headings use colour and size for hierarchy, not bold weight.

### Lists & Bullets

- Use **proper Word bullet lists** via numbering config with `LevelFormat.BULLET` — NEVER use unicode bullet characters
- Markdown `-` or `*` list items → Word bullet list
- Markdown `1.` numbered items → Word numbered list with `LevelFormat.DECIMAL`
- Nested lists: support at least 2 levels of indent (level 0 and level 1)

### Other Formatting

| Markdown | Word |
|----------|------|
| `**bold**` | Bold TextRun |
| `*italic*` | Italic TextRun |
| `---` / `***` | Page break or omit (context-dependent) |
| `> blockquote` | Indented paragraph (left indent: 720) with italic |
| `` `inline code` `` | Consolas font, same size |
| Code blocks | Consolas font, light grey background shading |

---

## Implementation

### Prerequisites

The `docx` npm package is installed at `2. Writing/node_modules/docx`. No install needed.

### Requiring docx - CRITICAL

**Always use an absolute path to require docx.** Relative paths break depending on where the script lives. Use this pattern:

```javascript
const fs = require("fs");
const path = require("path");
const BASE = "C:\\Users\\majidmohamed\\Microsoft\\MAI - Strategy - 11. MSI strategy\\1. Ad hoc\\0. Maj Working Folder";
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
        LevelFormat, UnderlineType, ShadingType, Table, TableRow, TableCell,
        BorderStyle, WidthType } = require(path.join(BASE, "2. Writing", "node_modules", "docx"));
```

**NEVER** use `require('docx')` or `require(path.resolve(__dirname, ...))` - the global install may not exist and relative paths are fragile with deeply nested source files.

### Script Structure

Generate a JavaScript file that:

1. **Reads the markdown** - parse the `.md` file content
2. **Parses markdown into blocks** - split into headings, paragraphs, bullets, etc.
3. **Builds the docx** - using docx-js with the styles below
4. **Saves the .docx** - to the output path (same folder as source, or `2. Writing/` subfolder for meeting notes)

### Required Style Configuration

```javascript
// BASE and require already set up above - do not re-require

const styles = {
  default: {
    document: {
      run: { font: "Aptos", size: 22 }  // 11pt Aptos default
    }
  },
  paragraphStyles: [
    // Title — for the first # heading (Title Case)
    {
      id: "Title", name: "Title", basedOn: "Normal",
      run: { size: 56, color: "000000", font: "Aptos Display" },
      paragraph: { spacing: { before: 0, after: 60 }, alignment: AlignmentType.LEFT }
    },
    // Heading 1 — for subsequent # headings (sentence case)
    {
      id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 32, color: "2F5496", font: "Aptos Display" },
      paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 }
    },
    // Heading 3 — for ## headings (we skip Heading 2)
    {
      id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 24, color: "2F5496", font: "Aptos Display" },
      paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 }
    }
  ]
};

const numbering = {
  config: [
    {
      reference: "bullet-list",
      levels: [
        { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1440, hanging: 360 } } } }
      ]
    },
    {
      reference: "numbered-list",
      levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.DECIMAL, text: "%2.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1440, hanging: 360 } } } }
      ]
    }
  ]
};
```

### Markdown Parsing Logic

When parsing the markdown content:

**Step 0 — Strip raw notes**: Before any parsing, check if the content contains a `# Raw Notes` line. If it does, truncate the content at that line (or at the `---` horizontal rule immediately above it). Only the clean formatted notes above that boundary should be parsed and converted.

Then handle these elements in order:

1. **Title detection**: The first `#` heading in the document → `HeadingLevel.TITLE`. **Apply Title Case** - capitalise each major word, lowercase articles/conjunctions/short prepositions unless first word.
2. **`#` headings** (after the first) → `HeadingLevel.HEADING_1`. **Apply sentence case** - capitalise only first word and proper nouns.
3. **`##` headings** → `HeadingLevel.HEADING_3` (maps to Word Heading 3)
4. **`###` headings** → Plain `Paragraph` with `underline: { type: UnderlineType.SINGLE }`
5. **Bullet items** (`- ` or `* `) → `Paragraph` with `numbering: { reference: "bullet-list", level: 0 }`
6. **Nested bullets** (indented `- ` or `* `) → `numbering: { reference: "bullet-list", level: 1 }`
7. **Numbered items** (`1. `) → `Paragraph` with `numbering: { reference: "numbered-list", level: 0 }`
8. **Bold text** (`**text**`) → `TextRun({ text, bold: true })`
9. **Italic text** (`*text*`) → `TextRun({ text, italics: true })`
10. **Inline code** (`` `text` ``) → `TextRun({ text, font: "Consolas" })`
11. **Blockquotes** (`> text`) → `Paragraph` with `indent: { left: 720 }` and italic
12. **Horizontal rules** (`---`) → skip or insert a `PageBreak` if it's a major section divider
13. **Blank lines** → paragraph spacing (don't create empty paragraphs)
14. **Regular paragraphs** → `Paragraph` with `TextRun` children

**Inline formatting**: Parse `**bold**`, `*italic*`, and `` `code` `` within any line, splitting into multiple `TextRun` children as needed.

---

## Save Location

### Determining the output path

1. **If the user specifies a folder** - use it
2. **If converting a file from `2. Writing/`** - save the .docx in the same subfolder
3. **If converting a file from `1. MeetingNotes/`** - use the meeting-to-writing folder map below
4. **If converting from any other location** (e.g. `3. Strategy/`, `3. Adhoc/`, etc.) - save the .docx in the same folder as the source .md file. Don't ask, don't redirect to `2. Writing/`

### Meeting Notes to Writing Folder Map

When converting files from `1. MeetingNotes/`, automatically route to the correct `2. Writing/` subfolder:

| MeetingNotes subfolder | Writing subfolder |
|----------------------|-------------------|
| `AI Council + SPR` | `AI Council notes` |
| `Infra - SCW, Maia, Apollo, SLT` | `SCW notes` |
| Any other subfolder | Ask the user, or save to `2. Writing/` root |

This avoids needing to ask every time - the mapping is deterministic for the main meeting types.

### File naming

- **AI Council notes**: Use the format `[YYMMDD] AIC minutes - [Topic].docx`. Extract the date and topic from the source filename or title heading. Examples:
  - `260211 AI council - VLM.md` → `260211 AIC minutes - VLM.docx`
  - `260128 AIC - MAI Playground and MAIDAS.md` → `260128 AIC minutes - MAI Playground and MAIDAS.docx`
- **All other files**: Use the same base name as the source markdown file, with `.docx` extension
  - Example: `260215 Weekly Update.md` → `260215 Weekly Update.docx`
- If from pasted content, ask for a filename or generate from the title heading

### Output path format

```
2. Writing/[subfolder]/[filename].docx
```

Current subfolders in `2. Writing/`:
- `AI Council notes`
- `Forbes 30 Under 30`
- `General Mustafa writings`
- `Maj weekly updates`
- `Satya weekly updates`
- `SCW notes`

---

## Execution Steps

1. **Read the markdown** - from file path or pasted content
2. **Strip raw notes** - if the content contains `# Raw Notes`, truncate everything from that header (and the `---` above it) downward. Only the clean top sections proceed.
3. **Parse into blocks** - headings, paragraphs, bullets, inline formatting
4. **Generate the conversion script** - JavaScript file saved next to the source file (same folder). Use the absolute `BASE` path pattern to require docx.
5. **Run the script** - execute with Node.js to produce the .docx
6. **Clean up** - delete the temporary .js script after successful generation
7. **Confirm completion** - show the output path and a brief summary

```bash
# Run the generated script (saved next to the source file)
node "/full/path/to/generate-doc.js"
# Then clean up
rm "/full/path/to/generate-doc.js"
```

---

## Edge Cases

- **Files with `# Raw Notes` section**: Always strip everything from `# Raw Notes` downward. The doc should only contain clean, formatted content.
- **Files with no clean sections**: If a file has only raw notes and no structured top section, warn the user that the notes need to be processed/tidied first (via the process-meeting skill) before converting to doc.
- **Tables in markdown**: Convert to Word tables using docx-js Table/TableRow/TableCell. Apply Aptos 11pt, light grey header shading.
- **Links**: Render as blue underlined text (ExternalHyperlink if URL available, otherwise plain text with the URL in parentheses).
- **Images**: Skip with a note to the user (images need manual insertion).
- **Front matter** (`---` YAML blocks at top): Strip and ignore.
- **Empty document**: Warn the user, don't generate an empty .docx.

---

## File References

| Resource | Path (relative to project root) |
|----------|-------------------------------|
| docx-js reference | `anthropic-skills/skills/docx/docx-js.md` |
| docx SKILL.md | `anthropic-skills/skills/docx/SKILL.md` |
| Meeting notes template | `1. MeetingNotes/CLAUDE.md` (defines raw notes boundary for Clean Notes Only rule) |
| Writing output folder | `2. Writing/` |
| Node modules for docx | `2. Writing/node_modules/` |
| This skill | `5. Automations/skills/convert-2-doc/` |

---

## Example

### Input markdown

```markdown
# Weekly Infrastructure Update
15 February 2026

## Compute Allocation

Current state of GPU allocation across datacenters:

- **Phoenix**: 85% utilized, 12k H100s online
- **Des Moines**: Ramp in progress, targeting 8k by March
- **Stockholm**: On hold pending power delivery

### Open Risks

- Power delivery in Stockholm delayed by 3 weeks
- Cooling capacity in Phoenix approaching limits

## Next Steps

- Finalize Des Moines ramp schedule with ops team
- Escalate Stockholm power issue to Kevin
```

### Output

A Word document saved to `2. Writing/[appropriate subfolder]/Weekly Infrastructure Update.docx` with:

- "Weekly Infrastructure Update" as Word Title style (Aptos Display 28pt, not bold, Title Case)
- "15 February 2026" as body text (Aptos 11pt)
- "Compute allocation" as Word Heading 1 (Aptos Display 16pt, #2F5496, not bold, sentence case)
- Body text in Aptos 11pt with 6pt spacing after
- Proper Word bullet lists (not unicode) with 2pt spacing after
- "Open Risks" as underlined plain text (Aptos 11pt, underlined, not bold)
- "Next steps" as Word Heading 1 (sentence case)
