# Task02_15_sep_List of HTML Elements (used by QA)

A reference of the HTML elements QA/testers interact with most, mapped to the
Playwright locator or accessibility **role** you use to reach them.

Location: `Notes_prompts/` · Related: `tests/03_Locator_Commands/`, `tests/Tasks/Task01_15_sep_AutomateLogin.spec.ts`

---

## Form & Input Elements

| HTML element | Playwright role / locator | Typical action |
|---|---|---|
| `<input type="text/email/tel/url">` | `getByRole('textbox', {name})` · `getByLabel` · `getByPlaceholder` | `.fill()`, `.type()` |
| `<input type="password">` | `getByRole('textbox')` (usually `getByLabel('Password')`) | `.fill()` |
| `<input type="search">` | `getByRole('searchbox')` | `.fill()` |
| `<input type="number">` | `getByRole('spinbutton')` | `.fill()` |
| `<textarea>` | `getByRole('textbox')` | `.fill()` |
| `<input type="checkbox">` | `getByRole('checkbox')` | `.check()`, `.uncheck()` |
| `<input type="radio">` | `getByRole('radio')` | `.check()` |
| `<select>` + `<option>` | `getByRole('combobox')` | `.selectOption()` |
| `<button>` / `<input type="submit" type="button">` | `getByRole('button', {name})` | `.click()` |
| `<input type="file">` | `locator('input[type=file]')` | `.setInputFiles()` |
| `<input type="date">` | `getByRole('textbox')` + date-picker cells | `.fill()` / click day |
| `<input type="range">` | `getByRole('slider')` | drag / set value |
| `<label>` | `getByLabel()` | labels an input |
| `<fieldset>` / `<legend>` | `getByRole('group')` | groups related fields |
| `<form>` | `getByRole('form')` | scopes inputs |

## Links & Navigation

| HTML element | Playwright locator | Typical action |
|---|---|---|
| `<a href>` | `getByRole('link', {name})` · `getByText` | `.click()` |
| `<nav>` | `getByRole('navigation')` | scope nav links |
| `<header>` | `getByRole('banner')` | page header |
| `<footer>` | `getByRole('contentinfo')` | page footer |
| `<main>` | `getByRole('main')` | main content region |
| `<section>` | `getByRole('region')` | labeled section |
| `<article>` | `getByRole('article')` | self-contained content |
| `<aside>` | `getByRole('complementary')` | sidebar |

## Text & Structure Elements

| HTML element | Playwright locator | Role |
|---|---|---|
| `<h1>`–`<h6>` | `getByRole('heading', {name, level})` | heading |
| `<p>`, `<span>`, `<div>`, `<strong>`, `<em>` | `getByText()` · `locator('css')` | generic text |
| `<ul>` / `<ol>` | `getByRole('list')` | list |
| `<li>` | `getByRole('listitem')` | list item |
| `<table>` | `getByRole('table')` | table |
| `<thead>` / `<tbody>` / `<tfoot>` | `locator('thead/tbody/tfoot')` | sections |
| `<tr>` | `getByRole('row')` | row |
| `<th>` | `getByRole('columnheader')` / `rowheader` | header cell |
| `<td>` | `getByRole('cell')` | data cell |
| `<img alt="...">` | `getByRole('img')` · `getByAltText()` | image |
| `<figure>` / `<figcaption>` | `getByRole('figure')` | captioned media |

## Media, Embed & Special Elements

| HTML element | Playwright locator | Notes |
|---|---|---|
| `<iframe>` | `frameLocator()` · `getByRole('iframe')` | switch into frame before acting |
| `<svg>` | `locator('svg')` (scoped) | inline SVG icons/maps |
| `<canvas>` | `locator('canvas')` | no DOM inside; coordinate/mouse actions |
| `<video>` | `getByRole('video')` | playback |
| `<audio>` | `getByRole('audio')` | playback |
| `<dialog>` | `getByRole('dialog')` | modals |
| `<details>` / `<summary>` | `getByRole('group')` / `button` | expand/collapse |
| `<progress>` | `getByRole('progressbar')` | progress |
| `<meter>` | `getByRole('meter')` | gauge |
| `<datalist>` | `getByRole('listbox')` | input suggestions |
| `<output>` | `getByRole('status')` | computed output |
| `<menu>` | `getByRole('list')` | command list |
| Shadow DOM host | `locator('host')` then chain | Playwright auto-pierces shadow DOM |

## Universal Locator Strategies (any element)

| Strategy | Use for |
|---|---|
| `getByRole(role, {name})` | **Preferred** — accessible role + name |
| `getByLabel(text)` | inputs tied to a `<label>` |
| `getByPlaceholder(text)` | inputs by placeholder |
| `getByText(text)` | visible text (add `{exact:true}` to disambiguate) |
| `getByAltText(text)` | images by alt text |
| `getByTitle(text)` | elements by `title` attribute |
| `getByTestId(id)` | elements by `data-testid` (configurable) |
| `locator('css=...')` / `locator('xpath=...')` | fallback when nothing semantic fits |

## QA Rule of Thumb

1. Prefer `getByRole` (semantic, stable, what a user/screen-reader sees) — e.g. the
   `Make Appointment` heading fix in Task01.
2. Then `getByLabel` / `getByPlaceholder` / `getByText` / `getByAltText`.
3. Fall back to CSS/XPath only when no semantic locator exists.
4. Avoid ambiguous locators — Playwright strict mode fails when a locator matches
   more than one element.
