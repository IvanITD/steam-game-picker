#!/usr/bin/env bash
# Creates a PRIVATE GitHub repo and pushes this project.
# Prerequisites: GitHub CLI — run `gh auth login` first.

set -euo pipefail

REPO_NAME="${1:-steam-game-picker}"

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: https://cli.github.com/"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Run: gh auth login"
  exit 1
fi

echo "Creating PRIVATE repo: $REPO_NAME"
gh repo create "$REPO_NAME" --private --source=. --remote=github --description "Personal Steam game picker for Ivan"

CURRENT_BRANCH="$(git branch --show-current)"
echo "Pushing branch: $CURRENT_BRANCH"
git push -u github "$CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ]; then
  echo ""
  echo "To set main as default branch on GitHub:"
  echo "  git checkout main && git merge $CURRENT_BRANCH && git push -u github main"
fi

echo ""
echo "Done. Private repo URL:"
gh repo view "$REPO_NAME" --json url -q .url
