const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..', '..');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
        LevelFormat, UnderlineType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType } = require(
  path.join(ROOT, '2. Writing', 'node_modules', 'docx')
);

const inputPath = path.join(ROOT, '3. Strategy', 'Ad hoc', 'mai-compute-ramp', '02-MAI-Compute-Ramp-Summary-Tables.md');
const outputPath = path.join(ROOT, '3. Strategy', 'Ad hoc', 'mai-compute-ramp', '02-MAI-Compute-Ramp-Summary-Tables.docx');

const md = fs.readFileSync(inputPath, 'utf-8');

// Strip front matter / raw notes
let content = md;
const rawIdx = content.indexOf('# Raw Notes');
if (rawIdx !== -1) content = content.substring(0, rawIdx);

const lines = content.split('\n');

const styles = {
  default: {
    document: {
      run: { font: "Aptos", size: 22 }
    }
  },
  paragraphStyles: [
    {
      id: "Title", name: "Title", basedOn: "Normal",
      run: { size: 56, color: "000000", font: "Aptos Display" },
      paragraph: { spacing: { before: 0, after: 60 }, alignment: AlignmentType.LEFT }
    },
    {
      id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 32, color: "2F5496", font: "Aptos Display" },
      paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 }
    },
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

function parseInline(text) {
  const runs = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push(new TextRun({ text: text.substring(lastIndex, match.index), font: "Aptos", size: 22 }));
    }
    if (match[2]) {
      runs.push(new TextRun({ text: match[2], bold: true, font: "Aptos", size: 22 }));
    } else if (match[3]) {
      runs.push(new TextRun({ text: match[3], italics: true, font: "Aptos", size: 22 }));
    } else if (match[4]) {
      runs.push(new TextRun({ text: match[4], font: "Consolas", size: 22 }));
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    runs.push(new TextRun({ text: text.substring(lastIndex), font: "Aptos", size: 22 }));
  }
  if (runs.length === 0) {
    runs.push(new TextRun({ text: text, font: "Aptos", size: 22 }));
  }
  return runs;
}

function parseInlineSmall(text, size = 16, bold = false) {
  const runs = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push(new TextRun({ text: text.substring(lastIndex, match.index), font: "Aptos", size, bold }));
    }
    if (match[2]) {
      runs.push(new TextRun({ text: match[2], bold: true, font: "Aptos", size }));
    } else if (match[3]) {
      runs.push(new TextRun({ text: match[3], italics: true, font: "Aptos", size }));
    } else if (match[4]) {
      runs.push(new TextRun({ text: match[4], font: "Consolas", size }));
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    runs.push(new TextRun({ text: text.substring(lastIndex), font: "Aptos", size, bold }));
  }
  if (runs.length === 0) {
    runs.push(new TextRun({ text, font: "Aptos", size, bold }));
  }
  return runs;
}

function toTitleCase(str) {
  const lowers = ['a','an','the','and','but','or','in','on','at','to','for','of','with','by','as','is'];
  return str.split(' ').map((w, i) => {
    if (i === 0) return w.charAt(0).toUpperCase() + w.slice(1);
    if (lowers.includes(w.toLowerCase())) return w.toLowerCase();
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
}

function toSentenceCase(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function parseTable(tableLines) {
  // Parse markdown table into rows of cells
  const rows = [];
  for (const line of tableLines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && !trimmed.match(/^\|[\s\-:|]+\|$/)) {
      const cells = trimmed.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(c => c.trim());
      rows.push(cells);
    }
  }
  if (rows.length === 0) return [];

  const colCount = rows[0].length;

  const tableRows = rows.map((row, rowIdx) => {
    const cells = row.map(cellText => {
      return new TableCell({
        children: [new Paragraph({
          children: parseInlineSmall(cellText, 16, rowIdx === 0),
          spacing: { after: 20 }
        })],
        width: { size: Math.floor(10000 / colCount), type: WidthType.DXA },
        shading: rowIdx === 0 ? { type: ShadingType.SOLID, color: "D9E2F3" } : undefined
      });
    });
    // Pad if needed
    while (cells.length < colCount) {
      cells.push(new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "", font: "Aptos", size: 16 })] })],
        width: { size: Math.floor(10000 / colCount), type: WidthType.DXA }
      }));
    }
    return new TableRow({ children: cells });
  });

  return [new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE }
  })];
}

const children = [];
let isFirstH1 = true;
let i = 0;
let inTable = false;
let tableBuffer = [];

while (i < lines.length) {
  const line = lines[i];
  const trimmed = line.trim();

  // Skip horizontal rules
  if (trimmed.match(/^-{3,}$/) || trimmed.match(/^\*{3,}$/)) {
    // Flush table if in one
    if (inTable && tableBuffer.length > 0) {
      children.push(...parseTable(tableBuffer));
      tableBuffer = [];
      inTable = false;
    }
    i++;
    continue;
  }

  // Detect table lines
  if (trimmed.startsWith('|')) {
    inTable = true;
    tableBuffer.push(trimmed);
    i++;
    continue;
  } else if (inTable && tableBuffer.length > 0) {
    children.push(...parseTable(tableBuffer));
    tableBuffer = [];
    inTable = false;
  }

  // Skip empty lines
  if (trimmed === '') { i++; continue; }

  // Headings
  if (trimmed.startsWith('### ')) {
    const text = trimmed.replace(/^###\s+/, '');
    children.push(new Paragraph({
      children: [new TextRun({ text, font: "Aptos", size: 22, underline: { type: UnderlineType.SINGLE } })],
      spacing: { before: 160, after: 80 }
    }));
    i++; continue;
  }
  if (trimmed.startsWith('## ')) {
    const text = trimmed.replace(/^##\s+/, '');
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_3,
      children: [new TextRun({ text, font: "Aptos Display", size: 24, color: "2F5496" })],
      spacing: { before: 160, after: 80 }
    }));
    i++; continue;
  }
  if (trimmed.startsWith('# ')) {
    const rawText = trimmed.replace(/^#\s+/, '');
    if (isFirstH1) {
      children.push(new Paragraph({
        heading: HeadingLevel.TITLE,
        children: [new TextRun({ text: toTitleCase(rawText), font: "Aptos Display", size: 56 })],
        spacing: { before: 0, after: 60 }
      }));
      isFirstH1 = false;
    } else {
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: toSentenceCase(rawText), font: "Aptos Display", size: 32, color: "2F5496" })],
        spacing: { before: 240, after: 120 }
      }));
    }
    i++; continue;
  }

  // Numbered list
  if (trimmed.match(/^\d+\.\s/)) {
    const text = trimmed.replace(/^\d+\.\s/, '');
    children.push(new Paragraph({
      children: parseInline(text),
      numbering: { reference: "numbered-list", level: 0 },
      spacing: { after: 40 }
    }));
    i++; continue;
  }

  // Bullet list (nested)
  if (line.match(/^(\s{2,}|\t)[-*]\s/)) {
    const text = trimmed.replace(/^[-*]\s/, '');
    children.push(new Paragraph({
      children: parseInline(text),
      numbering: { reference: "bullet-list", level: 1 },
      spacing: { after: 20 }
    }));
    i++; continue;
  }

  // Bullet list (top level)
  if (trimmed.match(/^[-*]\s/)) {
    const text = trimmed.replace(/^[-*]\s/, '');
    children.push(new Paragraph({
      children: parseInline(text),
      numbering: { reference: "bullet-list", level: 0 },
      spacing: { after: 40 }
    }));
    i++; continue;
  }

  // Regular paragraph
  children.push(new Paragraph({
    children: parseInline(trimmed),
    spacing: { after: 120 }
  }));
  i++;
}

// Flush remaining table
if (inTable && tableBuffer.length > 0) {
  children.push(...parseTable(tableBuffer));
}

const doc = new Document({
  styles,
  numbering,
  sections: [{ children }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log('Created: ' + outputPath);
});
