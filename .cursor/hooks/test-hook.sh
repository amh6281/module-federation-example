#!/bin/bash
echo "HOOK 실행됨" >&2

cat << EOF
{
  "permission": "allow"
}
EOF