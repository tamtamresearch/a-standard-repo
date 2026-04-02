# Version Maintenance Strategy

## Overview

This document describes how to maintain and fix published versions of the standard.

## Core Principle: Semantic Versioning

We follow **semantic versioning** (semver) for all releases:
- **MAJOR.MINOR.PATCH** (e.g., 1.0.0, 1.0.1, 2.0.0)

## Version Immutability

### Published Versions are Immutable

Once a version is published (deployed to GitHub Pages), the content at that URL should **not change**. This ensures:
- **Persistent URIs**: Citations remain valid forever
- **Reproducibility**: Readers always see the same content
- **Trust**: Standards documents maintain integrity

### Making Corrections

If you discover an error in a published version, create a new patch version:

```bash
# Found typo in v1.0.0
# Don't modify v1.0.0 - create v1.0.1 instead

# 1. Fix the issue in source files
vim source/index.html

# 2. Commit the fix
git commit -m "fix: correct typo in abstract"

# 3. Tag the patch version
git tag -a v1.0.1 -m "Fix: correct typo in abstract"

# 4. Push (CI deploys automatically)
git push origin v1.0.1
```

**Result:**
- `https://.../v1.0.0/` - Original with typo (unchanged)
- `https://.../v1.0.1/` - Fixed version
- `https://.../latest/` - Points to v1.0.1

### Version Categories

**PATCH version (X.Y.Z)** - For:
- Typo corrections
- Grammar fixes
- Broken links
- Clarifications that don't change meaning
- Minor formatting improvements

**MINOR version (X.Y.0)** - For:
- New optional features
- Additional examples
- New non-breaking sections
- Deprecation notices

**MAJOR version (X.0.0)** - For:
- Breaking changes
- Incompatible updates
- Structural reorganization
- Requirement changes

## Alternative: Mutable Versions (NOT RECOMMENDED)

While technically possible to force-update tags and redeploy, this approach:
- ❌ Breaks URI persistence
- ❌ Violates standards best practices
- ❌ May confuse citations and references
- ❌ Creates ambiguity about "what is v1.0?"

**We do not use this approach in this project.**

## Workflow Examples

### Example 1: Editorial Fix

```bash
# Scenario: Typo found in v2.3.0

# Fix source
vim source/index.html
git commit -m "fix: correct spelling in section 4"

# Deploy as patch
git tag -a v2.3.1 -m "Fix spelling in section 4"
git push origin v2.3.1

# Result: v2.3.0 unchanged, v2.3.1 has fix
```

### Example 2: Adding New Section

```bash
# Scenario: Adding optional guidance to v2.3.1

# Add content
vim source/index.html
git commit -m "feat: add implementation guidelines"

# Deploy as minor version
git tag -a v2.4.0 -m "Add implementation guidelines"
git push origin v2.4.0

# Result: v2.3.x series unchanged, v2.4.0 is new
```

### Example 3: Breaking Change

```bash
# Scenario: Restructuring entire standard

# Major rewrite
vim source/index.html
git commit -m "refactor: restructure standard sections"

# Deploy as major version
git tag -a v3.0.0 -m "Restructured standard with breaking changes"
git push origin v3.0.0

# Result: v2.x series unchanged, v3.0.0 is new major release
```

## Version Lifecycle

### Active Development

Work always happens on the `master` branch:
- Edit `source/` files
- Commit changes
- Push to GitHub
- Tag when ready to release

### Published Versions

Once tagged and deployed:
- Immutable (don't modify)
- Forever available at versioned URL
- May be superseded by newer versions

### Latest Version

The `latest/` URL always points to the newest version:
- Updated automatically on each deployment
- Use for "always get newest" links
- Not stable for citations (use versioned URLs instead)

## Best Practices

### Do ✅
- Use semantic versioning consistently
- Tag from `master` branch
- Write clear tag messages
- Test builds locally before tagging
- Create patch versions for fixes
- Maintain changelog

### Don't ❌
- Modify published versions in place
- Force-push tags
- Delete published tags (unless immediately catching mistake)
- Skip version numbers
- Use non-semver tags (v1.0-beta should be v1.0.0-beta)

## Questions?

For the philosophical debate about mutable vs. immutable versions, see the [session handoff document](../_bmad-output/planning-artifacts/session-handoff-2026-04-02.md#issue-2-version-fixing-strategy).

**This project follows immutable versions per standards best practices.**
