# Claude Skills

Personal Claude Code skills and plugins by Maj Mohamed.

## Skills

### risk-register

Adds entries to the MSI Issue Tracker / Risk Register Excel file. Triggered by phrases like "add to risk register", "add to issues list", "new risk", etc.

**Features:**
- Parses natural language to extract issue details (workstream, DRI, priority, RAG, horizon)
- Interviews for missing fields using structured questions
- Writes directly to the shared Excel tracker with proper formatting
- Confirms additions with a summary table

## Installation

These skills are designed for use with [Claude Code](https://claude.com/claude-code). Copy any skill directory into your local skills folder or reference via `extraKnownMarketplaces` in your Claude settings.
