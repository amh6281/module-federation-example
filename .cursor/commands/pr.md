---
description: Create a pull request automatically
---

1. Analyze the current git diff.

2. Generate:

- PR title
- PR description

Format:

Title:
<short conventional commit style title>

Body:

## Summary

<what changed>

## Changes

- change 1
- change 2

## Test

- how it was tested

3. After generating the PR title and body, run:

git add .
git commit -m "<PR title>"
git push

gh pr create --title "<PR title>" --body "<PR body>"
