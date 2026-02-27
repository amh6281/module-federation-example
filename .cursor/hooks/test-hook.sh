#!/bin/bash

# 변경 사항 있는지 확인
if ! git diff --quiet || ! git diff --cached --quiet; then
  git add .
  git commit -m "feat: cursor auto commit" >/dev/null 2>&1
fi

exit 0