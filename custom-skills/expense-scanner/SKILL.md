# Skill: Expense Scanner

Scans work email for receipts and expense-relevant items, matches them against Rosie/CC's requests, and sends a structured summary to the group DM. Minimises the manual burden on Maj by doing the email digging automatically.

**Slash command**: `/expenses`

**Schedule**: Weekly (Sundays, before Rosie's typical Monday expense batch) + on demand

---

## Overview

This skill operates in two modes:

### Mode 1 - Proactive scan (weekly or on demand)
Scans Maj's work email for new receipt-like items and sends a clean summary to the Rosie/CC group DM with everything found. Runs without needing a specific list from Rosie.

### Mode 2 - Reactive match (on demand)
When Rosie sends her numbered expense list in the DM, this skill reads that list, searches email for matching receipts, and replies in the same thread with what it found (and what's missing).

---

## Destination

- **Primary**: Group DM with Rosie + CC (`C0AM6V2L892`)
- **Format**: Threaded Slack message (header + replies)
- **Tone**: Polite and helpful - this goes directly to Rosie/CC, not to Maj. Written as if from Claude on Maj's behalf.

---

## Data Sources

### Work IQ (M365 Copilot) - email scanning

| Query type | What to search | Keywords / patterns |
|-----------|---------------|-------------------|
| Hotel folios | 7. ADMIN folder + Inbox | "folio", "guest invoice", "your stay", "checkout", "billing summary", sender domains: `@marriott.com`, `@hilton.com`, `@hyatt.com`, `@ihg.com`, `@loewshotels.com`, `@booking.com` |
| Flight receipts | 7. ADMIN folder + Inbox | "e-ticket", "itinerary receipt", "booking confirmation", "flight receipt", sender domains: `@ba.com`, `@united.com`, `@aa.com`, `@delta.com`, `@alaskaair.com`, `@amadeus.com` |
| Wi-Fi receipts | 7. ADMIN folder + Inbox | "Wi-Fi", "inflight purchase", "onboard purchase", sender: `@gogoair.com`, `@united.com` |
| Car rental | 7. ADMIN folder + Inbox | "rental agreement", "car rental", "vehicle rental", sender: `@avis.com`, `@hertz.com`, `@enterprise.com` |
| Corporate travel bookings | 7. ADMIN folder + Inbox | "travel document", "booking confirmation", "itinerary", sender: `@amadeus.com`, AMEX travel |
| AMEX statements | 7. ADMIN folder + Inbox | "statement", "card activity", sender: `@americanexpress.com` |
| Expense system alerts | Inbox | "expense report", "action required", "pending receipt", sender: `@microsoft.com` (MyExpense/MS Approvals) |
| Uber receipts | 7. ADMIN folder + Inbox | "trip with Uber", "your receipt", "ride receipt", sender: `@uber.com` |
| General receipts | 7. ADMIN folder + Inbox | "receipt", "invoice", "order confirmation", "payment confirmation" |

### Slack MCP - reading Rosie's expense lists

| Source | Channel ID | What to read |
|--------|-----------|-------------|
| DM with Rosie | D08UASC4KU0 | "Expenses :thread:" messages and their replies (the numbered item lists) |
| Group DM (Rosie + CC) | C0AM6V2L892 | Any expense-related messages |

---

## Workflow

### Mode 1 - Proactive Scan

#### Step 1 - Scan email for receipts

Run Work IQ queries in parallel:

**Query 1 (hotels):**
"Search my emails from the last 30 days for hotel invoices, folios, guest bills, or checkout confirmations. Check the 7. ADMIN folder and Inbox. Look for emails from hotel domains like marriott.com, hilton.com, hyatt.com, ihg.com, loewshotels.com. Also search for keywords: folio, guest invoice, your stay, billing summary, checkout."

**Query 2 (flights + travel):**
"Search my emails from the last 30 days for flight receipts, airline confirmations, e-tickets, itinerary receipts, car rental agreements, and corporate travel booking documents. Check the 7. ADMIN folder and Inbox. Look for emails from ba.com, united.com, delta.com, alaskaair.com, amadeus.com, avis.com, hertz.com."

**Query 3 (other receipts):**
"Search my emails from the last 30 days for Wi-Fi purchase receipts, Uber/ride receipts, restaurant receipts, Amazon order confirmations, or any other purchase receipts or invoices. Check the 7. ADMIN folder and Inbox."

**Query 4 (expense system):**
"Search my emails from the last 14 days for any MyExpense alerts, AMEX overdue notices, expense report action items, or pending receipt requests. Check Inbox."

#### Step 2 - Deduplicate and categorize

For each item found:
1. Extract: merchant/vendor name, amount (if visible), date, email subject, whether it has attachments
2. Check against the last expense scan log (`data/expense-scan-log.json`) to identify NEW items not previously surfaced
3. Categorize as: Hotel, Flight, Ground Transport, Meals/Incidentals, Other
4. Flag items that look like they have attachments (PDFs, folios) - these are the high-value ones

#### Step 3 - Check what Rosie already has

Read the most recent "Expenses :thread:" message from D08UASC4KU0 to see what's on her current list. Cross-reference against email findings to identify:
- Items from her list that MATCH an email receipt (can be resolved)
- Items from her list with NO email match (likely personal email/app - needs Maj to dig)
- NEW email receipts not on her list yet (proactive find)

#### Step 4 - Post to group DM

Post to `C0AM6V2L892` as a threaded message.

**Header message:**
```
Expense receipts scan - [DD Mon] :thread:
```

**Reply 1 - Receipts found in email:**
```
Hi Rosie / CC - Claude here! I've scanned Maj's work email for expense receipts. Here's what I found:

*Hotel folios*
- [Hotel name] - [dates] - [amount if visible] - [has attachment: yes/no]
  Email: [subject line] ([date received])

*Flight / travel*
- [Airline] - [route] - [amount if visible]
  Email: [subject line] ([date received])

*Other receipts*
- [Merchant] - [amount] - [date]
  Email: [subject line] ([date received])
```

**Reply 2 - Matched against current list** (only if Rosie has an active list):
```
*Matching against Rosie's current list:*

Found in email:
- #[N] [item from list] -> matches [email description]

Not in work email (likely personal email/app):
- #[N] [item] - [category: Uber/Airbnb/restaurant/fuel] - Maj will need to pull from [app name]
- #[N] [item] - [category] - suggest lost receipt if unavailable
```

**Reply 3 - Suggested actions:**
```
*Suggested next steps:*
- [N] items can be resolved from work email (links above)
- [N] items Maj needs to pull from personal apps (Uber app, Airbnb app, etc.)
- [N] items may need lost receipt treatment

Maj - for the personal app ones, the fastest path is usually:
- Uber: Account -> Activity -> select ride -> download receipt
- Airbnb: Trips -> select booking -> Receipt
- Airlines: Manage booking on airline website -> receipt/invoice
```

#### Step 5 - Update scan log

Write/update `data/expense-scan-log.json` with:
```json
{
  "last_scan": "YYYY-MM-DDTHH:MM:SS",
  "items_found": [
    {
      "merchant": "Seattle Marriott Redmond",
      "amount": "$2,239.80",
      "date": "2026-03-13",
      "email_subject": "Your SUNDAY MARCH 8, 2026 Stay...",
      "category": "hotel",
      "has_attachment": true,
      "sent_to_rosie": false,
      "matched_to_list_item": null
    }
  ],
  "scan_mode": "proactive"
}
```

### Mode 2 - Reactive Match

When Rosie sends an "Expenses :thread:" with a numbered list:

#### Step 1 - Parse Rosie's list

Read the thread from D08UASC4KU0, extract each numbered item with:
- Merchant name
- Amount
- Date
- Any notes (e.g., "parking?", "fuel?")

#### Step 2 - Search email for each item

For each item, run a targeted Work IQ query:
"Search my emails for [merchant name] around [date]. Check 7. ADMIN folder and Inbox. Also try searching for the amount [amount]."

Group items into batches of 3-4 per query to reduce API calls.

#### Step 3 - Classify results

For each item:
- **FOUND** - email receipt exists in work email. Include email subject and key details.
- **NOT IN WORK EMAIL** - no match. Classify the likely source:
  - Uber/Lyft/Waymo -> ride app (suggest: open app, download receipt)
  - Airbnb -> Airbnb app/site (suggest: Trips -> receipt)
  - Restaurant/bar -> physical receipt or card statement only (suggest: lost receipt)
  - Fuel/parking -> physical receipt or app (suggest: lost receipt)
  - Deliveroo/UberEats -> delivery app (suggest: open app, download receipt)
  - Amazon -> Amazon order history
- **PARTIAL** - booking confirmation exists but not a proper receipt/invoice (suggest: contact vendor for folio)

#### Step 4 - Post results

Reply in the SAME thread as Rosie's list in D08UASC4KU0 (or post to group DM C0AM6V2L892 if the list came from there).

Format:
```
Hey! Claude here - I've scanned Maj's work email for these. Here's what I found:

*In work email* (can forward/attach):
- #3 Refuel $58.58 - not found (fuel stations rarely email receipts, suggest lost receipt)
- #14 Marriott $2,239.80 - FOUND - folio email from 13 Mar, has attachment
- #16 Airbnb refund - not in work email (check Airbnb app)

*Not in work email* (Maj needs to pull from personal apps):
[list with specific app/action for each]

*Suggested lost receipt candidates:*
[items where receipt is genuinely unrecoverable]
```

---

## Key Constraints and Limitations

### What Work IQ CAN reliably find
- Hotel folios and checkout emails (these come to work email via AMEX travel)
- Corporate travel bookings via Amadeus/AMEX travel
- Airline e-tickets and booking confirmations
- Wi-Fi purchase receipts
- AMEX and expense system notifications
- Some Uber receipts (if forwarding is set up)

### What Work IQ CANNOT find
- Receipts sent to personal email
- In-app-only receipts (Uber, Airbnb, Deliveroo unless forwarded)
- Physical receipts (restaurants, fuel, parking meters)
- Items that only appear on AMEX card statement

### Receipt Renamer tool
Jonathan Fuchs built a receipts tool at receipt-renamer.fly.dev that Rosie uses. Reference this when suggesting Maj format/rename receipts before sending.

---

## Style Rules

- This skill's output goes to Rosie and CC, NOT to Maj's self-DM
- Tone: friendly, helpful, professional. These are colleagues who handle admin for Maj
- Always start with "Hi Rosie / CC - Claude here!" or similar
- Be specific about what Maj needs to do manually
- Don't waste their time with caveats - just give them the actionable info
- Use numbered lists that match Rosie's numbering when in reactive mode
- No emdashes - only hyphens

---

## File Paths

| File | Path | Purpose |
|------|------|---------|
| Expense scan log | `5. Automations/data/expense-scan-log.json` | Track what's been scanned and sent |
| Rosie DM | D08UASC4KU0 | Read Rosie's expense lists |
| Group DM (Rosie + CC) | C0AM6V2L892 | Post scan results |
| Maj self-DM | D07AKFZPGCB | Optional: notify Maj of scan completion |

---

## Dependencies

- **Work IQ MCP**: Required for email scanning
- **Slack MCP**: Required for reading Rosie's lists and posting results

---

## Schedule

- **Weekly**: Sunday evening scan (proactive mode) via `/loop 168h /expenses`
- **On demand**: Maj runs `/expenses` anytime, or `/expenses match` to trigger reactive mode against Rosie's latest list

---

## Arguments

| Argument | Effect |
|----------|--------|
| (none) | Proactive scan - find all receipt-like emails from last 30 days |
| `match` | Reactive mode - read Rosie's latest expense list and match against email |
| `backlog` | Extended scan - search last 90 days for anything unmatched |
| `[number]` days | Override scan window (e.g., `/expenses 60` for 60 days) |

---

## Important Notes

- **NEVER send to wrong channel** - always verify C0AM6V2L892 is the Rosie/CC group DM before posting
- **Don't fabricate receipts** - if Work IQ doesn't find it, say so clearly
- **Personal app guidance is key** - the most common bottleneck is Maj not pulling receipts from Uber/Airbnb/Deliveroo. Make it as easy as possible by telling him exactly which app and where to click
- **30-day rule** - Microsoft requires expenses within 30 days. Flag items approaching or past this deadline
- **Marriott folio already forwarded** - the March 2026 Marriott folio was already forwarded to Rosie. Always check sent items to avoid duplicating
- **Rosie uses "Expenses :thread:" format** - her lists always start with this header. Search for this pattern when looking for her latest list
