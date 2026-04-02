---
project_name: standard-repo-poc
user_name: vlcinsky
date: 2026-04-02
purpose: proof-of-concept
research_completed: 2026-04-02
sections_completed: ['objective', 'technology_stack', 'repository_architecture', 'implementation_rules', 'anti_patterns']
---

# Project Context for AI Agents

*This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss.*

---

## Project Objective

This is a **proof of concept** to demonstrate how to maintain versioned standards documentation with:
- Multiple published versions (v1, v2, v3, latest) accessible simultaneously
- Clean separation between source files and built artifacts
- GitHub Pages deployment
- Framework-agnostic approach (easy to swap tools later)

**Key Insight:** The challenge is NOT the documentation framework—it's the **repository organization pattern**. 

**Critical Requirement:** We need to support standards that will evolve (like mobility DCAT-AP) without the organizational chaos found in existing implementations.

---

## Technology Stack & Versions

**Recommended Stack (from research):**

### Core Tools
- **Node.js:** v22 (LTS) - For ReSpec and build automation
- **Python:** 3.12 - For deployment scripts  
- **mise:** Latest - Tool version management

### Documentation Framework
- **ReSpec:** ^35.9.0 (npm package)
  - W3C standard for specifications
  - Used in Linked Data / Semantic Web domain
  - JavaScript-based, generates static HTML

### Build Dependencies
- **puppeteer:** ^23.0.0 - Headless browser for ReSpec static generation
- **http-server:** ^14.1.1 - Local development server

### Key Version Constraints
- Node.js >= 18 required (for Puppeteer)
- Python >= 3.10 for f-strings and modern syntax
- ReSpec must be loaded from CDN or npm package (not vendored)

**Tool Management:**
```toml
# .mise.toml
[tools]
node = "22"
python = "3.12"
```

---

## Critical Implementation Rules

### Repository Architecture Rules

#### Rule #1: Branch Separation (CRITICAL)

**main branch:**
- ✅ **Contains:** Source files ONLY (human-authored)
- ✅ **Default branch:** Yes
- ✅ **Protected:** Require PR reviews
- ❌ **Never contains:** Build artifacts, generated HTML

**gh-pages branch:**
- ✅ **Contains:** Built artifacts ONLY (generated HTML)
- ✅ **Managed by:** GitHub Actions exclusively  
- ✅ **Protected:** No direct pushes allowed
- ❌ **Never contains:** Source files, build scripts

**Why this matters:**
- Violating this rule leads to 500MB+ repositories (should be ~5MB)
- Mixed source/artifacts cause merge conflicts in generated files
- PR reviews become impossible (1000s of lines of generated diffs)
- Can't rollback cleanly to source state

#### Rule #2: Directory Structure Pattern

**main branch structure:**
```
standard-repo/
├── source/              # ReSpec source files
│   ├── index.html       # Main specification
│   └── config.js        # ReSpec configuration
├── scripts/
│   ├── build-spec.js    # ReSpec → static HTML (Puppeteer)
│   └── deploy-version.py # Git operations for versioning
├── .github/workflows/
│   ├── ci.yml           # PR validation
│   └── deploy.yml       # Version deployment
├── .mise.toml           # Tool versions
├── package.json         # Node dependencies
├── .gitignore           # MUST ignore build/
└── README.md
```

**gh-pages branch structure (auto-generated):**
```
gh-pages/
├── index.html           # Version selector (generated)
├── v1.0/
│   └── index.html       # Built v1.0 spec (immutable)
├── v2.0/
│   └── index.html       # Built v2.0 spec (immutable)
├── v3.0/
│   └── index.html       # Built v3.0 spec (immutable)
└── latest/
    └── index.html       # Copy of newest version
```

**Enforcement:**
- Add `build/` to `.gitignore` in main branch
- Protect gh-pages branch from direct pushes
- CI fails if build artifacts found in main branch PR

#### Rule #3: Version Immutability

**Once published, a version NEVER changes:**
- ✅ `v1.0/` content is frozen after deploy
- ✅ Typo fixes go to `v1.0.1/` (new version)
- ❌ Never edit `v1.0/` to fix typos
- ❌ Never delete published versions

**Why:** 
- Persistent URIs must remain valid
- Citations in papers reference specific versions
- Breaking this rule breaks the semantic web

#### Rule #4: Framework-Agnostic Build Pattern

**The deployment script doesn't care about the framework:**

```javascript
// scripts/build-spec.js interface:
// Input: source/ directory
// Output: build/index.html MUST exist after running
// That's it!
```

**This means:**
- ReSpec can be swapped for mdBook, custom PHP, etc.
- Only `scripts/build-spec.js` changes
- `scripts/deploy-version.py` remains unchanged
- Repository pattern persists regardless of tool

**Example swap (ReSpec → mdBook):**
```bash
# Change build-spec.js to:
execSync('mdbook build source -d ../build');
# deploy-version.py: NO CHANGES NEEDED
```

### Build Process Rules

#### Rule #5: ReSpec Static Generation

**ReSpec must generate static HTML (no runtime JavaScript):**

```javascript
// build-spec.js pattern:
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(`file://${inputFile}`);

// CRITICAL: Wait for ReSpec to finish
await page.waitForFunction(() => window.respecIsReady);

// Extract processed HTML
const html = await page.content();
fs.writeFileSync(outputFile, html);
```

**Why Puppeteer over respec CLI:**
- Full control over rendering
- Can inject custom processing
- Better error handling
- Consistent with future custom needs

**Timeouts:**
- Default: 60 seconds
- Complex specs may need: 120 seconds
- Set in `build-spec.js` options

#### Rule #6: Build Validation

**Every build MUST be validated before deployment:**

```javascript
// Checks required in ci.yml:
1. Output file exists (build/index.html)
2. File size > 10KB (not empty)
3. No "respec-error" strings in output
4. Valid HTML5 (optional but recommended)
```

**Enforcement:**
- CI workflow runs on every PR
- Merge blocked if validation fails
- No exceptions for "quick fixes"

### Deployment Rules

#### Rule #7: Tag-Based Versioning

**Deployments triggered by Git tags ONLY:**

```bash
# Correct workflow:
git tag -a v1.0.0 -m "Release v1.0.0"
git push --tags
# → GitHub Actions deploys automatically

# WRONG: Manual deployment
python scripts/deploy-version.py 1.0.0  # ❌ Only for testing
```

**Tag naming convention:**
- Releases: `v1.0.0`, `v1.1.0`, `v2.0.0` (semantic versioning)
- Drafts: `v1.0.0-draft.1` (optional, for previews)
- Never: `release-1.0`, `version1`, `v1` (inconsistent)

#### Rule #8: Automated Deployment Only

**GitHub Actions handles ALL production deployments:**

```yaml
# .github/workflows/deploy.yml must:
1. Extract version from tag
2. Run npm run build
3. Run deploy-version.py
4. Push to gh-pages
5. Never require manual intervention
```

**Manual deployment is ONLY for:**
- Local testing with `--no-push` flag
- Debugging deployment issues
- Never for production

#### Rule #9: Version Directory Naming

**Strict naming convention:**
```
✅ v1.0/    (lowercase 'v', dot separator)
✅ v1.1/
✅ v2.0/
❌ V1.0/    (uppercase)
❌ v1_0/    (underscore)
❌ 1.0/     (no 'v' prefix)
```

**Why:**
- Consistent URLs
- Easier to parse in scripts
- Matches Git tag pattern

#### Rule #10: Latest Alias Management

**`latest/` always points to newest released version:**

```python
# In deploy-version.py:
if make_latest:  # Default: True
    shutil.copytree(version_dir, latest_dir)
```

**When NOT to update latest:**
- Deploying old version fix (v1.0.1 when v2.0 exists)
- Deploying preview/draft versions
- Explicitly set `--no-latest` flag

### Configuration Rules

#### Rule #11: ReSpec Configuration

**config.js must set version URLs correctly:**

```javascript
var respecConfig = {
  thisVersion: "https://your-org.github.io/repo/v1.0/",
  latestVersion: "https://your-org.github.io/repo/latest/",
  prevVersion: null,  // Or URL of previous version
  // ... other config
};
```

**Critical fields that MUST be updated per version:**
- `thisVersion` - Must match deployed directory
- `prevVersion` - Must point to actually published previous version
- `publishDate` - Must be deployment date

**Fields that should NOT change between versions:**
- `shortName`
- `github.repoURL`
- `latestVersion` (always points to /latest/)

#### Rule #12: mise.toml Management

**Tool versions pinned in .mise.toml:**

```toml
[tools]
node = "22"      # NOT "latest" - be explicit
python = "3.12"  # NOT "3" - specify minor version
```

**Why:**
- Reproducible builds across machines
- CI matches local development
- Prevent surprise breakage from tool updates

**Updating versions:**
- Test locally first
- Update .mise.toml
- Commit with clear message: "chore: update Node to v22"
- Verify CI passes

### Git Workflow Rules

#### Rule #13: .gitignore Enforcement

**MUST be in .gitignore:**
```gitignore
# Build artifacts (CRITICAL)
build/
dist/

# Dependencies
node_modules/
__pycache__/

# mise
.mise.lock

# OS
.DS_Store
```

**Test before every commit:**
```bash
git status | grep build/  # Should return nothing
```

#### Rule #14: Commit Message Pattern

**For version releases:**
```bash
git commit -m "chore: prepare v1.0.0"
git tag -a v1.0.0 -m "Release v1.0.0: Initial standard"
```

**For source changes:**
```bash
git commit -m "docs: update vocabulary section"
git commit -m "fix: correct example JSON-LD"
git commit -m "feat: add new class definitions"
```

**Never:**
```bash
git commit -m "update"  # ❌ Too vague
git commit -m "Release 1.0.0"  # ❌ Use tags for releases
```

### Testing Rules

#### Rule #15: Local Testing Required

**Before pushing tag, test locally:**

```bash
# 1. Build locally
npm run build

# 2. Verify output
ls -lh build/index.html
open build/index.html  # Visual check

# 3. Test deployment (without push)
python scripts/deploy-version.py X.Y.Z --no-push

# 4. Check generated structure
git checkout gh-pages
ls -la vX.Y.Z/
git checkout main

# Only then push tag
```

**Never skip testing:**
- Even for "trivial" changes
- Even for typo fixes
- Even when "in a hurry"

#### Rule #16: CI Must Pass

**Never merge PR if CI fails:**
- Even if "failure is unrelated" (it's not)
- Even if "it will be fixed later" (it won't)
- Even if "just a draft" (drafts should pass too)

**Fix the CI failure, then merge.**

### Documentation Rules

#### Rule #17: README Maintenance

**README.md must document:**
- Quick start for contributors
- How to edit source files
- How to test locally
- How to deploy versions
- Repository structure

**Update when:**
- Adding new scripts
- Changing build process
- Updating tool versions
- Changing deployment workflow

#### Rule #18: Version Changelog

**Each version should document changes:**

```html
<!-- In source/index.html -->
<section class="appendix" id="changelog">
  <h2>Change Log</h2>
  
  <section id="changes-v1-1">
    <h3>Changes in Version 1.1</h3>
    <ul>
      <li>Added new class: Dataset</li>
      <li>Fixed typo in Example 3</li>
    </ul>
  </section>
</section>
```

**Why:**
- Users need to know what changed
- Citations reference specific versions
- Historical record of evolution

---

## Anti-Patterns to Avoid

### From mobilityDCAT-AP Analysis

**❌ NEVER: Use gh-pages as default branch**
- Consequences: Confuses contributors, mixes source/artifacts
- Correct: main = source, gh-pages = deployment

**❌ NEVER: Commit build artifacts to source branch**
- Consequences: 500MB+ repo, slow clones, merge conflicts
- Correct: build/ in .gitignore, only in gh-pages

**❌ NEVER: Manual deployment steps**
- Consequences: Human error, inconsistent releases, typos in production
- Correct: GitHub Actions automated deployment

**❌ NEVER: Mix source and generated files in same directory**
- Consequences: Can't tell what to edit, accidental changes to generated
- Correct: source/ vs. build/ separation

**❌ NEVER: Edit published versions**
- Consequences: Breaks persistent URIs, violates immutability
- Correct: New version for fixes (v1.0.1)

**❌ NEVER: Skip validation before deploy**
- Consequences: Publish broken specs, embarrassment
- Correct: CI validates every change

**❌ NEVER: Use version control for generated files**
- Consequences: Bloated repository, meaningless diffs
- Correct: Generate on deployment, not in source control

### General Anti-Patterns

**❌ NEVER: "Just this once" exceptions**
- Manual deployment "just this once" → becomes habit
- Skip testing "just this once" → breaks production
- Commit build artifact "just this once" → repository bloat

**❌ NEVER: Assume tools are installed**
- Check for node, python, mise
- Fail fast with clear error messages
- Document prerequisites

**❌ NEVER: Hard-code URLs**
```javascript
// ❌ BAD:
href: "https://example.github.io/repo/v1.0/"

// ✅ GOOD (use config):
href: respecConfig.thisVersion
```

---

## Critical Don't-Miss Rules

### Edge Cases Agents Must Handle

**Edge Case #1: First deployment (no gh-pages exists)**
- `deploy-version.py` must create orphan gh-pages branch
- Handle gracefully, not error

**Edge Case #2: Deploying older version after newer exists**
- Don't update `latest/` automatically
- Require explicit `--no-latest` flag

**Edge Case #3: ReSpec timeout**
- Complex specs may need >60s to process
- Timeout must be configurable
- Error message must be helpful

**Edge Case #4: No network for ReSpec CDN**
- ReSpec loads from W3C CDN by default
- Offline builds will fail
- Document fallback: local ReSpec copy

**Edge Case #5: Version already exists**
- Deploying v1.0.0 when v1.0.0/ exists
- Overwrite with warning, not error
- Useful for republishing with fixes

### Security Considerations

**Secrets Management:**
- `GITHUB_TOKEN` auto-provided by Actions
- Never commit tokens to repository
- Use GitHub Secrets for custom tokens

**Branch Protection:**
- Protect gh-pages from direct pushes
- Require PR reviews for main
- Enable "Require status checks"

**Dependency Scanning:**
- GitHub Dependabot enabled
- Review security updates promptly
- Pin major versions, allow minor updates

---

## Performance Gotchas

**Build Time:**
- ReSpec + Puppeteer: 10-30 seconds per build
- Complex specs: up to 60 seconds
- Acceptable for CI, might be slow locally

**Repository Size:**
- Source: ~5MB (good)
- gh-pages: ~50MB for 10 versions (acceptable)
- If >200MB: investigate duplicate assets

**GitHub Pages:**
- Deployment lag: 1-2 minutes after push
- Cache: 5-10 minutes (users may see old version)
- CDN propagation: up to 24 hours (rare)

---

## Framework-Specific Notes

### ReSpec Quirks

**Issue #1: ReSpec timeout in CI**
- Headless Chrome slower than local
- Increase timeout to 120s in CI
- Check for network issues

**Issue #2: ReSpec errors not caught**
- Errors may be in output but build succeeds
- Validation must grep for "respec-error"
- Fail build if errors found

**Issue #3: Version metadata inconsistency**
- `config.js` version vs. directory name
- Validation must check they match
- Error if mismatch

### Deployment Script Quirks

**Issue #1: Git config in CI**
- GitHub Actions needs git user.name/email
- Set before any git operations
- Use "github-actions[bot]" identity

**Issue #2: Shallow clone issues**
- `--depth 1` saves time but...
- Can't find tags or full history
- Use `fetch-depth: 0` for deployments

**Issue #3: Python subprocess encoding**
- Set `text=True` in subprocess.run
- Otherwise get bytes, not strings
- Causes issues on Windows

---

## Migration Path (Future)

### When to Swap ReSpec

**Signs it's time:**
- Need custom PHP processing (like mobilityDCAT-AP)
- ReSpec too slow for very large specs
- Need different output format
- Organization mandates different tool

**How to swap:**
1. Update `scripts/build-spec.js` to call new tool
2. Ensure output is `build/index.html`
3. Test locally
4. Deploy test version
5. No changes needed to `deploy-version.py`!

**Pattern persists:**
- Repository structure: same
- GitHub Actions: same
- Git workflow: same
- Only build script changes

---

## Conclusion

**The key insight:** This POC is about **repository organization**, not documentation tools.

**Success criteria:**
- ✅ Source and builds strictly separated
- ✅ Zero manual deployment steps
- ✅ Multiple versions accessible simultaneously
- ✅ Framework can be swapped easily
- ✅ Clean Git history (no artifacts)

**Next steps after POC:**
- Implement full workflow with ReSpec
- Test with 3-4 versions
- Document lessons learned
- Consider: custom PHP integration (mobility DCAT-AP style)
- Consider: persistent URIs via w3id.org

**Remember:** The pattern defined here will outlast any specific documentation tool. Build it right once, use it forever.

---

**References:**
- Technical Research: `_bmad-output/planning-artifacts/research/technical-versioned-standards-docs-2026-04-02.md`
- Research completed: April 2, 2026
- Based on analysis of mobilityDCAT-AP anti-patterns and industry best practices
