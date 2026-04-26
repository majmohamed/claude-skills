const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
        LevelFormat, UnderlineType, Table, TableRow, TableCell, WidthType,
        BorderStyle, ShadingType } = require('docx');

// Read the markdown file
const mdPath = path.resolve(__dirname, '../../../3. Strategy/Ad hoc/Nebius loan for inferencing/260318 Nebius Loan for Inferencing - SLT Memo.md');
const content = fs.readFileSync(mdPath, 'utf-8');

// Parse inline formatting: **bold**, *italic*, `code`
function parseInlineFormatting(text) {
  const runs = [];
  // Pattern: **bold**, *italic*, `code`, or plain text
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|([^*`]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      // Bold
      runs.push(new TextRun({ text: match[2], bold: true, font: "Aptos", size: 22 }));
    } else if (match[4]) {
      // Italic
      runs.push(new TextRun({ text: match[4], italics: true, font: "Aptos", size: 22 }));
    } else if (match[6]) {
      // Code
      runs.push(new TextRun({ text: match[6], font: "Consolas", size: 22 }));
    } else if (match[7]) {
      // Plain text
      runs.push(new TextRun({ text: match[7], font: "Aptos", size: 22 }));
    }
  }
  return runs.length > 0 ? runs : [new TextRun({ text, font: "Aptos", size: 22 })];
}

// Parse table from markdown lines
function parseTable(lines) {
  const rows = [];
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip separator rows
    if (/^\|[\s\-:|]+\|$/.test(trimmed)) continue;
    // Parse cells
    const cells = trimmed.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(c => c.trim());
    rows.push(cells);
  }
  return rows;
}

function createTableParagraph(cellText, isHeader) {
  const runs = parseInlineFormatting(cellText);
  if (isHeader) {
    runs.forEach(r => { r.root[1].bold = true; });
  }
  return new Paragraph({
    children: runs,
    spacing: { before: 20, after: 20 }
  });
}

function buildWordTable(tableRows) {
  if (tableRows.length === 0) return null;
  const numCols = tableRows[0].length;

  const wordRows = tableRows.map((row, rowIdx) => {
    const cells = row.map(cellText => {
      return new TableCell({
        children: [createTableParagraph(cellText, rowIdx === 0)],
        shading: rowIdx === 0 ? { type: ShadingType.SOLID, color: "E8E8E8" } : undefined,
        width: { size: Math.floor(9000 / numCols), type: WidthType.DXA }
      });
    });
    // Pad if row has fewer cells
    while (cells.length < numCols) {
      cells.push(new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "", font: "Aptos", size: 22 })] })],
        width: { size: Math.floor(9000 / numCols), type: WidthType.DXA }
      }));
    }
    return new TableRow({ children: cells });
  });

  return new Table({
    rows: wordRows,
    width: { size: 9000, type: WidthType.DXA }
  });
}

// Title case helper
function toTitleCase(str) {
  const minorWords = ['a', 'an', 'the', 'and', 'but', 'or', 'nor', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'as'];
  return str.split(' ').map((word, i) => {
    if (i === 0) return word.charAt(0).toUpperCase() + word.slice(1);
    if (minorWords.includes(word.toLowerCase())) return word.toLowerCase();
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

// Parse the markdown
const lines = content.split('\n');
const elements = [];
let isFirstHeading = true;
let i = 0;
let tableBuffer = [];
let inTable = false;

while (i < lines.length) {
  const line = lines[i];
  const trimmed = line.trim();

  // Detect table start
  if (trimmed.startsWith('|') && !inTable) {
    inTable = true;
    tableBuffer = [trimmed];
    i++;
    continue;
  }

  // Continue table
  if (inTable && trimmed.startsWith('|')) {
    tableBuffer.push(trimmed);
    i++;
    continue;
  }

  // End of table
  if (inTable && !trimmed.startsWith('|')) {
    inTable = false;
    const tableRows = parseTable(tableBuffer);
    const wordTable = buildWordTable(tableRows);
    if (wordTable) {
      elements.push(wordTable);
      elements.push(new Paragraph({ children: [], spacing: { after: 120 } }));
    }
    tableBuffer = [];
    // Don't increment i, process current line
  }

  // Skip horizontal rules
  if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
    i++;
    continue;
  }

  // Skip footnotes with backslash-star
  if (trimmed.startsWith('\\*')) {
    elements.push(new Paragraph({
      children: [new TextRun({ text: trimmed.replace('\\*', '*'), font: "Aptos", size: 18, italics: true })],
      spacing: { after: 80 }
    }));
    i++;
    continue;
  }

  // Empty line
  if (trimmed === '') {
    i++;
    continue;
  }

  // Title / H1 heading
  if (/^# /.test(trimmed) && !/^## /.test(trimmed)) {
    const text = trimmed.replace(/^# /, '');
    if (isFirstHeading) {
      elements.push(new Paragraph({
        children: [new TextRun({ text: toTitleCase(text), font: "Aptos Display", size: 56 })],
        heading: HeadingLevel.TITLE,
        spacing: { before: 0, after: 60 }
      }));
      isFirstHeading = false;
    } else {
      elements.push(new Paragraph({
        children: [new TextRun({ text, font: "Aptos Display", size: 32, color: "2F5496" })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 }
      }));
    }
    i++;
    continue;
  }

  // H2 heading -> Heading 3
  if (/^## /.test(trimmed) && !/^### /.test(trimmed)) {
    const text = trimmed.replace(/^## /, '');
    elements.push(new Paragraph({
      children: [new TextRun({ text, font: "Aptos Display", size: 24, color: "2F5496" })],
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 160, after: 80 }
    }));
    i++;
    continue;
  }

  // H3 heading -> underlined plain text
  if (/^### /.test(trimmed)) {
    const text = trimmed.replace(/^### /, '');
    elements.push(new Paragraph({
      children: [new TextRun({ text, font: "Aptos", size: 22, underline: { type: UnderlineType.SINGLE } })],
      spacing: { before: 160, after: 80 }
    }));
    i++;
    continue;
  }

  // Numbered list
  if (/^\d+\.\s/.test(trimmed)) {
    const text = trimmed.replace(/^\d+\.\s/, '');
    const runs = parseInlineFormatting(text);
    elements.push(new Paragraph({
      children: runs,
      numbering: { reference: "numbered-list", level: 0 },
      spacing: { after: 40 }
    }));
    i++;
    continue;
  }

  // Bullet list (level 0)
  if (/^[-*]\s/.test(trimmed)) {
    const text = trimmed.replace(/^[-*]\s/, '');
    const runs = parseInlineFormatting(text);
    elements.push(new Paragraph({
      children: runs,
      numbering: { reference: "bullet-list", level: 0 },
      spacing: { after: 40 }
    }));
    i++;
    continue;
  }

  // Nested bullet (level 1)
  if (/^\s{2,}[-*]\s/.test(line)) {
    const text = line.trim().replace(/^[-*]\s/, '');
    const runs = parseInlineFormatting(text);
    elements.push(new Paragraph({
      children: runs,
      numbering: { reference: "bullet-list", level: 1 },
      spacing: { after: 20 }
    }));
    i++;
    continue;
  }

  // Regular paragraph
  const runs = parseInlineFormatting(trimmed);
  elements.push(new Paragraph({
    children: runs,
    spacing: { after: 120 }
  }));
  i++;
}

// Flush any remaining table
if (inTable && tableBuffer.length > 0) {
  const tableRows = parseTable(tableBuffer);
  const wordTable = buildWordTable(tableRows);
  if (wordTable) {
    elements.push(wordTable);
  }
}

// Build the document
const doc = new Document({
  styles: {
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
  },
  numbering: {
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
  },
  sections: [{ children: elements }]
});

// Save the document
const outputPath = path.resolve(__dirname, '../../../3. Strategy/Ad hoc/Nebius loan for inferencing/260318 Nebius Loan for Inferencing - SLT Memo.docx');
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log('Document saved to:', outputPath);
}).catch(err => {
  console.error('Error generating document:', err);
});
