#!/bin/bash
# PostToolUse hook: validates HTML solution files after Write/Edit
# Runs v1 validator for problems/ and v2 validator for problems_v2/

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Skip if no file path
if [[ -z "$FILE" ]]; then
  exit 0
fi

# Skip if file doesn't exist (e.g. failed write)
if [[ ! -f "$FILE" ]]; then
  exit 0
fi

# Determine which validator to use based on path
VALIDATOR=""
if [[ "$FILE" =~ /problems_v2/.*\.html$ ]]; then
  VALIDATOR="scripts/validate-solution-v2.ts"
elif [[ "$FILE" =~ /problems/.*\.html$ ]]; then
  VALIDATOR="scripts/validate-solution-html.ts"
fi

# Skip if not a problem HTML file
if [[ -z "$VALIDATOR" ]]; then
  exit 0
fi

# Run validation
OUTPUT=$(cd "$CLAUDE_PROJECT_DIR" && npx tsx "$VALIDATOR" "$FILE" 2>&1)
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
