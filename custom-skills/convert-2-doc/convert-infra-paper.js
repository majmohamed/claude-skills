const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle } = require('docx');

// Read the markdown file
const mdPath = 'C:\\Users\\majidmohamed\\Microsoft\\MAI - Strategy - 11. MSI strategy\\1. Ad hoc\\0. Maj Working Folder\\3. Adhoc\\State of the Union - AI Training Infra\\State of the Union - AI Training Infra.md';
const content = fs.readFileSync(mdPath, 'utf-8');

// Parse markdown into structured content
const lines = content.split('\n');
const children = [];
let firstHeading = true;
let inBulletList = false;
let tableLines = [];
let inTable = false;

// Helper to apply title case
function toTitleCase(str) {
  const smallWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'in', 'of', 'with'];
  return str.split(' ').map((word, index) => {
    if (index === 0 || !smallWords.includes(word.toLowerCase())) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    return word.toLowerCase();
  }).join(' ');
}

// Helper to parse inline formatting - NO font/size properties to avoid conflicts
function parseInline(text) {
  const runs = [];
  let currentText = '';
  let i = 0;

  while (i < text.length) {
    if (text[i] === '*' && text[i+1] === '*') {
      if (currentText) {
        runs.push(new TextRun({ text: currentText }));
        currentText = '';
      }
      i += 2;
      let boldText = '';
      while (i < text.length && !(text[i] === '*' && text[i+1] === '*')) {
        boldText += text[i];
        i++;
      }
      runs.push(new TextRun({ text: boldText, bold: true }));
      i += 2;
    } else {
      currentText += text[i];
      i++;
    }
  }

  if (currentText) {
    runs.push(new TextRun({ text: currentText }));
  }

  return runs.length > 0 ? runs : [new TextRun({ text: text })];
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Skip horizontal rules and empty lines
  if (line.trim() === '---' || line.trim() === '') {
    inBulletList = false;
    continue;
  }

  // Table detection
  if (line.trim().startsWith('|')) {
    if (!inTable) {
      inTable = true;
      tableLines = [];
    }
    tableLines.push(line);
    continue;
  } else if (inTable) {
    // End of table - process it
    inTable = false;
    const tableRows = tableLines.filter(l => !l.includes('---')); // Remove separator line

    if (tableRows.length > 0) {
      const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
      const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

      const rows = tableRows.map((row, rowIndex) => {
        const cells = row.split('|').filter(c => c.trim()).map(c => c.trim());
        return new TableRow({
          tableHeader: rowIndex === 0,
          children: cells.map(cellText => new TableCell({
            borders: cellBorders,
            width: { size: 3000, type: WidthType.DXA },
            shading: rowIndex === 0 ? { fill: "D5E8F0", type: ShadingType.CLEAR } : undefined,
            children: [new Paragraph({
              alignment: rowIndex === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
              children: [new TextRun({
                text: cellText,
                bold: rowIndex === 0
              })]
            })]
          }))
        });
      });

      children.push(new Table({
        columnWidths: [3000, 1500, 5000],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: rows
      }));

      children.push(new Paragraph({ text: '', spacing: { after: 240 } }));
    }
    tableLines = [];
  }

  // Heading detection
  if (line.startsWith('# ')) {
    inBulletList = false;
    const headingText = line.substring(2);
    if (firstHeading) {
      children.push(new Paragraph({
        heading: HeadingLevel.TITLE,
        children: [new TextRun({ text: toTitleCase(headingText) })],
        spacing: { after: 60 }
      }));
      firstHeading = false;
    } else {
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: headingText })],
        spacing: { before: 240, after: 120 }
      }));
    }
    continue;
  }

  if (line.startsWith('## ')) {
    inBulletList = false;
    const headingText = line.substring(3);
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_3,
      children: [new TextRun({ text: headingText })],
      spacing: { before: 160, after: 80 }
    }));
    continue;
  }

  // Bullet list detection
  if (line.trim().startsWith('- ')) {
    const bulletText = line.trim().substring(2);
    children.push(new Paragraph({
      numbering: { reference: "bullet-list", level: 0 },
      children: parseInline(bulletText),
      spacing: { after: 40 }
    }));
    inBulletList = true;
    continue;
  }

  // Sub-bullet detection (indented)
  if (line.trim().startsWith('  - ')) {
    const bulletText = line.trim().substring(4);
    children.push(new Paragraph({
      numbering: { reference: "bullet-list", level: 1 },
      children: parseInline(bulletText),
      spacing: { after: 20 }
    }));
    continue;
  }

  // Regular paragraph
  if (line.trim()) {
    inBulletList = false;
    children.push(new Paragraph({
      children: parseInline(line),
      spacing: { after: 120 }
    }));
  }
}

// Create document with consistent bullet formatting
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Aptos", size: 22 }  // 11pt Aptos default
      }
    },
    paragraphStyles: [
      {
        id: "Title",
        name: "Title",
        basedOn: "Normal",
        run: { size: 56, color: "000000", font: "Aptos Display" },
        paragraph: { spacing: { before: 0, after: 60 }, alignment: AlignmentType.LEFT }
      },
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, color: "2F5496", font: "Aptos Display" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 }
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
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
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "\u2022",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 720, hanging: 360 }
              },
              run: {
                font: "Symbol",
                size: 22
              }
            }
          },
          {
            level: 1,
            format: LevelFormat.BULLET,
            text: "\u25E6",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 1440, hanging: 360 }
              },
              run: {
                font: "Symbol",
                size: 22
              }
            }
          }
        ]
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: children
  }]
});

// Save document
const outputPath = 'C:\\Users\\majidmohamed\\Microsoft\\MAI - Strategy - 11. MSI strategy\\1. Ad hoc\\0. Maj Working Folder\\3. Adhoc\\State of the Union - AI Training Infra\\State of the Union - AI Training Infra.docx';
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log('✅ Document created successfully at:');
  console.log(outputPath);
});
