---
session_date: 2026-04-02
status: poc_complete_with_known_issues
next_session_priority: fix_ci_deployment_and_version_maintenance
repository: https://github.com/tamtamresearch/a-standard-repo
---

# Session Handoff: Versioned Standards Documentation POC

**Date:** April 2, 2026  
**Repository:** https://github.com/tamtamresearch/a-standard-repo  
**Status:** POC Complete - Manual deployment works, CI needs fixes

---

## 🎯 What Was Accomplished

### ✅ POC Successfully Demonstrates

1. **Repository Pattern Works**
   - Clean separation: main branch (source) vs. gh-pages (deployment)
   - No build artifacts committed to main
   - Framework-agnostic deployment pattern proven

2. **Multiple Versions Published**
   - v1.0: https://tamtamresearch.github.io/a-standard-repo/v1.0/
   - v2.0: https://tamtamresearch.github.io/a-standard-repo/v2.0/
   - v3.0: https://tamtamresearch.github.io/a-standard-repo/v3.0/
   - latest: https://tamtamresearch.github.io/a-standard-repo/latest/ (→ v3.0)
   - Version selector: https://tamtamresearch.github.io/a-standard-repo/

3. **Build Automation Works**
   - ReSpec → static HTML via Puppeteer
   - Command: `npm run build`
   - Output: build/index.html (78KB)
   - Build time: ~30 seconds

4. **Manual Deployment Works**
   - Command: `python scripts/deploy-version.py X.Y.Z`
   - Creates version directory, updates latest, pushes to GitHub
   - Verified working for all three versions

5. **Documentation Complete**
   - Technical research: `_bmad-output/planning-artifacts/research/technical-versioned-standards-docs-2026-04-02.md` (2,985 lines)
   - Project context: `_bmad-output/project-context.md` (666 lines)
   - README.md: Complete usage guide

---

## ❌ Known Issues to Fix

### Issue #1: GitHub Actions Deployment Fails

**Problem:**
- CI workflows report "success" but don't actually push to gh-pages
- Local manual deployment works perfectly
- Root cause: Git authentication/remote configuration in CI temp directory

**Symptoms:**
- Workflow status: "✅ success"
- But: gh-pages branch not updated
- Logs show: "Skipping push (no changes)" or authentication errors

**Why it happens:**
- Deploy script clones gh-pages to temp directory
- Makes changes and commits successfully
- But `git push origin gh-pages` from temp dir has auth issues in CI
- GITHUB_TOKEN might not be properly configured for temp clone

**Current Workaround:**
```bash
# Local deployment works:
python scripts/deploy-version.py X.Y.Z
# Pushes successfully to GitHub
```

**Recommended Fix for Next Session:**

**Option A: Use ghp-import (RECOMMENDED)**
```python
# Install ghp-import
pip install ghp-import

# Replace deploy logic with:
import subprocess
subprocess.run([
    'ghp-import',
    '-n',  # Include .nojekyll file
    '-p',  # Push to origin
    '-f',  # Force push
    '-m', f'Deploy v{version}',
    '-b', 'gh-pages',
    'build/'  # Directory to import
])
```

Benefits:
- Proven tool, handles git complexities
- Works reliably in CI
- Maintained by community
- No temp directory issues

**Option B: Fix Authentication**
- Configure git credentials in temp directory
- Use git credential helper
- More complex, more fragile

**Option C: Use GitHub Action**
- Replace our script with `peaceiris/actions-gh-pages@v3`
- Proven to work in CI
- Less custom code

### Issue #2: Version Fixing Strategy

**Current Problem:**
- Tags are immutable (as they should be)
- But: if v1.0 has a typo, how do we fix it?
- Current approach: create v1.0.1
- Question: Do we want mutable versions for editorial fixes?

**User's Concern:**
"Once we create and publish a version, we might need to fix some editorial things like typos etc. I see we use tags, this would probably not allow fixing small typos and re-publish for given version. I would expect branches for maintaining the version."

**Two Schools of Thought:**

**Approach A: Immutable Versions (Current, Standards Best Practice)**
```
v1.0 has typo → create v1.0.1 (patch version)
URLs:
  https://.../v1.0/      # Original (typo remains)
  https://.../v1.0.1/    # Fixed version
  https://.../latest/    # Points to v1.0.1
```

**Pros:**
- Persistent URIs never change
- Citations remain valid
- Clear version history
- Follows semantic versioning

**Cons:**
- Typo in v1.0 stays forever
- Need new version for small fixes
- Multiple "essentially same" versions

**Approach B: Mutable Versions with Branches**
```
v1.0 has typo → update release/v1.0 branch → re-deploy
URLs:
  https://.../v1.0/      # Updated content
```

**Pros:**
- Can fix typos in place
- Fewer version numbers
- Editorial corrections don't need new versions

**Cons:**
- Breaks URL immutability
- Citations might reference different content over time
- Against standards best practices
- Need branch maintenance workflow

**Recommended Hybrid Approach:**

Use **tags for releases** but **branches for maintenance**:

```
Workflow:
1. Create release/v1.0 branch from master
2. Tag v1.0 from that branch
3. Deploy from tag
4. If typo found:
   - Fix in release/v1.0 branch
   - Option A: Re-tag v1.0 (force update) and re-deploy
   - Option B: Create v1.0.1 tag (semantic versioning)
```

**Implementation:**
```bash
# Create maintained version branch
git checkout -b release/v1.0
git push origin release/v1.0

# Tag for deployment
git tag v1.0
git push origin v1.0

# Fix typo later
git checkout release/v1.0
vim source/index.html  # Fix typo
git commit -m "fix: correct typo in section 3"
git push origin release/v1.0

# Re-deploy (force update tag)
git tag -f v1.0
git push -f origin v1.0  # Triggers re-deployment

# Or: semantic version
git tag v1.0.1
git push origin v1.0.1  # New version
```

**Decision needed:** Which approach do you prefer?
- **Immutable** (standards best practice)
- **Mutable** (editorial convenience)
- **Hybrid** (branches + optional re-tagging)

---

## 📁 Files Created This Session

**Configuration:**
- `.mise.toml` - Tool versions (Node.js 22, Python 3.12)
- `package.json` + `package-lock.json` - Dependencies
- `.gitignore` - Excludes build/

**Build & Deploy:**
- `scripts/build-spec.js` (186 lines) - Puppeteer-based ReSpec builder
- `scripts/deploy-version.py` (511 lines) - Version deployment automation

**Content:**
- `source/index.html` (256 lines) - ReSpec specification
- `source/config.js` (93 lines) - ReSpec configuration

**CI/CD:**
- `.github/workflows/ci.yml` - PR validation (works ✅)
- `.github/workflows/deploy.yml` - Tag deployment (needs fix ❌)

**Documentation:**
- `README.md` (249 lines) - Usage guide
- Research document (2,985 lines) - Complete technical analysis
- `project-context.md` (666 lines) - AI implementation rules

---

## 🔧 What Needs to be Done in Next Session

### Priority 1: Fix CI Deployment (HIGH)

**Task:** Replace custom deployment with ghp-import

**Steps:**
```bash
# 1. Add ghp-import to package.json
npm install --save-dev ghp-import

# 2. Simplify deploy-version.py to use ghp-import
# Remove temp directory logic
# Use: ghp-import -n -p -m "msg" -b gh-pages build/

# 3. Test in CI
git tag v1.0.1
git push --tags

# 4. Verify gh-pages updates automatically
```

**Estimated time:** 30-60 minutes

**File to edit:** `scripts/deploy-version.py` (major refactor)

### Priority 2: Define Version Maintenance Strategy (MEDIUM)

**Task:** Decide on immutable vs. mutable versions

**Questions to answer:**
1. Can published versions be updated (typo fixes)?
2. Do we use branches (release/v1.0) for maintenance?
3. Do typo fixes create v1.0.1 or update v1.0?

**Considerations:**
- Standards best practice: immutable versions
- Editorial convenience: mutable versions
- Your preference: mentioned wanting branches

**Action:** Document the decision in project-context.md

**Estimated time:** Discussion + 15 minutes implementation

### Priority 3: Improve CI Reliability (LOW)

**Current issues:**
- ReSpec detection timeout (works but slow)
- Node.js 20 deprecation warning (cosmetic)

**Improvements:**
- Use faster ReSpec detection
- Update action versions to Node.js 24
- Add retry logic for network issues

**Estimated time:** 30 minutes

---

## 📋 Commands for New Session

### Verify Current State

```bash
# Check what's deployed
curl -I https://tamtamresearch.github.io/a-standard-repo/v1.0/
curl -I https://tamtamresearch.github.io/a-standard-repo/v2.0/
curl -I https://tamtamresearch.github.io/a-standard-repo/v3.0/

# Check repository state
git status
git branch -a
git tag

# View published site
open https://tamtamresearch.github.io/a-standard-repo/
```

### Install ghp-import

```bash
# Option 1: npm
npm install --save-dev ghp-import

# Option 2: pip
pip install ghp-import

# Option 3: Add to .mise.toml
echo '"pip:ghp-import" = "latest"' >> .mise.toml
mise install
```

### Test ghp-import

```bash
# Build the spec
npm run build

# Deploy with ghp-import (test)
ghp-import -n -m "Test deployment" -b gh-pages build/

# Deploy and push
ghp-import -n -p -m "Deploy v2.0.1" -b gh-pages build/
```

### Update Deploy Script

```python
# New simplified deploy-version.py structure:

def deploy_version(version):
    # 1. Build
    run_cmd(["npm", "run", "build"])
    
    # 2. Copy to versioned directory structure
    build_versioned_structure(version)  # Creates temp dir with v{version}/
    
    # 3. Use ghp-import to deploy
    run_cmd([
        'ghp-import',
        '-n',  # .nojekyll
        '-p',  # push
        '-m', f'Deploy v{version}',
        '-b', 'gh-pages',
        'build-versioned/'  # Temp dir with v1.0/, v2.0/, etc.
    ])
```

---

## 🧭 Context for New Session

### Key Insights to Remember

1. **ReSpec Build Works** - Don't debug this, it's fine
   - Timeout issue is cosmetic (fallback works)
   - Output is correct (78KB HTML)

2. **Local Deployment Works** - Pattern is proven
   - `python scripts/deploy-version.py X.Y.Z` succeeds
   - Only CI automation needs fixing

3. **GitHub Pages Configured** - Don't touch this
   - Serves from gh-pages branch ✅
   - Base URL: https://tamtamresearch.github.io/a-standard-repo/

4. **Version Selector Works** - HTML generation is correct
   - index.html shows all versions
   - Styling is good

### What NOT to Debug

- ❌ ReSpec build process (working fine)
- ❌ Puppeteer timeout (cosmetic, has fallback)
- ❌ Version selector HTML (correct)
- ❌ Repository structure (proven pattern)

### What TO Fix

- ✅ CI deployment automation (use ghp-import)
- ✅ Version maintenance strategy (branches? tags? decision needed)

---

## 💡 Version Maintenance: My Recommendation

**Use Branches for Active Versions:**

```
Repository structure:
main               # Development
release/v1.0       # Maintenance branch for v1.0
release/v2.0       # Maintenance branch for v2.0
release/v3.0       # Maintenance branch for v3.0

Tags:
v1.0         → points to release/v1.0 (can be force-updated)
v1.0.1       → patch version (if you want semver)
```

**Workflow:**
```bash
# Create new version
git checkout main
# ... make changes ...
git checkout -b release/v1.0
git push origin release/v1.0
git tag v1.0
git push origin v1.0
# → Deploys to v1.0/

# Fix typo in v1.0 later
git checkout release/v1.0
vim source/index.html  # Fix
git commit -m "fix: typo in abstract"
git push origin release/v1.0

# Re-deploy (option A: update v1.0 in place)
git tag -f v1.0
git push -f origin v1.0
# → Overwrites v1.0/ with fixed version

# Or (option B: create patch version)
git tag v1.0.1
git push origin v1.0.1
# → Creates new v1.0.1/ directory
```

**Pros:**
- Can fix published versions
- Branch shows maintenance history
- Flexible (can choose mutable or immutable)

**Cons:**
- More branches to maintain
- Mutable approach breaks URI persistence

**Your decision needed:** Do you want:
- **Mutable versions** (force-update tags)
- **Immutable versions** (semantic versioning patches)
- **Hybrid** (branches exist, but still create new versions for fixes)

---

## 📦 Deliverables for Next Session

### To Read First

1. **This handoff document** - You're reading it
2. **project-context.md** - Implementation rules
3. **README.md** - Quick reference

### To Implement

1. **Replace deploy script with ghp-import**
   - File: `scripts/deploy-version.py`
   - Estimated time: 30-60 minutes
   - Benefit: Reliable CI deployment

2. **Decide version maintenance strategy**
   - Create `docs/version-maintenance-strategy.md`
   - Implement branch workflow if desired
   - Update deploy script accordingly

3. **Test CI deployment end-to-end**
   - Tag a version
   - Verify GitHub Actions succeeds
   - Verify gh-pages updates
   - Verify site publishes

---

## 🚀 Quick Start for Next Session

### Immediately Run These Commands

```bash
# 1. Verify current state
git status
git log --oneline -5
git branch -a

# 2. Check published site
open https://tamtamresearch.github.io/a-standard-repo/

# 3. Check what's on gh-pages
git checkout gh-pages
ls -la
git log --oneline -5
git checkout master

# 4. Review open issues
gh run list --limit 5
```

### Then Follow This Plan

**Step 1: Install ghp-import (5 min)**
```bash
npm install --save-dev ghp-import
# or
pip install ghp-import
```

**Step 2: Test ghp-import manually (10 min)**
```bash
# Build first
npm run build

# Test ghp-import
ghp-import -n -m "Test ghp-import" -b gh-pages build/
# This should work immediately!

# Check gh-pages
git checkout gh-pages
git log -1
git checkout master
```

**Step 3: Update deploy-version.py (30 min)**
```python
# Simplified structure:
def deploy_version(version):
    # 1. Build
    run(['npm', 'run', 'build'])
    
    # 2. Create versioned structure
    create_version_structure(version)  # build/ → build-versioned/vX.Y/
    
    # 3. Deploy with ghp-import
    run([
        'ghp-import',
        '-n',  # .nojekyll
        '-p',  # push  
        '-m', f'Deploy v{version}',
        '-b', 'gh-pages',
        'build-versioned/'
    ])
    
    # 4. Update version selector (separate commit)
    update_version_selector()
```

**Step 4: Test CI (10 min)**
```bash
git tag v1.0.1
git push --tags
# Wait for GitHub Actions
# Check: https://tamtamresearch.github.io/a-standard-repo/v1.0.1/
```

---

## 🎓 Lessons Learned This Session

### What Worked Well

1. **Research first** - Technical research saved time
2. **ReSpec is right tool** - W3C style, domain standard
3. **Puppeteer build** - Flexible, works offline
4. **Repository pattern** - Proven clean separation
5. **Local testing** - Found issues before CI

### What Was Challenging

1. **Git in temp directories** - Complex auth in CI
2. **Too custom** - Reinventing ghp-import's wheel
3. **Error handling** - Masked real issues
4. **Many iterations** - CI feedback loop slow

### Key Takeaway

**Don't reinvent git deployment tools.** Use ghp-import or GitHub Actions. Our custom script works locally but has CI authentication complexity that ghp-import already solved.

---

## 📝 Important Files Reference

### Main Branch Files
```
.mise.toml                    # Tool versions
package.json                  # Dependencies
source/index.html             # ReSpec spec (update for new versions)
source/config.js              # Version metadata (update thisVersion, prevVersion)
scripts/build-spec.js         # Build automation (works, don't touch)
scripts/deploy-version.py    # Deployment (NEEDS REWRITE with ghp-import)
.github/workflows/ci.yml      # PR validation (works ✅)
.github/workflows/deploy.yml  # Tag deployment (works but deploy.py fails)
```

### Documentation
```
_bmad-output/project-context.md                              # Implementation rules
_bmad-output/planning-artifacts/research/technical-...md     # Technical research
_bmad-output/planning-artifacts/session-handoff-2026-04-02.md # This file
README.md                                                     # Usage guide
```

### gh-pages Branch Files
```
index.html           # Version selector (auto-generated)
v1.0/index.html      # Version 1.0 spec
v2.0/index.html      # Version 2.0 spec
v3.0/index.html      # Version 3.0 spec
latest/index.html    # → v3.0
README.md            # "Don't edit manually" notice
```

---

## 🎬 Next Session Action Items

### Must Do (Critical Path)

- [ ] **Install ghp-import** (5 min)
  ```bash
  npm install --save-dev ghp-import
  ```

- [ ] **Rewrite deploy-version.py to use ghp-import** (30-60 min)
  - Remove temp directory logic
  - Use ghp-import for deployment
  - Keep version structure logic (vX.Y/, latest/, index.html)

- [ ] **Test CI deployment** (15 min)
  ```bash
  git tag v1.0.1 -m "Test CI"
  git push --tags
  # Verify deployment succeeds
  ```

### Should Do (Important)

- [ ] **Decide version maintenance strategy** (15 min)
  - Immutable vs. mutable versions
  - Document decision
  - Update workflow if using branches

- [ ] **Update README** (10 min)
  - Add note about current CI limitation
  - Document manual deployment as fallback
  - Update once CI fixed

### Nice to Have

- [ ] Fix ReSpec detection timeout (cosmetic)
- [ ] Update GitHub Actions to Node.js 24
- [ ] Add more content examples
- [ ] Add RDF output generation

---

## 🎯 Success Criteria for Next Session

**Session Complete When:**
1. ✅ CI deployment works automatically (tag → deployed)
2. ✅ Version maintenance strategy documented
3. ✅ No manual intervention required for deployment

**Test:**
```bash
# This should work end-to-end:
git tag v4.0 -m "Test version"
git push --tags
# Wait 3 minutes
curl https://tamtamresearch.github.io/a-standard-repo/v4.0/
# Should return 200 OK
```

---

## 💬 Prompt for New Session

**Suggested opening message:**

```
Continue POC for versioned standards documentation.

Current status:
- v1.0, v2.0, v3.0 deployed manually (working)
- CI deployment fails (authentication issues)
- Need to replace custom deploy script with ghp-import

Read handoff document:
_bmad-output/planning-artifacts/session-handoff-2026-04-02.md

Priority:
1. Install and integrate ghp-import for CI deployment
2. Decide on version maintenance strategy (branches vs tags)
3. Test full CI workflow end-to-end

Repository: https://github.com/tamtamresearch/a-standard-repo
```

---

## 🔗 Useful Links

- **Published site:** https://tamtamresearch.github.io/a-standard-repo/
- **Repository:** https://github.com/tamtamresearch/a-standard-repo
- **GitHub Actions:** https://github.com/tamtamresearch/a-standard-repo/actions
- **ghp-import docs:** https://github.com/c-w/ghp-import
- **ReSpec docs:** https://respec.org/docs/

---

## ✅ POC Status: 90% Complete

**What's Proven:**
- ✅ Repository pattern works
- ✅ Build automation works
- ✅ Multi-version hosting works
- ✅ Manual deployment works

**What Needs Fixing:**
- ❌ CI automation (authentication issue)
- ⚠️ Version maintenance strategy (decision needed)

**Bottom Line:**
The POC **successfully proves** the repository organization pattern for versioned standards documentation. The remaining work is polishing the automation (using proven tools like ghp-import) and making strategic decisions about version maintenance.

You can confidently use this pattern and swap ReSpec for custom PHP or other tools later!

---

**End of Handoff Document**

Ready for new session when you are!
