# Steps to Execute the Task01 Login Test (Playwright Scripts Project)

This document records the exact steps, commands, and reasoning used to run the
new login automation spec and get it passing:

- **Spec file:** `tests/Tasks/Task01_15_sep_AutomateLogin.spec.ts`
- **Working directory:** `C:\Users\Hp\Desktop\Shashi_playwright\Learnings\LearnPlaywright3x_PlaywrightScripts`
- **Browser project used:** `chromium`

The test automates the Katalon Demo CURA app: open the site, click **Make
Appointment**, log in with the demo credentials, and verify the appointment page
heading is visible.

---

## 0. Understand the Current State (read-only, safe)

Before running anything, read the spec, the config, and the manifest. These do
not modify anything.

| File | Why we read it |
|---|---|
| `tests/Tasks/Task01_15_sep_AutomateLogin.spec.ts` | The test to execute. |
| `playwright.config.ts` | Shows `testDir: './tests'`, reporter, and the browser projects (`chromium`, `firefox`, `webkit`). |
| `package.json` | Shows the scripts and the `devDependencies` (`@playwright/test`, `@types/node`). |

### What we found
- `testDir` is `./tests`, so the spec is discovered under the `tests/Tasks/` folder.
- There is **no `node_modules/`** in the project yet, so nothing can run until deps are installed.
- The spec had a **syntax error** on line 9 and a **strict-mode locator** problem (see below).

---

## 1. Fix the Syntax Error (missing parenthesis)

Original line 9:

```ts
await expect(page.getByText('Make Appointment', {exact: true}).toBeVisible());
```

The `.toBeVisible()` was accidentally placed **inside** `expect(...)`, so the
parenthesis was unbalanced. The `expect()` call was never closed before calling
the matcher.

Corrected line 9:

```ts
await expect(page.getByText('Make Appointment', {exact: true})).toBeVisible();
```

| Part | What it means |
|---|---|
| `expect(<locator>)` | Wraps the locator so a matcher can be asserted on it. Must be closed `)` first. |
| `.toBeVisible()` | The matcher, called on the value returned by `expect(...)`. |

> A syntactically invalid spec cannot even be parsed/loaded — Playwright would
> fail before running the test, so this must be fixed first.

---

## 2. Install Dependencies

```powershell
npm install
```

### Gotcha: npm was configured to omit dev dependencies
`npm install` reported *"up to date, audited 1 package"* and created **no**
`node_modules`. Checking the config explained why:

```powershell
npm config get omit      # output: dev
```

Because `omit=dev` is set, npm skips `devDependencies`. Since Playwright lives in
`devDependencies`, it was never installed. Install them explicitly:

```powershell
npm install --include=dev
```

| Command / flag | What it does |
|---|---|
| `npm install` | Installs dependencies per `package.json` (but obeys `omit=dev` here). |
| `npm install --include=dev` | Forces **all** deps, including `devDependencies`, to be installed. |
| `npm config get omit` | Prints the current npm omit setting (here `dev`). |

Result:

```
added 5 packages, and audited 6 packages in 3s
```

---

## 3. Run the Test (first attempt)

```powershell
npx playwright test tests/Tasks/Task01_15_sep_AutomateLogin.spec.ts --project=chromium --reporter=list
```

| Part | What it does |
|---|---|
| `npx playwright test <file>` | Runs only the given spec file. |
| `--project=chromium` | Restricts the run to the `chromium` project from `playwright.config.ts`. |
| `--reporter=list` | Prints a compact line-per-test result in the terminal. |

### What happened
The test executed (the syntax fix worked) but **failed** with a **strict mode
violation**:

```
Error: strict mode violation: getByText('Make Appointment', { exact: true })
resolved to 2 elements:
  1) <a id="btn-make-appointment" ...>Make Appointment</a>
  2) <h2>Make Appointment</h2>
```

Why: `getByText('Make Appointment')` matched **two** elements on the page — the
navigation link and the page heading. Playwright's strict mode refuses to act on
an ambiguous locator.

---

## 4. Fix the Locator (make it unambiguous)

The test's intent is to confirm the **appointment page loaded**, which is
represented by the `<h2>` heading. Target it by role + name:

```ts
await expect(page.getByRole('heading', {name: 'Make Appointment'})).toBeVisible();
```

| Part | What it does |
|---|---|
| `getByRole('heading', ...)` | Matches only heading elements (the `<h2>`), ignoring the `<a>` link. |
| `{name: 'Make Appointment'}` | Filters to the heading whose accessible name matches. |

> Prefer role-based locators (`getByRole`) over raw text/`getByText` — they
> disambiguate and read closer to how a user/screen-reader sees the page.

---

## 5. Re-run the Test

```powershell
npx playwright test tests/Tasks/Task01_15_sep_AutomateLogin.spec.ts --project=chromium --reporter=list
```

Result:

```
Running 1 test using 1 worker

  ✓  1 [chromium] › tests\Tasks\Task01_15_sep_AutomateLogin.spec.ts:2:5 › Verify Make Appointment oage is loaded (3.4s)

  1 passed (4.3s)
```

---

## Full Command Sequence (quick reference)

```powershell
# 1. Inspect (read-only)
#    - read the spec, playwright.config.ts, package.json

# 2. Ensure dependencies are present (this project has npm omit=dev)
npm install --include=dev

# 3. Run the single spec on chromium
npx playwright test tests/Tasks/Task01_15_sep_AutomateLogin.spec.ts --project=chromium --reporter=list
```

---

## Final Spec (for reference)

```ts
import {test , expect} from '@playwright/test'
test ("Verify Make Appointment oage is loaded" , async({page}) =>
{
    await page.goto("https://katalon-demo-cura.herokuapp.com/")
    await page.locator("#btn-make-appointment").click();
    await page.locator("#txt-username").fill("John Doe");
    await page.locator("#txt-password").fill("ThisIsNotAPassword");
    await page.locator("#btn-login").click();
    await expect(page.getByRole('heading', {name: 'Make Appointment'})).toBeVisible();
});
```

---

## Notes / Gotchas

- **Parse before run:** an unbalanced `)` (matcher nested inside `expect`) means
  the spec never loads — fix syntax before debugging behavior.
- **Strict mode:** Playwright throws if a locator resolves to more than one
  element. Narrow it (e.g. add `{ exact: true }`, scope to a parent, or use
  `getByRole`) instead of relying on `.first()`.
- **`npm omit=dev`:** if `npm install` "succeeds" but installs nothing, check
  `npm config get omit`. Use `--include=dev` (or `--production=false`) to force
  dev dependencies.
- **Browser binaries:** browsers are installed separately from the npm package;
  if a run complains a browser is missing, run `npx playwright install chromium`.
- The test title has a typo (`oage` instead of `page`) — harmless to execution,
  but worth correcting for clarity.
