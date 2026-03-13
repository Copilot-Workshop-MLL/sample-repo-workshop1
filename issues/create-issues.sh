#!/usr/bin/env bash
# Creates 3 Pomodoro timer enhancement issues on GitHub.
# Prerequisites:
#   1. Install gh CLI:  https://cli.github.com/
#   2. Authenticate:    gh auth login
#   OR set a PAT:       export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
#
# Usage:  bash create-issues.sh [owner/repo]
# Default repo: Customer-Workshops/sample-repo-workshop

REPO="${1:-Customer-Workshops/sample-repo-workshop}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Creating issues on $REPO …"

# ── Issue 1: Visual Feedback ──────────────────────────────────────────────────
gh issue create \
  --repo "$REPO" \
  --title "[Feature] Pattern A: Enhanced Visual Feedback for Pomodoro Timer" \
  --label "enhancement,ui/ux,frontend" \
  --body-file "$SCRIPT_DIR/issue-1-visual-feedback.md"

echo "✓ Issue 1 created"

# ── Issue 2: Customizability ──────────────────────────────────────────────────
gh issue create \
  --repo "$REPO" \
  --title "[Feature] Pattern B: Improved Customizability for Pomodoro Timer" \
  --label "enhancement,settings,accessibility,frontend" \
  --body-file "$SCRIPT_DIR/issue-2-customizability.md"

echo "✓ Issue 2 created"

# ── Issue 3: Gamification ─────────────────────────────────────────────────────
gh issue create \
  --repo "$REPO" \
  --title "[Feature] Pattern C: Gamification Elements for Pomodoro Timer" \
  --label "enhancement,gamification,data,frontend" \
  --body-file "$SCRIPT_DIR/issue-3-gamification.md"

echo "✓ Issue 3 created"

echo ""
echo "All issues created. View them at: https://github.com/$REPO/issues"
