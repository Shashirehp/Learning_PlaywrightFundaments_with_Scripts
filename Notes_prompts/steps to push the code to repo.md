# Steps to Push Code to a Repo (Playwright Scripts Project)

This document records the exact steps, commands, and reasoning used to push the
local changes of this project to GitHub, while **excluding the `Notes_MainRepo`
folder** and **excluding duplicate files**.

- **Working directory:** `C:\Users\Hp\Desktop\Shashi_playwright\Learnings\LearnPlaywright3x_PlaywrightScripts`
- **Target repo (origin):** `https://github.com/Shashirehp/Learning_PlaywrightFundaments_with_Scripts`
- **Branch pushed:** `main`

---

## 0. Understand the Current State (read-only, safe)

Before changing anything, inspect the repo. These commands do not modify files.

| Command | What it does |
|---|---|
| `git status` | Shows staged (to be committed) and unstaged changes in the working tree. |
| `git status --porcelain --untracked-files=all` | Machine-readable status, including every untracked file. Good for a full inventory. |
| `git remote -v` | Lists configured remotes and their URLs (`origin`, `upstream`, etc.). |
| `git log --oneline -10` | Shows the last 10 commits in one line each (history check). |
| `git branch -a` | Lists local and remote-tracking branches. |
| `git ls-files -s` | Lists files **in the index** with their mode (e.g. `100644` = normal file, `160000` = gitlink/nested repo). |

### What we found
- `origin` = `Shashirehp/Learning_PlaywrightFundaments_with_Scripts` (our push target).
- `upstream` = `PramodDutta/LearningPlaywrightFundamentals3x` (source/original repo).
- Branch `main` tracks `origin/main`.
- `Notes_MainRepo/LearningPlaywrightFundamentals3x` was staged as a **gitlink**
  (`160000` mode) — i.e. a **nested Git repo**, not normal files. This must be excluded.
- Everything else was already staged (`A` = added) and there were no untracked leftovers.

---

## 1. Find Duplicate Files (by content hash)

To detect **byte-identical** duplicates regardless of filename, hash every file
(PowerShell, Windows):

```powershell
Get-ChildItem -Recurse -File -Force |
  Where-Object { $_.FullName -notmatch '\\node_modules\\|\\\.git\\|\\Notes_MainRepo\\|\\test-results\\|\\playwright-report\\' } |
  Get-FileHash -Algorithm MD5 |
  Group-Object Hash |
  Where-Object { $_.Count -gt 1 } |
  ForEach-Object { Write-Output "--- HASH $($_.Name) ---"; $_.Group | ForEach-Object { Write-Output $_.Path } }
```

| Part | What it does |
|---|---|
| `Get-ChildItem -Recurse -File -Force` | Lists every file recursively (including hidden). |
| `Where-Object { ... -notmatch ... }` | Skips noise folders: `node_modules`, `.git`, `Notes_MainRepo`, reports. |
| `Get-FileHash -Algorithm MD5` | Computes an MD5 hash (content fingerprint) per file. |
| `Group-Object Hash` | Groups files that share the same hash. |
| `Where-Object { $_.Count -gt 1 }` | Keeps only groups with more than one file = duplicates. |

> Note: empty `.gitkeep` files all share the same hash — those are intentional
> placeholders and were **not** treated as duplicates.

### Duplicates found
- `test-data/uploads/sample.doc`  == `tests/14_FileUpload/sample.doc`
- `test-data/uploads/sample.jpg`  == `tests/14_FileUpload/sample.jpg`
- `test-data/uploads/sample.pdf`  == `tests/14_FileUpload/sample.pdf`
- `tests/05_Allure_Reporting/232_TestWingify.spec.ts` == `tests/05_Allure_Reporting/233_Custom_Report_TestWingify.spec.ts`

**Decision made:**
- Keep the shared copies in `test-data/uploads/`; drop the `tests/14_FileUpload/` copies.
  (Test file `264_Mixed_FileUpload_TC.spec.ts` was updated to point at the shared dir,
  so it still passes.)
- Keep **both** Wingify files.

Also worth checking same-named files across folders:

```powershell
Get-ChildItem -Recurse -File -Force |
  Where-Object { $_.FullName -notmatch '\\node_modules\\|\\\.git\\|\\Notes_MainRepo\\' } |
  Group-Object Name |
  Where-Object { $_.Count -gt 1 -and $_.Name -ne '.gitkeep' } |
  ForEach-Object { Write-Output "--- $($_.Name) ($($_.Count)) ---"; $_.Group | ForEach-Object { Write-Output $_.FullName } }
```

---

## 2. Exclude the `Notes_MainRepo` Folder

Because it is a nested repo (gitlink), it must be removed from the index. The
`--cached` flag keeps the folder on your disk (so you don't lose the local clone).

```bash
# Try the normal remove first; it errors because the staged content differs from HEAD.
git rm -r --cached Notes_MainRepo

# Force-remove from the index only (keep files on disk):
git rm -r -f --cached Notes_MainRepo
```

| Command / flag | What it does |
|---|---|
| `git rm --cached <path>` | Removes the path from Git's index but leaves the files on disk (untracked). |
| `-r` | Recursive (needed for a folder). |
| `-f` / `--force` | Overrides Git's safety check when the staged content differs from `HEAD` (common for freshly-`add`ed files). |

### Make sure it stays excluded — add to `.gitignore`
Appended to `.gitignore`:

```gitignore
# Local notes (nested clone of the upstream repo, not part of this project)
Notes_MainRepo/
```

Verify it is ignored:

```bash
git check-ignore -v Notes_MainRepo/LearningPlaywrightFundamentals3x
# output: .gitignore:14:Notes_MainRepo/   Notes_MainRepo/LearningPlaywrightFundamentals3x
```

| Command | What it does |
|---|---|
| `git check-ignore -v <path>` | Confirms the path is ignored and shows **which** `.gitignore` rule matches it. |

---

## 3. Remove the Duplicate Fixtures

Delete the duplicate copies from both the index and the working tree:

```bash
# Normal remove errors because these are newly-added (staged) files:
git rm tests/14_FileUpload/sample.doc tests/14_FileUpload/sample.jpg tests/14_FileUpload/sample.pdf

# Force it:
git rm -f tests/14_FileUpload/sample.doc tests/14_FileUpload/sample.jpg tests/14_FileUpload/sample.pdf
```

| Command | What it does |
|---|---|
| `git rm <file>` | Deletes the file from the working tree **and** stages the deletion. |
| `git rm -f <file>` | Same, but forces removal when the file was newly added (staged content ≠ `HEAD`). |
| `git rm --cached <file>` | (Alternative) removes from index only, leaving it on disk. |

### Update the test that referenced them
`tests/14_FileUpload/264_Mixed_FileUpload_TC.spec.ts` was changed so it loads the
fixtures from the shared location instead of its own folder:

```ts
// Fixtures live in the shared test-data/uploads/ directory at the repo root,
// so they are not duplicated next to every spec that needs them.
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'test-data', 'uploads');

const files = [
  path.join(UPLOAD_DIR, 'sample.pdf'),
  path.join(UPLOAD_DIR, 'sample.jpg'),
  path.join(UPLOAD_DIR, 'sample.doc'),
];
```

---

## 4. Stage Everything

```bash
git add -A
```

| Command | What it does |
|---|---|
| `git add -A` | Stages **all** changes: new files, modifications, and deletions across the repo. |
| `git add <file>` | Stages a specific file only. |
| `git add .` | Stages changes in the current directory (and below) only. |

Then re-check before committing:

```bash
git status
```

Confirm `Notes_MainRepo` is **not** listed and the duplicate fixtures are gone.

---

## 5. Commit the Changes

```bash
git commit -m "Add Playwright learning scripts, AI helpers, and custom reporter"
```

| Command | What it does |
|---|---|
| `git commit -m "..."` | Records the staged changes as a new commit with the given message. |

### Multi-line message (recommended) — via a file
On **Windows `cmd.exe` there is no HEREDOC** (`<<'EOF'`), so write the message to a
file and use `-F`:

```bash
git commit -F "C:\path\to\commit_msg.txt"
```

The message file used:

```
Add Playwright learning scripts, AI helpers, and custom reporter

Adds topic-by-topic Playwright test suites (basics through advanced
frameworks), AI agent helpers, a custom reporter, and shared test data.

Co-authored-by: CommandCodeBot <noreply@commandcode.ai>
```

| Command / flag | What it does |
|---|---|
| `git commit -F <file>` | Uses the file's contents as the commit message (supports multi-line). |
| `git commit -m "<msg>"` | Inline single message. |
| `git commit --amend` | Replaces the **last** commit (avoid if already pushed). |

Result of our commit:

```
[main a8b622f] Add Playwright learning scripts, AI helpers, and custom reporter
 107 files changed, 5114 insertions(+)
```

---

## 6. Push to the Remote Repository

```bash
git push origin main
```

| Command | What it does |
|---|---|
| `git push origin main` | Uploads local `main` commits to the `origin` remote's `main` branch. |
| `git push -u origin main` | Same, **and** sets `origin/main` as the upstream for local `main` (only needed the first time). |
| `git push --force` | Overwrites remote history — **dangerous**, avoid unless you know why. |

Result:

```
To https://github.com/Shashirehp/Learning_PlaywrightFundaments_with_Scripts.git
   435b11b..a8b622f  main -> main
```

If prompted, enter GitHub credentials (or use a Personal Access Token / credential
manager) when Git asks for a username and password.

---

## 7. Verify the Push

```bash
git status          # expect: "Your branch is up to date with 'origin/main'." + clean tree
git log --oneline -3
```

```
a8b622f Add Playwright learning scripts, AI helpers, and custom reporter
435b11b Add Playwright architecture diagram
b305f0e Add Playwright fundamentals project with README
```

---

## Full Command Sequence (quick reference)

```bash
# 1. Inspect
git status
git status --porcelain --untracked-files=all
git remote -v
git log --oneline -10
git ls-files -s

# 2. Exclude Notes_MainRepo (keep it on disk)
git rm -r -f --cached Notes_MainRepo
# ...then add "Notes_MainRepo/" to .gitignore
git check-ignore -v Notes_MainRepo/LearningPlaywrightFundamentals3x

# 3. Remove duplicate fixtures
git rm -f tests/14_FileUpload/sample.doc tests/14_FileUpload/sample.jpg tests/14_FileUpload/sample.pdf
# ...and repoint tests/14_FileUpload/264_Mixed_FileUpload_TC.spec.ts to test-data/uploads

# 4. Stage
git add -A
git status

# 5. Commit
git commit -F "commit_msg.txt"

# 6. Push
git push origin main

# 7. Verify
git status
git log --oneline -3
```

---

## Notes / Gotchas

- A **gitlink** (`160000`) is a folder that is itself a Git repo. `git add` records
  only a commit pointer, not the files inside. Use `git rm --cached` + `.gitignore`
  to keep it out of the parent repo.
- `git rm` fails with *"staged content different from both the file and HEAD"* for
  files that were just `git add`ed — add `-f` to force.
- Identical files at **different paths** are not a Git problem (Git deduplicates
  content internally). Duplicates were removed here for repo cleanliness, not
  because of a Git error.
- `.gitkeep` files are all empty and share one hash — never treat them as duplicates.
- Windows `cmd.exe` has no shell HEREDOC; use `git commit -F <file>` instead.
- Never run `git push --force` on a shared branch unless the team agrees.
