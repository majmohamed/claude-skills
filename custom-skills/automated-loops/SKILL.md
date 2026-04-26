# Automated Loops

Persistent scheduled tasks running via Windows Task Scheduler. Each task calls `automation.ps1` with a mode flag. Skills are read from SKILL.md at runtime - updating a skill file automatically updates the automation.

## Active Tasks

| Task | Schedule | Mode | Skill | Time limit |
|------|----------|------|-------|------------|
| `MajMorningBriefing` | 8am Mon-Fri | `morning` | `daily-morning-briefing` | 45 min |
| `MajDailyAutomation` | 9pm daily | `eod` | `eod-transcript-processor` | 45 min |
| `MajMondayBriefing` | 8:05am Mon | `monday` | `maj-monday-briefing` | 60 min |
| `MajAICBrief` | 8:10am Mon | `aicbrief` | `aic-brief` | 30 min |
| `MajCalendarAudit` | 8:10am Fri | `calaudit` | `calendar-audit` | 30 min |
| `MajExpenseScanner` | 8:10am Fri | `expenses` | `expense-scanner` | 30 min |

## How it works

1. Windows Task Scheduler fires at the scheduled time
2. Runs `automation.ps1 -Mode [mode]`
3. Script reads the SKILL.md from `5. Automations/skills/` at runtime
4. Calls `claude --print --dangerously-skip-permissions` with the skill content as the prompt
5. Claude executes the skill end-to-end including all chains
6. Logs output to `5. Automations/logs/YYYY-MM-DD-[mode].md`

## Key settings

- **StartWhenAvailable**: If the machine was asleep, runs on wake
- **DontStopIfGoingOnBatteries**: Keeps running on battery
- **RestartCount 2**: Retries twice on failure (5 min gap)
- **MultipleInstances IgnoreNew**: Won't stack if previous run is still going

## Manual runs

```powershell
.\automation.ps1 -Mode morning
.\automation.ps1 -Mode eod
.\automation.ps1 -Mode monday
.\automation.ps1 -Mode aicbrief
.\automation.ps1 -Mode calaudit
.\automation.ps1 -Mode expenses
.\automation.ps1 -Mode eod -DryRun
.\automation.ps1 -Mode eod -Force
.\automation.ps1 -Mode eod -SingleFile "260403 Compute"
```

## Logs

Each run creates `5. Automations/logs/YYYY-MM-DD-[mode].md`. Check these if a scheduled run didn't produce the expected output.

## Dependencies

- **Claude Code CLI** globally installed (`claude` in PATH)
- **Slack MCP** tokens in `~/.slack-mcp-tokens.json` (auto-refresh from browser)
- **Machine must be on** at the scheduled time (or will run on wake)

## Known limitation: Work IQ

Work IQ (M365 email, calendar, Teams, transcripts) is NOT available in headless mode. The `@microsoft/workiq` MCP server requires interactive device code auth and hangs in headless `claude --print` sessions. The automation script tells Claude to skip Work IQ queries silently and proceed with Slack + local files only. Work IQ works normally in interactive Claude Code sessions.
