---
name: risk-register
description: "This skill should be used when the user asks to 'add to risk register', 'add to issues list', 'add issue', 'new risk', 'add to tracker', 'update issue tracker', 'add to the risk register', 'add something to the issues list', 'new issue for the tracker', or 'log a risk'. Manages the MSI Issue Tracker Excel file."
---

# MSI Issue Tracker / Risk Register

Add new entries to the MSI Issue Tracker Excel file. The tracker lives at:

```
C:\Users\majidmohamed\Microsoft\Microsoft AI-TA - Documents\12. AI Team\MSI ISSUE TRACKER v2.xlsx
```

## Security Boundaries

**This skill:**

- **CAN**: Read the Excel tracker, append new rows, confirm additions
- **CANNOT**: Delete rows, modify existing entries, restructure the file
- **MUST CONFIRM**: The details of each new entry before writing

## File Structure

The Excel file (`Sheet1`) has headers in row 2, data starting at row 3:

| Column | Header | Valid Values |
|--------|--------|-------------|
| B | Workstream | MSFT compute, MAI compute, MAI models, SLT, Hiring, Data, OMAI, OpenAI IP, Security, Team culture |
| C | Issue | Free text - concise description of the issue |
| D | Strat DRI | Maj, Paul, James (or other names) |
| E | MSI DRI | Name(s) or "n/a" |
| F | Priority | High, Mid, Low |
| G | RAG status | Red, Amber, Green |
| H | Horizon | Near, Long |
| I | Status + next steps | Free text - current status and immediate next actions |

## Formatting Rules

- Font: Aptos, size 11 across all columns
- Column B (Workstream): **bold**
- All other columns: regular weight
- Copy formatting from last existing data row to maintain consistency

## Instructions

### Step 1: Parse the user's request

Extract as much information as possible from what the user says. Map natural language to the structured fields above. Example: "Paul to figure out where we need forward deployed engineers" gives Issue, Strat DRI (Paul), and Status + next steps.

### Step 2: Interview for missing fields

Use AskUserQuestion to gather any fields not inferable from context. Pre-fill defaults where sensible:

- If DRI is mentioned by name, pre-fill Strat DRI
- If context suggests urgency, default Priority to High
- If no RAG signal, default to Amber
- If timeline is unclear, default Horizon to Near

Only ask about fields that are genuinely ambiguous. If the user provides enough context for all fields, skip the interview and go straight to confirmation.

### Step 3: Confirm before writing

Show the user a summary table of the entry to be added. Get confirmation before writing.

### Step 4: Write to Excel

Use this exact approach (proven to work on this machine):

```bash
py -c "
import openpyxl
from openpyxl.styles import Font
from copy import copy

FILEPATH = r'C:\Users\majidmohamed\Microsoft\Microsoft AI-TA - Documents\12. AI Team\MSI ISSUE TRACKER v2.xlsx'
wb = openpyxl.load_workbook(FILEPATH)
ws = wb['Sheet1']

# Find last row with data
last_data_row = 2
for row in ws.iter_rows(min_row=3, max_row=ws.max_row, values_only=False):
    if any(c.value is not None for c in row):
        last_data_row = row[0].row

new_row = last_data_row + 1

# Copy formatting from last data row
for col_letter in ['B','C','D','E','F','G','H','I']:
    src = ws[f'{col_letter}{last_data_row}']
    dst = ws[f'{col_letter}{new_row}']
    dst.font = copy(src.font)
    if src.fill.patternType:
        dst.fill = copy(src.fill)
    if src.alignment:
        dst.alignment = copy(src.alignment)
    if src.border:
        dst.border = copy(src.border)

# Set values
ws[f'B{new_row}'] = '<WORKSTREAM>'
ws[f'B{new_row}'].font = Font(name='Aptos', size=11, bold=True)
ws[f'C{new_row}'] = '<ISSUE>'
ws[f'D{new_row}'] = '<STRAT_DRI>'
ws[f'E{new_row}'] = '<MSI_DRI>'
ws[f'F{new_row}'] = '<PRIORITY>'
ws[f'G{new_row}'] = '<RAG>'
ws[f'H{new_row}'] = '<HORIZON>'
ws[f'I{new_row}'] = '<STATUS_NEXT_STEPS>'

wb.save(FILEPATH)
print(f'Added row {new_row} to MSI Issue Tracker')
"
```

**Critical implementation notes:**

- Use `py -c "..."` to invoke Python (not `python` or `python3` - those hit the Windows Store alias on this machine)
- `openpyxl` is installed and available
- Always find the last data row dynamically - do not hardcode row numbers
- Always copy formatting from the last existing row
- Always force column B bold with `Font(name='Aptos', size=11, bold=True)`

### Step 5: Confirm completion

After writing, show the user what was added in a clean summary table with all field values.

## Adding Multiple Items

If the user provides multiple items at once, process each one individually through the same flow. Batch the interview step - ask about all items at once rather than one at a time.
