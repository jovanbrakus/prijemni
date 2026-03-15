#!/bin/bash
# PostToolUse hook: validates HTML solution files after Write/Edit

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Skip if no file path
if [[ -z "$FILE" ]]; then
  exit 0
fi

# Only validate HTML files in problems/ folder
if [[ ! "$FILE" =~ /problems/.*\.html$ ]]; then
  exit 0
fi

# Skip if file doesn't exist (e.g. failed write)
if [[ ! -f "$FILE" ]]; then
  exit 0
fi

# Run validation
OUTPUT=$(cd "$CLAUDE_PROJECT_DIR" && npx tsx scripts/validate-solution-html.ts "$FILE" 2>&1)
EXIT_CODE=$?

if [[ $EXIT_CODE -eq 0 ]]; then
  exit 0
fi

# Validation failed — report back to Claude
jq -n \
  --arg file "$FILE" \
  --arg output "$OUTPUT" \
  '{
    continue: true,
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      decision: "block",
      reason: "HTML solution validation failed. Fix the issues and re-write the file.",
      additionalContext: ("File: " + $file + "\n\nValidation output:\n" + $output)
    }
  }'
exit 0
