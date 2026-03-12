---
description: Run ESLint (errors only) and then execute the development build.
---

# Verify Lint Errors and Run Dev Build

This command performs two checks in sequence:

1. Run ESLint and show **only errors** (warnings are hidden)
2. Run the development build

## Step 1 — Run ESLint (errors only)

Execute ESLint with the `--quiet` option to suppress warnings and show only errors.

```bash
eslint . --quiet

If ESLint reports errors, review and fix them before continuing.

Step 2 — Run Development Build

After lint verification, run the development build.

npm run build:dev
Result

ESLint errors will be displayed if present.

If no blocking issues occur, the dev build will execute successfully.
```
