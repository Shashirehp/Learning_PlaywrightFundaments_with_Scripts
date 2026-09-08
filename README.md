# Learning Playwright Fundamentals with Scripts

A hands-on project for learning [Playwright](https://playwright.dev/) test automation fundamentals with real scripts. Tests are written in **TypeScript** using the `@playwright/test` runner.

## Prerequisites

- [Node.js](https://nodejs.org/) (18+) — Playwright requires Node.js to run. Check your version with:

```bash
node --version
```

## Project Setup

If you are cloning this repository, install the dependencies first:

```bash
npm install
```

### From Scratch (How This Project Was Built)

1. **Initialize a Node.js project**

```bash
npm init -y
```

2. **Install Playwright Test**

```bash
npm init playwright@latest
```

or install it manually with TypeScript types:

```bash
npm install --save-dev @playwright/test @types/node
```

3. **Install the browsers** (Chromium, Firefox, WebKit)

```bash
npx playwright install
```

> The `npm init playwright@latest` step above generates the default `playwright.config.ts` and `tests/example.spec.ts` files automatically.

## Recording Tests with Codegen

Playwright's **Codegen** opens a browser and generates the test code as you interact with the page — the fastest way to author selectors and actions.

- Open a browser and record against any URL:

```bash
npx playwright codegen https://example.com
```

- Record against a page you are already testing locally (e.g. `http://localhost:3000`):

```bash
npx playwright codegen http://localhost:3000
```

**How to use it:**

1. A browser window opens alongside the Playwright Inspector.
2. Click around, fill forms, and navigate — Playwright records each action.
3. Pick a locator on the page to copy a robust locator for the element.
4. Toggle between **Record**, **Explore**, and **Assert** modes in the Inspector.
5. Copy the generated code into your test file, or save it directly to `tests/`.

## Running the Tests

```bash
# Run all tests (headless)
npx playwright test

# Run tests in headed mode (watch the browser)
npx playwright test --headed

# Run a single test file
npx playwright test tests/example.spec.ts

# Run tests with the name matching "sample"
npx playwright test --grep "sample"

# Run in watch / UI mode
npx playwright test --ui

# Debug a test with the inspector + debugger
npx playwright test --debug
```

### Viewing the HTML Report

After a run, open the interactive HTML report:

```bash
npx playwright show-report
```

## Project Structure

```
├── tests/                  # Test files (*.spec.ts)
│   ├── example.spec.ts
│   └── sampleTest.spec.ts
├── playwright.config.ts    # Playwright test configuration
├── package.json
└── .gitignore
```

The `playwright.config.ts` defines three browser projects — **Chromium**, **Firefox**, and **WebKit** — so every test runs against all three by default. Configure `projects`, retries, reporters, and base URLs there.

## Useful Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Codegen Guide](https://playwright.dev/docs/codegen)
