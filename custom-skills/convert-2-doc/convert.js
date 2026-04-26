const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  LevelFormat,
  HeadingLevel,
  UnderlineType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  BorderStyle,
} = require("docx");

const PROJECT_ROOT = "C:/Users/majidmohamed/Microsoft/MAI - Strategy - 11. MSI strategy/1. Ad hoc/0. Maj Working Folder";
const INPUT_PATH = path.join(PROJECT_ROOT, "2. Writing/Ad hoc/MSI All Hands - Q&A Prep.md");
const OUTPUT_PATH = path.join(PROJECT_ROOT, "2. Writing/Ad hoc/MSI All Hands - Q&A Prep.docx");

// --- Read markdown ---
let md = fs.readFileSync(INPUT_PATH, "utf-8");

// Strip raw notes if present
const rawIdx = md.indexOf("# Raw Notes");
if (rawIdx !== -1) {
  const hrBefore = md.lastIndexOf("---", rawIdx);
  md = md.substring(0, hrBefore !== -1 ? hrBefore : rawIdx).trim();
}

// --- Title case helper ---
const minorWords = new Set(["a","an","the","and","but","or","nor","in","on","at","to","for","of","with","by","as","is","if","so","yet"]);
function toTitleCase(str) {
  return str.split(" ").map((w, i) => {
    if (i === 0) return w.charAt(0).toUpperCase() + w.slice(1);
    if (minorWords.has(w.toLowerCase())) return w.toLowerCase();
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(" ");
}

function toSentenceCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Inline formatting parser (bold, italic, inline code) ---
function parseInline(text) {
  const runs = [];
  // Match **bold**, *italic*, `code` - bold must be checked before italic
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push(new TextRun({ text: text.substring(lastIndex, match.index) }));
    }
    if (match[2]) {
      runs.push(new TextRun({ text: match[2], bold: true }));
    } else if (match[4]) {
      runs.push(new TextRun({ text: match[4], italics: true }));
    } else if (match[6]) {
      runs.push(new TextRun({ text: match[6], font: "Consolas" }));
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    runs.push(new TextRun({ text: text.substring(lastIndex) }));
  }
  if (runs.length === 0) {
    runs.push(new TextRun({ text }));
  }
  return runs;
}

// --- Parse markdown into blocks ---
const lines = md.split("\n");
const blocks = [];
let isFirstHeading = true;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.trim() === "") continue;
  if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) continue;

  // ### heading -> underlined plain text
  const h3Match = line.match(/^###\s+(.+)/);
  if (h3Match) {
    blocks.push({ type: "underline-heading", text: h3Match[1] });
    continue;
  }

  // ## heading -> Heading 3
  const h2Match = line.match(/^##\s+(.+)/);
  if (h2Match) {
    blocks.push({ type: "heading3", text: h2Match[1] });
    continue;
  }

  // # heading -> Title (first) or Heading 1 (subsequent)
  const h1Match = line.match(/^#\s+(.+)/);
  if (h1Match) {
    if (isFirstHeading) {
      blocks.push({ type: "title", text: toTitleCase(h1Match[1]) });
      isFirstHeading = false;
    } else {
      blocks.push({ type: "heading1", text: toSentenceCase(h1Match[1]) });
    }
    continue;
  }

  // Nested bullet (2+ spaces or tab before - or *)
  const nestedBullet = line.match(/^(\s{2,}|\t+)[-*]\s+(.+)/);
  if (nestedBullet) {
    blocks.push({ type: "bullet", level: 1, text: nestedBullet[2] });
    continue;
  }

  // Top-level bullet
  const bullet = line.match(/^[-*]\s+(.+)/);
  if (bullet) {
    blocks.push({ type: "bullet", level: 0, text: bullet[1] });
    continue;
  }

  // Numbered list
  const numbered = line.match(/^\d+\.\s+(.+)/);
  if (numbered) {
    blocks.push({ type: "numbered", level: 0, text: numbered[1] });
    continue;
  }

  // Standalone bold line as section header (e.g., **Path to Build**)
  const boldHeaderMatch = line.match(/^\*\*(.+?)\*\*\s*$/);
  if (boldHeaderMatch && !line.startsWith("-") && !line.startsWith(" ")) {
    if (isFirstHeading) {
      blocks.push({ type: "title", text: toTitleCase(boldHeaderMatch[1]) });
      isFirstHeading = false;
    } else {
      blocks.push({ type: "heading1", text: boldHeaderMatch[1] });
    }
    continue;
  }

  // Blockquote
  const bq = line.match(/^>\s+(.*)/);
  if (bq) {
    blocks.push({ type: "blockquote", text: bq[1] });
    continue;
  }

  // Table detection: line has pipes and next line is separator
  if (line.includes("|") && i + 1 < lines.length && /^[\s|:-]+$/.test(lines[i + 1])) {
    const tableRows = [];
    let ti = i;
    while (ti < lines.length && lines[ti].includes("|") && lines[ti].trim() !== "") {
      tableRows.push(lines[ti]);
      ti++;
    }
    blocks.push({ type: "table", rows: tableRows });
    i = ti - 1; // -1 because for loop increments
    continue;
  }

  // Regular paragraph
  blocks.push({ type: "paragraph", text: line.trim() });
}

// --- Build docx paragraphs ---
const paragraphs = [];

for (const block of blocks) {
  switch (block.type) {
    case "title":
      paragraphs.push(new Paragraph({
        style: "Title",
        children: [new TextRun({ text: block.text, font: "Aptos Display", size: 56 })],
        spacing: { before: 0, after: 60 },
      }));
      break;

    case "heading1":
      paragraphs.push(new Paragraph({
        style: "Heading1",
        children: [new TextRun({ text: block.text, font: "Aptos Display", size: 32, color: "2F5496" })],
        spacing: { before: 240, after: 120 },
      }));
      break;

    case "heading3":
      paragraphs.push(new Paragraph({
        style: "Heading3",
        children: [new TextRun({ text: block.text, font: "Aptos Display", size: 24, color: "2F5496" })],
        spacing: { before: 160, after: 80 },
      }));
      break;

    case "underline-heading":
      paragraphs.push(new Paragraph({
        children: [new TextRun({
          text: block.text,
          underline: { type: UnderlineType.SINGLE },
        })],
        spacing: { before: 160, after: 80 },
      }));
      break;

    case "bullet":
      paragraphs.push(new Paragraph({
        numbering: { reference: "bullet-list", level: block.level },
        children: parseInline(block.text),
        spacing: { after: block.level === 0 ? 40 : 20 },
      }));
      break;

    case "numbered":
      paragraphs.push(new Paragraph({
        numbering: { reference: "numbered-list", level: block.level },
        children: parseInline(block.text),
        spacing: { after: 40 },
      }));
      break;

    case "blockquote":
      paragraphs.push(new Paragraph({
        indent: { left: 720 },
        children: parseInline(block.text).map(r => {
          // TextRun doesn't have a mutable italics prop easily, so rebuild
          return new TextRun({ text: r.root && r.root[1] ? r.root[1].text : block.text, italics: true });
        }),
        spacing: { after: 120 },
      }));
      break;

    case "paragraph":
      paragraphs.push(new Paragraph({
        children: parseInline(block.text),
        spacing: { after: 120 },
      }));
      break;

    case "table": {
      const parseTableRow = (rowLine) =>
        rowLine.split("|").map(c => c.trim()).filter(c => c !== "");
      const headerCells = parseTableRow(block.rows[0]);
      const dataRows = block.rows.slice(2).map(parseTableRow); // skip separator
      const colCount = headerCells.length;

      const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" };
      const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

      const wordRows = [];
      // Header
      wordRows.push(new TableRow({
        children: headerCells.map(cell => new TableCell({
          borders,
          shading: { fill: "D9E2F3", type: ShadingType.CLEAR },
          children: [new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [new TextRun({ text: cell, bold: true, font: "Aptos", size: 20 })],
          })],
        })),
      }));
      // Data rows
      for (const row of dataRows) {
        const cells = [];
        for (let ci = 0; ci < colCount; ci++) {
          const cellText = ci < row.length ? row[ci] : "";
          cells.push(new TableCell({
            borders,
            children: [new Paragraph({
              spacing: { before: 40, after: 40 },
              children: parseInline(cellText),
            })],
          }));
        }
        wordRows.push(new TableRow({ children: cells }));
      }

      paragraphs.push(new Table({
        rows: wordRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      }));
      // Spacing after table
      paragraphs.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
      break;
    }
  }
}

// --- Create document ---
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Aptos", size: 22 },
      },
    },
    paragraphStyles: [
      {
        id: "Title", name: "Title", basedOn: "Normal",
        run: { size: 56, color: "000000", font: "Aptos Display" },
        paragraph: { spacing: { before: 0, after: 60 }, alignment: AlignmentType.LEFT },
      },
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, color: "2F5496", font: "Aptos Display" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, color: "2F5496", font: "Aptos Display" },
        paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullet-list",
        levels: [
          {
            level: 0, format: LevelFormat.BULLET, text: "\u00B7",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 720, hanging: 360 } },
              run: { font: "Symbol" },
            },
          },
          {
            level: 1, format: LevelFormat.BULLET, text: "\u25E6",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 1440, hanging: 360 } },
            },
          },
        ],
      },
      {
        reference: "numbered-list",
        levels: [
          {
            level: 0, format: LevelFormat.DECIMAL, text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
          {
            level: 1, format: LevelFormat.DECIMAL, text: "%2.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1440, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    children: paragraphs,
  }],
});

// --- Write file ---
(async () => {
  try {
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(OUTPUT_PATH, buffer);
    console.log("SUCCESS: Document saved to:");
    console.log(OUTPUT_PATH);
    console.log("File size: " + (buffer.length / 1024).toFixed(1) + " KB");
  } catch (err) {
    console.error("ERROR:", err);
    process.exit(1);
  }
})();
