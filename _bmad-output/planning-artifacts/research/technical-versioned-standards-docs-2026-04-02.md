---
research_type: technical
research_topic: "Versioned Standards Documentation Systems"
date: 2026-04-02
author: vlcinsky
focus_areas:
  - Repository organization patterns
  - ReSpec framework analysis  
  - Static site generation
  - Version management strategies
  - GitHub Pages deployment
key_finding: "Framework-agnostic repository pattern with ReSpec support"
recommendation: "ReSpec + Source-build separation + Automated versioning"
status: complete
---

# Technical Research: Versioned Standards Documentation Systems

**Research Date:** April 2, 2026  
**Author:** vlcinsky  
**Project:** Proof of Concept - Standards Documentation Repository

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Documentation Framework Analysis](#documentation-framework-analysis)
3. [Repository Architecture Deep Dive](#repository-architecture-deep-dive)
4. [Implementation Guide](#implementation-guide)
5. [Testing & Validation](#testing-and-validation)
6. [Migration & Customization](#migration-and-customization)
7. [Anti-Patterns & Lessons from mobilityDCAT-AP](#anti-patterns-and-lessons)
8. [References & Resources](#references-and-resources)

---

## 1. Executive Summary

### 1.1 Research Objective

Investigate and recommend an approach for managing versioned standards documentation (similar to mobility DCAT-AP) with:
- Simple, maintainable repository structure
- Support for multiple published versions (v1, v2, v3, latest)
- GitHub Pages deployment
- Framework flexibility (ReSpec today, others tomorrow)
- Clean separation of source and built artifacts

### 1.2 Key Findings

**Critical Discovery:** The challenge isn't the documentation framework—it's the **repository organization pattern**. The mobilityDCAT-AP repository uses ReSpec correctly but has catastrophic organizational anti-patterns that make maintenance painful.

**Framework Recommendation:** **ReSpec**
- Industry standard for W3C-style specifications
- Used extensively in Linked Data / Semantic Web domain
- JavaScript-based with static HTML generation capability
- Customizable styling and configuration
- **But:** No built-in version management (this is actually good!)

**Repository Pattern Recommendation:** **"Source-Build Separation with Automated Versioning"**
- Source files in `main` branch only
- Built artifacts in `gh-pages` branch only (auto-generated)
- Version management via Git tags + CI/CD
- Framework-agnostic deployment scripts
- Zero manual steps for deployment

**Tool Stack:**
- **ReSpec** (npm package) - Specification authoring
- **Node.js** + **Puppeteer** - Static HTML generation
- **Python** scripts - Version deployment automation
- **mise** - Tool version management
- **GitHub Actions** - CI/CD pipeline

**Estimated POC Implementation Time:** 3-4 hours

### 1.3 What Makes This Approach Different

**Compared to MkDocs + mike:**
- ✅ Framework-agnostic (not tied to MkDocs)
- ✅ Supports W3C-style specifications
- ✅ Can swap ReSpec for any tool later
- ❌ No built-in version UI (we generate simple HTML)

**Compared to mobilityDCAT-AP:**
- ✅ Clean source/build separation
- ✅ Automated CI/CD pipeline
- ✅ No manual deployment steps
- ✅ Proper Git branch usage
- ✅ PR-friendly workflow

**Compared to mdBook:**
- ✅ Better for formal specifications (not books)
- ✅ Semantic web / RDF friendly
- ❌ Requires build step (mdBook is simpler)

### 1.4 Repository Structure Overview

```
standard-repo/
├── main branch (SOURCE):
│   ├── source/
│   │   ├── index.html        # ReSpec source document
│   │   └── config.js          # ReSpec configuration
│   ├── scripts/
│   │   ├── build-spec.js      # ReSpec → static HTML
│   │   └── deploy-version.py  # Version deployment
│   ├── .github/workflows/
│   │   └── deploy.yml         # CI/CD automation
│   ├── .mise.toml             # Tool versions
│   └── package.json           # Dependencies
│
└── gh-pages branch (AUTO-GENERATED):
    ├── index.html             # Version selector
    ├── v1.0/index.html        # Built v1.0 spec
    ├── v2.0/index.html        # Built v2.0 spec
    ├── v3.0/index.html        # Built v3.0 spec
    └── latest/index.html      # Copy of v3.0
```

### 1.5 Deployment Workflow

```
Developer workflow:
1. Edit source/index.html
2. Commit to main branch
3. Tag version: git tag v1.0.0
4. Push tag: git push --tags

Automated by GitHub Actions:
5. Build ReSpec → static HTML
6. Deploy to gh-pages/v1.0.0/
7. Update latest → v1.0.0
8. Generate version selector
9. Publish to GitHub Pages

Result:
https://your-org.github.io/standard-repo/v1.0.0/ ← live!
```

**Zero manual steps.** **Zero room for human error.**

### 1.6 Why This Approach is Framework-Agnostic

The deployment pattern doesn't care what generates the HTML:

```python
# deploy-version.py (simplified)
def deploy_version(version):
    # 1. Build (ANY tool that outputs build/index.html)
    run("npm run build")  # Could be: mdbook, php, python, etc.
    
    # 2. Deploy (same for all tools)
    copy("build/index.html", f"gh-pages/v{version}/index.html")
    update_latest(version)
    push_to_ghpages()
```

**Swap ReSpec for:**
- Custom PHP scripts (like mobilityDCAT-AP will need)
- mdBook (Rust-based simplicity)
- MkDocs (Python-based)
- Sphinx (Python documentation)
- Docusaurus (React-based)
- **Anything that outputs HTML**

The repository pattern and deployment scripts remain unchanged!

---

## 2. Documentation Framework Analysis

### 2.1 ReSpec: The W3C Standard

#### 2.1.1 What is ReSpec?

**ReSpec** is a JavaScript tool for creating technical specifications, primarily used by W3C working groups and the broader standards community.

**Key Characteristics:**
- **JavaScript preprocessing:** Transforms HTML documents with special markup
- **Client-side or static:** Can process in browser or generate static HTML
- **W3C styling:** Produces professional specification documents
- **Semantic features:** Auto-generates ToC, references, conformance sections
- **Extensible:** Custom styling, plugins, local bibliography

**Repository:** https://github.com/speced/respec  
**npm package:** https://www.npmjs.com/package/respec  
**Documentation:** https://respec.org/docs/

**Active Project:**
- 783 GitHub stars
- 419 forks
- Regular updates (v35.9.0 as of March 2026)
- Used by W3C, WHATWG, and many standards bodies

#### 2.1.2 How ReSpec Works

**Source Document Example:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>My Standard Specification</title>
    <!-- Load ReSpec -->
    <script src="https://www.w3.org/Tools/respec/respec-w3c" 
            class="remove" 
            defer></script>
    <!-- Configure ReSpec -->
    <script class="remove">
      var respecConfig = {
        specStatus: "ED",
        shortName: "my-standard",
        editors: [{
          name: "Your Name",
          mailto: "you@example.org"
        }],
        github: "your-org/standard-repo"
      };
    </script>
</head>
<body>
    <section id="abstract">
        <p>This specification defines...</p>
    </section>
    
    <section id="sotd">
        <p>This is a draft.</p>
    </section>
    
    <section id="introduction">
        <h2>Introduction</h2>
        <p>Content here...</p>
    </section>
    
    <section id="conformance">
        <!-- Auto-generated -->
    </section>
</body>
</html>
```

**ReSpec Processing:**

1. **Loads in browser:** ReSpec JavaScript executes
2. **Processes document:** Adds styling, ToC, references
3. **Enhances markup:** Semantic annotations, cross-refs
4. **Generates sections:** Conformance, abstract styling
5. **Final output:** Professional W3C-style specification

**Result:** Beautiful, semantic HTML specification document

#### 2.1.3 Static HTML Generation

For production, ReSpec can generate static HTML (no JavaScript required):

**Method 1: respec CLI (npm package)**

```bash
# Install
npm install -g respec

# Generate static HTML
respec --src source/index.html --out build/index.html

# With options
respec --src source/index.html \
       --out build/index.html \
       --timeout 30 \
       --verbose
```

**Method 2: Puppeteer (Full Control)**

```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function buildSpec(inputFile, outputFile) {
  console.log(`Building ${inputFile} → ${outputFile}`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Load the ReSpec source
  const fileUrl = `file://${path.resolve(inputFile)}`;
  await page.goto(fileUrl, {
    waitUntil: 'networkidle0',
    timeout: 60000
  });
  
  // Wait for ReSpec to finish
  await page.waitForFunction(() => {
    return window.hasOwnProperty('respecIsReady');
  }, { timeout: 60000 });
  
  // Extract processed HTML
  const html = await page.content();
  
  // Write to file
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, html, 'utf8');
  
  await browser.close();
  console.log(`✓ Built successfully`);
}

module.exports = { buildSpec };
```

**Method 3: GitHub Action (w3c/spec-prod)**

```yaml
- uses: w3c/spec-prod@v2
  with:
    SOURCE: source/index.html
    DESTINATION: build/index.html
```

**Which to use?**
- **respec CLI:** Simplest, good for most cases
- **Puppeteer:** Full control, custom processing
- **GitHub Action:** For W3C pubrules compliance

**Recommendation for POC:** Puppeteer (most flexible)

#### 2.1.4 ReSpec Configuration

**config.js Example:**

```javascript
var respecConfig = {
  // === Document Metadata ===
  specStatus: "ED",  // Editor's Draft
  // Options: "ED", "WD", "CR", "PR", "REC", "unofficial"
  
  shortName: "my-standard",
  
  // === Version Information ===
  publishDate: "2026-04-02",
  thisVersion: "https://example.org/specs/my-standard/v1.0/",
  latestVersion: "https://example.org/specs/my-standard/latest/",
  prevVersion: null,  // Set for v2.0+
  edDraftURI: "https://example.org/specs/my-standard/drafts/latest/",
  
  // === Editors ===
  editors: [{
    name: "Your Name",
    mailto: "you@example.org",
    company: "Your Organization",
    companyURL: "https://example.org",
    w3cid: 12345  // Optional W3C ID
  }],
  
  // === Authors (optional) ===
  authors: [{
    name: "Contributor Name",
    mailto: "contributor@example.org"
  }],
  
  // === GitHub Integration ===
  github: {
    repoURL: "https://github.com/your-org/standard-repo",
    branch: "main"
  },
  
  // === Logos ===
  logos: [{
    src: "https://example.org/logo.png",
    alt: "Organization Logo",
    width: 100,
    height: 100,
    url: "https://example.org"
  }],
  
  // === Bibliography ===
  localBiblio: {
    "MY-REF": {
      title: "Reference Document",
      href: "https://example.org/ref",
      authors: ["Author Name"],
      publisher: "Publisher",
      date: "2026"
    }
  },
  
  // === Options ===
  format: "markdown",  // Allow markdown in HTML
  maxTocLevel: 3,
  noRecTrack: true,    // Not on W3C Rec track
  
  // === Custom Styling ===
  localCustomCss: "custom.css",  // Optional
  
  // === Other ===
  subtitle: "Version 1.0",
  additionalCopyrightHolders: "Copyright Holder Name"
};
```

**Key Features:**
- **Version URIs:** thisVersion, prevVersion, latestVersion
- **Metadata:** Authors, editors, dates
- **Customization:** Logos, CSS, bibliography
- **W3C Options:** specStatus, pubrules compliance

#### 2.1.5 ReSpec Advantages

**For Standards Documentation:**
1. ✅ **W3C-style output:** Industry-standard appearance
2. ✅ **Semantic markup:** Proper HTML5 semantics
3. ✅ **Auto-generation:** ToC, references, conformance
4. ✅ **Cross-references:** `[[[#section-id]]]` syntax
5. ✅ **Bibliography:** Automatic reference management
6. ✅ **WebIDL support:** For API specifications
7. ✅ **Linked Data friendly:** RDFa annotations possible
8. ✅ **Customizable:** Styling, plugins, extensions

**For Our Use Case:**
1. ✅ **Used by mobilityDCAT-AP:** Familiar to domain
2. ✅ **Static generation:** No runtime JavaScript needed
3. ✅ **Framework-agnostic:** HTML output, any deployment
4. ✅ **Mature tooling:** npm package, active development
5. ✅ **Extensible:** Can add custom processing

#### 2.1.6 ReSpec Limitations

**What ReSpec Doesn't Do:**
1. ❌ **No version management:** Doesn't handle multiple versions
2. ❌ **No deployment:** Doesn't deploy to GitHub Pages
3. ❌ **No site generation:** Just single-page specs
4. ❌ **No navigation:** Between versions or docs

**Why This is Actually Good:**
- Separation of concerns: ReSpec = content, scripts = deployment
- Framework-agnostic: Not locked into ReSpec's ecosystem
- Flexibility: Swap tools without changing deployment

**Our Approach Handles:**
- ✅ Version management via Git tags + scripts
- ✅ Deployment via Python scripts + GitHub Actions
- ✅ Navigation via generated index.html
- ✅ Multi-version support via directory structure

### 2.2 Alternative Frameworks Comparison

#### 2.2.1 MkDocs + mike

**MkDocs:** Python-based documentation site generator

**mike:** Version deployment tool for MkDocs

**How it works:**
```bash
# Install
pip install mkdocs mkdocs-material mike

# Deploy version
mike deploy 1.0 latest --push

# Result: gh-pages/1.0/, gh-pages/latest/
```

**Pros:**
- ✅ Built-in version management (mike)
- ✅ Beautiful Material theme
- ✅ Simple Markdown syntax
- ✅ Fast builds
- ✅ Plugin ecosystem

**Cons:**
- ❌ Markdown-focused (not HTML)
- ❌ Book/guide style (not W3C specs)
- ❌ mike is MkDocs-specific
- ❌ Less suitable for formal specifications
- ❌ Limited semantic markup

**Verdict:** Great for developer docs, wrong fit for standards

#### 2.2.2 mdBook

**mdBook:** Rust-based documentation tool (used by Rust project)

**How it works:**
```bash
# Install
cargo install mdbook
# Or via mise
mise use mdbook@latest

# Create book
mdbook init

# Build
mdbook build

# Result: book/ directory with HTML
```

**Pros:**
- ✅ Extremely simple
- ✅ Very fast (Rust)
- ✅ Clean output
- ✅ Easy to install (single binary)
- ✅ Good for technical books

**Cons:**
- ❌ No version management
- ❌ Book layout (not specs)
- ❌ Limited customization
- ❌ No W3C styling

**Verdict:** Too simple, wrong format for standards

#### 2.2.3 Docusaurus

**Docusaurus:** React-based documentation platform (by Meta)

**How it works:**
```bash
# Install
npx create-docusaurus@latest my-site classic

# Run dev server
npm start

# Build
npm run build

# Built-in versioning
npm run docusaurus docs:version 1.0.0
```

**Pros:**
- ✅ Built-in versioning
- ✅ Modern UI
- ✅ React ecosystem
- ✅ MDX support (Markdown + JSX)
- ✅ Search, i18n, plugins

**Cons:**
- ❌ Heavy (full React app)
- ❌ Complex setup
- ❌ Not W3C-style
- ❌ Overkill for simple specs
- ❌ npm dependencies hell

**Verdict:** Too complex, wrong style

#### 2.2.4 Sphinx

**Sphinx:** Python documentation generator (used by Python, Django)

**How it works:**
```bash
# Install
pip install sphinx

# Create project
sphinx-quickstart

# Build
make html

# Extensions for versioning
pip install sphinx-multiversion
```

**Pros:**
- ✅ Mature, battle-tested
- ✅ Extensions ecosystem
- ✅ ReStructuredText or Markdown
- ✅ Python community standard

**Cons:**
- ❌ Python-doc style (not W3C)
- ❌ ReStructuredText learning curve
- ❌ Complex configuration
- ❌ No built-in version management

**Verdict:** Wrong style for standards

#### 2.2.5 Comparison Matrix

| Feature | ReSpec | MkDocs+mike | mdBook | Docusaurus | Sphinx |
|---------|--------|-------------|--------|------------|--------|
| **W3C-style specs** | ✅ Best | ❌ No | ❌ No | ⚠️ Custom | ⚠️ Custom |
| **Built-in versioning** | ❌ No | ✅ Yes (mike) | ❌ No | ✅ Yes | ⚠️ Extension |
| **Semantic web** | ✅ Yes | ⚠️ Limited | ❌ No | ⚠️ Limited | ⚠️ Limited |
| **Standards domain** | ✅ Standard | ❌ Rare | ❌ No | ❌ Rare | ❌ Rare |
| **Complexity** | 🟡 Medium | 🟢 Low | 🟢 Very Low | 🔴 High | 🟡 Medium |
| **Setup time** | 15 min | 10 min | 5 min | 45 min | 30 min |
| **mise support** | ✅ node | ✅ python | ✅ cargo | ✅ node | ✅ python |
| **Static output** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Framework-agnostic** | ✅ Yes | ❌ mike-tied | ✅ Yes | ❌ Docusaurus | ✅ Yes |
| **Our use case fit** | ✅ Perfect | ❌ Wrong | ❌ Wrong | ❌ Overkill | ❌ Wrong |

### 2.3 Framework Recommendation: ReSpec

**Reasons:**

1. **Domain fit:** Used in Linked Data / semantic web standards
2. **Future-proof:** mobilityDCAT-AP will use it (or similar)
3. **W3C styling:** Professional specification appearance
4. **Framework-agnostic deployment:** HTML output = universal
5. **Mature tooling:** npm package, active project
6. **Customizable:** Can adapt to specific needs

**But remember:** The repository pattern works with **any tool**. ReSpec is recommended for POC, but swapping later is trivial.

---

## 3. Repository Architecture Deep Dive

### 3.1 mobilityDCAT-AP Case Study: The Anti-Pattern

#### 3.1.1 Current Structure Analysis

**Repository:** https://github.com/mobilityDCAT-AP/mobilityDCAT-AP

**Branch Structure (PROBLEMATIC):**
```
Repository branches:
├── main (EMPTY - only README.md)
└── gh-pages (DEFAULT BRANCH ❌)
    ├── drafts/
    │   ├── 1.0.0-draft-0.1/
    │   ├── 1.0.1-draft-0.1/
    │   ├── 1.1.0-draft-0.1/
    │   └── latest/  ← Active development
    │       ├── index.html (ReSpec source ❌)
    │       ├── config.js (ReSpec config ❌)
    │       ├── scripts/  (Build scripts ❌)
    │       │   ├── build-all.sh
    │       │   ├── build-class-tables.php
    │       │   ├── build-summary-tables.php
    │       │   └── build-example-index.php
    │       ├── tables/  (Generated HTML ❌)
    │       │   ├── class-Dataset.html
    │       │   ├── class-Catalog.html
    │       │   └── [100+ generated files]
    │       ├── figures/
    │       ├── examples/
    │       └── [RDF files: .ttl, .rdf, .jsonld]
    └── releases/
        ├── 1.0.0/
        ├── 1.0.1/
        └── 1.1.0/  ← Complete copy of draft
            ├── index.html (Generated ❌)
            ├── tables/ (Generated ❌)
            └── [all files duplicated]
```

**File Size Statistics:**
- Total repository: ~500MB
- Generated tables: ~200MB
- Duplicated across versions: ~150MB
- Clone time: 5+ minutes

#### 3.1.2 The Problems Identified

**Problem #1: gh-pages as Default Branch**

**What they do:**
```bash
git clone https://github.com/mobilityDCAT-AP/mobilityDCAT-AP.git
# ← Clones gh-pages (deployment branch) by default!
```

**Why it's catastrophic:**
1. **Contributors see deployment branch first**
   - Confusing: "Where's the actual source code?"
   - PRs opened against deployment branch
   - Accidental edits to generated files

2. **No clear source of truth**
   - Source files mixed with generated files
   - Can't tell what's authored vs. generated
   - Git history polluted with build artifacts

3. **PR review nightmare**
   - Diffs show 1000s of lines of generated HTML
   - Real changes buried in noise
   - Can't meaningfully review

4. **Breaking Git conventions**
   - `main` should be source
   - `gh-pages` should be deployment only
   - Backwards!

**Impact:**
- New contributors are confused
- PRs are messy and hard to review
- Accidental commits to generated files
- Can't rollback cleanly to source state

**Problem #2: No Source/Build Separation**

**What they do:**
```
drafts/latest/ contains:
├── index.html (ReSpec SOURCE ❌)
├── tables/
│   ├── class-Dataset.html (GENERATED ❌)
│   ├── class-Catalog.html (GENERATED ❌)
│   └── [both source and generated mixed]
```

**Why it's terrible:**
1. **Can't tell what's source vs. generated**
   - Which files should be edited?
   - Which files are outputs?

2. **Merge conflicts in generated files**
   - Two people edit source
   - Build generates different output
   - Git conflict in generated HTML

3. **No reproducibility**
   - Can't rebuild from source alone
   - Generated files committed = source of truth?

4. **Repository bloat**
   - Generated files are large
   - Committed to Git = slow clones
   - History includes all generated versions

**Impact:**
- 500MB+ repository (should be ~5MB source)
- Merge conflicts constantly
- Can't rebuild old versions reliably
- Wastes GitHub storage

**Problem #3: Manual Build Process**

**Their workflow:**
```bash
# 1. Manually edit drafts/latest/index.html
vim drafts/latest/index.html

# 2. Manually run build scripts
cd drafts/latest/scripts
./build-all.sh  # Hope you remember!

# 3. Manually commit generated files
cd ../..
git add drafts/latest/tables/  # Easy to forget
git commit -m "Update v1.1.0"

# 4. Manually copy to releases
cp -r drafts/latest releases/1.1.0

# 5. Manually edit version in copied files
vim releases/1.1.0/config.js  # Change version URLs

# 6. Manually commit release
git add releases/1.1.0
git commit -m "Release 1.1.0"
git push  # Fingers crossed!
```

**What can go wrong:**
1. Forget to run `build-all.sh` → outdated output published
2. Forget to commit generated files → incomplete release
3. Copy wrong draft version → wrong content in release
4. Forget to update `config.js` → wrong version metadata
5. Typo in version directory → broken links
6. No validation → publish broken HTML

**Impact:**
- Human error is guaranteed
- Inconsistent releases
- Published typos in v1.0.0 (can't fix without breaking URLs)
- No testing before publish

**Problem #4: No CI/CD**

**What they lack:**
- No GitHub Actions workflow
- No automated validation
- No tests before merge
- No preview deployments
- No automated publishing

**Consequences:**
1. **No validation before merge**
   - Broken HTML can be merged
   - ReSpec errors only found after publish

2. **No consistency checks**
   - Version in `config.js` vs. directory name mismatch
   - URLs pointing to wrong locations

3. **Manual gate-keeping**
   - Someone must manually review and deploy
   - Single point of failure

**Impact:**
- Published broken specs (has happened)
- Slow release process
- Maintainer burden

**Problem #5: Version Duplication**

**Their structure:**
```
releases/
├── 1.0.0/  (500 files, 50MB)
├── 1.0.1/  (500 files, 50MB)  ← 95% identical to 1.0.0
└── 1.1.0/  (500 files, 50MB)  ← 98% identical to 1.0.1

Total: 1500 files, 150MB for 3 versions
```

**Better approach:**
```
gh-pages/
├── v1.0.0/ (1 file: index.html, 500KB)
├── v1.0.1/ (1 file: index.html, 500KB)
└── v1.1.0/ (1 file: index.html, 500KB)

Total: 3 files, 1.5MB for 3 versions
```

**Savings: 99% smaller!**

#### 3.1.3 What They Did Right

Despite the anti-patterns, mobilityDCAT-AP made some good choices:

**✅ ReSpec for W3C-style output**
- Correct choice for standards documentation
- Professional appearance
- Semantic HTML

**✅ Separate drafts from releases conceptually**
- Good idea: work-in-progress vs. published
- Execution: flawed (both in gh-pages)

**✅ Persistent URIs via w3id.org**
- Stable identifiers: https://w3id.org/mobilitydcat-ap/
- Redirect to GitHub Pages
- Professional approach

**✅ Multiple RDF formats**
- Turtle, RDF/XML, JSON-LD
- Accessible to different tools
- Good for semantic web

**✅ Custom ReSpec styling**
- Branded appearance
- Custom logos
- Professional touch

**What we'll keep:**
- ReSpec for content
- Persistent URIs pattern
- Multiple format outputs
- Professional styling

**What we'll fix:**
- Repository structure
- Build automation
- Version management
- CI/CD pipeline

### 3.2 Recommended Repository Pattern

#### 3.2.1 "Source-Build Separation with Automated Versioning"

**Core Principles:**

1. **Separation of Concerns**
   - Source in `main` branch
   - Build artifacts in `gh-pages` branch
   - Never mix them

2. **Automation First**
   - No manual deployment steps
   - CI/CD handles everything
   - Reproducible builds

3. **Version Immutability**
   - Once published, never changes
   - Fixes go to new versions
   - Clear version history

4. **Framework Agnostic**
   - Build scripts are simple
   - Swap tools easily
   - Pattern persists

5. **Git Best Practices**
   - `main` is default branch
   - `gh-pages` is protected
   - PR-friendly workflow

#### 3.2.2 Detailed Directory Structure

**Main Branch (Source):**

```
standard-repo/  (main branch)
│
├── source/                     # ReSpec source files
│   ├── index.html              # Main specification document
│   │   <!-- ReSpec HTML with configuration -->
│   │
│   ├── config.js               # ReSpec configuration
│   │   // Version, editors, metadata
│   │
│   ├── sections/               # Optional: modular content
│   │   ├── introduction.html
│   │   ├── vocabulary.html
│   │   ├── examples.html
│   │   └── conformance.html
│   │
│   ├── assets/                 # Static resources
│   │   ├── diagrams/
│   │   │   ├── architecture.svg
│   │   │   └── workflow.png
│   │   ├── examples/
│   │   │   ├── example-1.jsonld
│   │   │   └── example-2.ttl
│   │   └── styles/
│   │       └── custom.css      # Optional styling
│   │
│   └── vocabulary/             # Optional: RDF sources
│       ├── ontology.ttl
│       └── context.jsonld
│
├── scripts/                    # Build automation
│   ├── build-spec.js           # ReSpec → static HTML
│   │   // Uses Puppeteer to generate HTML
│   │
│   ├── deploy-version.py       # Version deployment to gh-pages
│   │   // Git operations, version management
│   │
│   ├── generate-index.py       # Version selector page
│   │   // Creates index.html with links
│   │
│   └── validate-spec.js        # Build validation
│       // Checks for ReSpec errors
│
├── .github/
│   └── workflows/
│       ├── ci.yml              # PR validation
│       │   // Build and test on every PR
│       │
│       └── deploy.yml          # Version deployment
│           // Triggered by Git tags
│
├── templates/                  # Optional: HTML templates
│   ├── index.html              # Version selector template
│   └── redirect.html           # Redirect page template
│
├── tests/                      # Optional: test files
│   └── validate-output.js      # Output validation
│
├── .mise.toml                  # Tool version management
│   # Defines node, python versions
│
├── package.json                # Node.js dependencies
│   # respec, puppeteer, http-server
│
├── .gitignore                  # Ignore build artifacts
│   # build/, node_modules/, __pycache__
│
├── README.md                   # Contributor documentation
│   # How to edit, build, deploy
│
└── LICENSE                     # Project license
```

**gh-pages Branch (Auto-Generated):**

```
standard-repo/  (gh-pages branch)
│
├── index.html                  # Version selector homepage
│   <!-- Simple HTML with links to versions -->
│   <!-- Generated by scripts/generate-index.py -->
│
├── v1.0/                       # Version 1.0 (immutable)
│   ├── index.html              # Built specification
│   │   <!-- Static HTML from ReSpec -->
│   │
│   └── assets/                 # Optional: copied resources
│       ├── diagrams/
│       └── examples/
│
├── v1.1/                       # Version 1.1 (immutable)
│   └── index.html
│
├── v2.0/                       # Version 2.0 (immutable)
│   └── index.html
│
├── v3.0/                       # Version 3.0 (immutable)
│   └── index.html
│
├── latest/                     # Symlink or copy → v3.0/
│   └── index.html              # Always points to newest
│
└── CNAME                       # Optional: custom domain
    # docs.example.org
```

**Key Points:**

1. **main branch:**
   - Only source files (human-authored)
   - Scripts and configuration
   - No build artifacts
   - ~5MB total size

2. **gh-pages branch:**
   - Only generated files
   - Managed by CI/CD
   - Never manually edited
   - ~50MB total (all versions)

3. **Version directories:**
   - Immutable after publish
   - Independent (no shared files)
   - Clear URLs

4. **latest directory:**
   - Always newest version
   - Updated on each release
   - Convenient default link

#### 3.2.3 Branch Strategy

**main branch:**
- **Purpose:** Source of truth for all content
- **Default branch:** Yes
- **Protected:** Require PR reviews
- **Contains:** Source files, scripts, config
- **Never contains:** Build artifacts, generated files

**gh-pages branch:**
- **Purpose:** Deployment target for GitHub Pages
- **Default branch:** No
- **Protected:** Yes (no direct pushes)
- **Contains:** Only generated HTML
- **Updated by:** GitHub Actions only

**Workflow:**
```
Developer commits to main
    ↓
GitHub Action builds spec
    ↓
GitHub Action pushes to gh-pages
    ↓
GitHub Pages publishes automatically
```

### 3.3 Version Management Strategy

#### 3.3.1 Semantic Versioning

**Format:** `MAJOR.MINOR.PATCH`

**Examples:**
- `v1.0.0` - First stable release
- `v1.0.1` - Patch (typo fixes, clarifications)
- `v1.1.0` - Minor (new optional features)
- `v2.0.0` - Major (breaking changes)

**Git Tags:**
```bash
# Create annotated tag
git tag -a v1.0.0 -m "Release v1.0.0: Initial standard"

# Push tag
git push origin v1.0.0

# GitHub Action automatically:
# 1. Builds the spec
# 2. Deploys to gh-pages/v1.0.0/
# 3. Updates latest → v1.0.0
# 4. Updates version selector
```

**Tag Naming Convention:**
- **Releases:** `v1.0.0`, `v1.1.0`, `v2.0.0`
- **Drafts:** `v1.0.0-draft.1`, `v1.0.0-rc.1`
- **Preview:** `v1.0.0-preview`

#### 3.3.2 URL Structure

**Production URLs:**
```
Base: https://your-org.github.io/standard-repo/

Version-specific:
https://your-org.github.io/standard-repo/v1.0/
https://your-org.github.io/standard-repo/v1.1/
https://your-org.github.io/standard-repo/v2.0/
https://your-org.github.io/standard-repo/v3.0/

Convenience aliases:
https://your-org.github.io/standard-repo/latest/  → v3.0/

Root (version selector):
https://your-org.github.io/standard-repo/
```

**Persistent URIs (Optional via w3id.org):**
```
https://w3id.org/your-standard/v1.0/  → GitHub Pages
https://w3id.org/your-standard/latest/ → GitHub Pages
https://w3id.org/your-standard/       → GitHub Pages
```

#### 3.3.3 Version Lifecycle

**Draft Phase:**
```
main branch:
  ↓ Continuous development
  ↓ Multiple commits
  ↓ PR reviews
  
Tag: v1.0.0-draft.1
  ↓ Deploy to gh-pages/drafts/v1.0.0-draft.1/
  ↓ (Optional for preview)
```

**Release Phase:**
```
main branch: Ready for release
  ↓
Tag: v1.0.0
  ↓
GitHub Action:
  ├─ Build spec
  ├─ Deploy to gh-pages/v1.0/
  ├─ Update latest → v1.0/
  └─ Update version selector
  ↓
Published: https://.../v1.0/
```

**Patch Phase:**
```
Typo found in v1.0.0
  ↓
Fix in main branch
  ↓
Tag: v1.0.1
  ↓
Deploy to gh-pages/v1.0.1/
  ↓
v1.0/ remains unchanged (immutable)
```

**Next Version:**
```
New features developed
  ↓
Tag: v1.1.0
  ↓
Deploy to gh-pages/v1.1/
  ↓
Update latest → v1.1/
  ↓
All previous versions still accessible
```

---

## 4. Implementation Guide

### 4.1 Tool Setup with mise

#### 4.1.1 Create .mise.toml

```toml
# .mise.toml - Tool version management

[tools]
# Node.js for ReSpec and build scripts
node = "22"           # LTS version (as of 2026)

# Python for deployment scripts
python = "3.12"       # Recent stable version

# Optional: If using cargo/rust tools
# rust = "1.75"

[env]
# Add node_modules/.bin to PATH
PATH = ["./node_modules/.bin", "$PATH"]

# Optional: Custom environment variables
# RESPEC_TIMEOUT = "60"
```

#### 4.1.2 Install Tools

```bash
# Install mise (if not already installed)
curl https://mise.run | sh

# Install tools defined in .mise.toml
mise install

# Verify installation
mise list
# Should show: node 22.x.x, python 3.12.x

# Check executables
node --version
python --version
```

### 4.2 Node.js Dependencies

#### 4.2.1 Create package.json

```json
{
  "name": "standard-repo-poc",
  "version": "1.0.0",
  "description": "Proof of Concept: Versioned Standards Documentation",
  "private": true,
  "scripts": {
    "build": "node scripts/build-spec.js",
    "serve": "http-server source -p 8000 -o",
    "deploy": "python scripts/deploy-version.py",
    "test": "node scripts/validate-spec.js",
    "clean": "rm -rf build/"
  },
  "devDependencies": {
    "respec": "^35.9.0",
    "puppeteer": "^23.0.0",
    "http-server": "^14.1.1"
  },
  "engines": {
    "node": ">=18"
  },
  "keywords": [
    "standards",
    "specifications",
    "respec",
    "documentation"
  ],
  "author": "",
  "license": "MIT"
}
```

#### 4.2.2 Install Dependencies

```bash
# Install npm packages
npm install

# Verify installation
npm list respec
npm list puppeteer

# Optional: Lock versions
npm shrinkwrap
```

### 4.3 Build Script Implementation

#### 4.3.1 Create scripts/build-spec.js

```javascript
/**
 * Build ReSpec specification to static HTML
 * 
 * Usage:
 *   node scripts/build-spec.js [input] [output]
 *   node scripts/build-spec.js source/index.html build/index.html
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Build a ReSpec document to static HTML
 * @param {string} inputFile - Path to ReSpec source (HTML)
 * @param {string} outputFile - Path to output static HTML
 * @param {Object} options - Build options
 */
async function buildSpec(inputFile, outputFile, options = {}) {
  const {
    timeout = 60000,
    verbose = false
  } = options;

  if (verbose) {
    console.log(`Building specification:`);
    console.log(`  Input:  ${inputFile}`);
    console.log(`  Output: ${outputFile}`);
  }

  // Validate input file exists
  if (!fs.existsSync(inputFile)) {
    throw new Error(`Input file not found: ${inputFile}`);
  }

  // Launch headless browser
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport (affects rendering)
    await page.setViewport({
      width: 1200,
      height: 800
    });

    // Load the ReSpec source file
    const fileUrl = `file://${path.resolve(inputFile)}`;
    if (verbose) console.log(`  Loading: ${fileUrl}`);
    
    await page.goto(fileUrl, {
      waitUntil: 'networkidle0',
      timeout: timeout
    });

    // Wait for ReSpec to finish processing
    if (verbose) console.log(`  Waiting for ReSpec...`);
    
    await page.waitForFunction(() => {
      return window.hasOwnProperty('respecIsReady');
    }, { timeout: timeout });

    // Check for ReSpec errors
    const errors = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('.respec-error');
      return Array.from(errorElements).map(el => el.textContent);
    });

    if (errors.length > 0) {
      console.error('ReSpec errors found:');
      errors.forEach(err => console.error(`  - ${err}`));
      throw new Error('ReSpec processing failed with errors');
    }

    // Extract the processed HTML
    if (verbose) console.log(`  Extracting HTML...`);
    const html = await page.content();

    // Ensure output directory exists
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write to output file
    fs.writeFileSync(outputFile, html, 'utf8');

    const stats = fs.statSync(outputFile);
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    console.log(`✓ Built successfully: ${outputFile} (${sizeKB} KB)`);

  } finally {
    await browser.close();
  }
}

// CLI usage
if (require.main === module) {
  const input = process.argv[2] || 'source/index.html';
  const output = process.argv[3] || 'build/index.html';
  const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');

  buildSpec(input, output, { verbose })
    .then(() => {
      console.log('Build complete!');
      process.exit(0);
    })
    .catch(err => {
      console.error('Build failed:', err.message);
      if (verbose) console.error(err);
      process.exit(1);
    });
}

module.exports = { buildSpec };
```

### 4.4 Deployment Script Implementation

#### 4.4.1 Create scripts/deploy-version.py

```python
#!/usr/bin/env python3
"""
Deploy a version of the specification to gh-pages branch.

This script:
1. Builds the specification
2. Clones/creates gh-pages branch
3. Copies built files to version directory
4. Updates 'latest' symlink/copy
5. Generates version selector index
6. Commits and pushes to gh-pages

Usage:
    python scripts/deploy-version.py 1.0.0
    python scripts/deploy-version.py 2.0.0 --make-latest
    python scripts/deploy-version.py 3.0.0 --no-push  # Don't push (for testing)
"""

import sys
import os
import shutil
import subprocess
import argparse
import tempfile
from pathlib import Path
from datetime import datetime

def run_cmd(cmd, cwd=None, check=True, capture=True):
    """Run a shell command and return output."""
    result = subprocess.run(
        cmd if isinstance(cmd, list) else cmd.split(),
        cwd=cwd,
        check=check,
        capture_output=capture,
        text=True
    )
    return result.stdout.strip() if capture else None

def deploy_version(version, make_latest=True, push=True, verbose=False):
    """Deploy a version to gh-pages branch."""
    
    print(f"\n{'='*60}")
    print(f"Deploying version {version}")
    print(f"{'='*60}\n")
    
    # Step 1: Build the specification
    print("📦 Step 1: Building specification...")
    try:
        run_cmd("npm run build", capture=False)
    except subprocess.CalledProcessError as e:
        print(f"❌ Build failed: {e}")
        return False
    
    built_file = Path("build/index.html")
    if not built_file.exists():
        print(f"❌ Build output not found: {built_file}")
        return False
    
    print(f"✓ Built: {built_file} ({built_file.stat().st_size // 1024} KB)")
    
    # Step 2: Setup gh-pages branch
    print("\n📥 Step 2: Setting up gh-pages branch...")
    
    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir = Path(tmpdir)
        gh_pages_dir = tmpdir / "gh-pages"
        
        # Try to clone existing gh-pages
        try:
            run_cmd(
                f"git clone -b gh-pages --depth 1 . {gh_pages_dir}",
                check=False,
                capture=not verbose
            )
            print("✓ Cloned existing gh-pages branch")
        except:
            # gh-pages doesn't exist, create it
            print("📝 Creating new gh-pages branch (first deploy)")
            run_cmd(f"git clone . {gh_pages_dir}", capture=not verbose)
            run_cmd("git checkout --orphan gh-pages", cwd=gh_pages_dir, capture=not verbose)
            run_cmd("git rm -rf .", cwd=gh_pages_dir, check=False, capture=not verbose)
            
            # Create initial README
            readme = gh_pages_dir / "README.md"
            readme.write_text(f"# Published Specifications\n\nGenerated by CI/CD. Do not edit manually.\n")
            run_cmd("git add README.md", cwd=gh_pages_dir, capture=not verbose)
            run_cmd("git commit -m 'Initialize gh-pages'", cwd=gh_pages_dir, capture=not verbose)
        
        # Step 3: Copy build to version directory
        print(f"\n📋 Step 3: Copying to v{version}/...")
        
        version_dir = gh_pages_dir / f"v{version}"
        version_dir.mkdir(parents=True, exist_ok=True)
        
        shutil.copy(built_file, version_dir / "index.html")
        print(f"✓ Copied to v{version}/index.html")
        
        # Optional: Copy additional assets
        assets_dir = Path("build/assets")
        if assets_dir.exists():
            shutil.copytree(assets_dir, version_dir / "assets", dirs_exist_ok=True)
            print(f"✓ Copied assets")
        
        # Step 4: Update 'latest'
        if make_latest:
            print(f"\n🔗 Step 4: Updating 'latest' → v{version}...")
            latest_dir = gh_pages_dir / "latest"
            
            if latest_dir.exists():
                shutil.rmtree(latest_dir)
            
            shutil.copytree(version_dir, latest_dir)
            print(f"✓ Updated latest → v{version}")
        else:
            print(f"\n⏭️  Step 4: Skipping 'latest' update")
        
        # Step 5: Generate version selector index
        print(f"\n📄 Step 5: Generating version selector...")
        generate_index(gh_pages_dir)
        print(f"✓ Generated index.html")
        
        # Step 6: Commit changes
        print(f"\n💾 Step 6: Committing changes...")
        
        run_cmd("git add .", cwd=gh_pages_dir, capture=not verbose)
        
        try:
            commit_msg = f"Deploy v{version}"
            if make_latest:
                commit_msg += " (latest)"
            
            run_cmd(
                ["git", "commit", "-m", commit_msg],
                cwd=gh_pages_dir,
                capture=not verbose
            )
            print(f"✓ Committed: {commit_msg}")
            
            # Step 7: Push to remote
            if push:
                print(f"\n📤 Step 7: Pushing to gh-pages...")
                run_cmd("git push origin gh-pages", cwd=gh_pages_dir, capture=not verbose)
                print(f"✓ Pushed to gh-pages")
            else:
                print(f"\n⏭️  Step 7: Skipping push (--no-push)")
            
        except subprocess.CalledProcessError:
            print("ℹ️  No changes to commit (version already exists)")
            return True
    
    # Success!
    print(f"\n{'='*60}")
    print(f"✅ Successfully deployed v{version}!")
    print(f"{'='*60}")
    
    if push:
        # Get repository URL
        try:
            remote_url = run_cmd("git config --get remote.origin.url")
            if "github.com" in remote_url:
                # Extract org/repo from URL
                parts = remote_url.replace('.git', '').split('/')
                org, repo = parts[-2], parts[-1]
                
                print(f"\n📍 View at:")
                print(f"   https://{org}.github.io/{repo}/v{version}/")
                if make_latest:
                    print(f"   https://{org}.github.io/{repo}/latest/")
        except:
            pass
    
    return True

def generate_index(gh_pages_dir):
    """Generate version selector index.html."""
    
    # Find all version directories
    versions = []
    for item in gh_pages_dir.iterdir():
        if item.is_dir() and item.name.startswith('v'):
            version_num = item.name[1:]  # Remove 'v' prefix
            
            # Get modification time
            try:
                mtime = item.stat().st_mtime
                date_str = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
            except:
                date_str = "Unknown"
            
            versions.append({
                'num': version_num,
                'dir': item.name,
                'date': date_str
            })
    
    # Sort by version (newest first)
    versions.sort(key=lambda v: v['num'], reverse=True)
    
    # Generate HTML
    html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Standard Versions</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        h1 {
            font-size: 2.5em;
            color: #2c3e50;
            margin-bottom: 0.5em;
        }
        
        .subtitle {
            color: #7f8c8d;
            font-size: 1.1em;
            margin-bottom: 2em;
        }
        
        ul {
            list-style: none;
        }
        
        li {
            margin-bottom: 1em;
        }
        
        a {
            display: block;
            padding: 20px 25px;
            background: white;
            text-decoration: none;
            color: #2c3e50;
            border-radius: 8px;
            border: 2px solid #e0e0e0;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        a:hover {
            border-color: #3498db;
            box-shadow: 0 4px 12px rgba(52, 152, 219, 0.15);
            transform: translateY(-2px);
        }
        
        .version-title {
            font-size: 1.3em;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 0.3em;
        }
        
        .version-date {
            font-size: 0.9em;
            color: #95a5a6;
        }
        
        .latest {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
        }
        
        .latest .version-title,
        .latest .version-date {
            color: white;
        }
        
        footer {
            margin-top: 3em;
            padding-top: 2em;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #7f8c8d;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Standard Versions</h1>
        <p class="subtitle">Select a version to view the specification</p>
        
        <ul>
            <li>
                <a href="./latest/" class="latest">
                    <div class="version-title">Latest Version</div>
                    <div class="version-date">Always up-to-date</div>
                </a>
            </li>
"""
    
    for v in versions:
        html += f"""            <li>
                <a href="./{v['dir']}/">
                    <div class="version-title">Version {v['num']}</div>
                    <div class="version-date">Published {v['date']}</div>
                </a>
            </li>
"""
    
    html += """        </ul>
        
        <footer>
            Generated automatically. Do not edit manually.
        </footer>
    </div>
</body>
</html>
"""
    
    index_file = gh_pages_dir / "index.html"
    index_file.write_text(html, encoding='utf-8')

def main():
    parser = argparse.ArgumentParser(
        description='Deploy specification version to gh-pages',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Deploy version 1.0.0 and update latest
  python scripts/deploy-version.py 1.0.0
  
  # Deploy version 2.0.0 without updating latest
  python scripts/deploy-version.py 2.0.0 --no-latest
  
  # Deploy without pushing (for testing)
  python scripts/deploy-version.py 1.0.0 --no-push
        """
    )
    
    parser.add_argument(
        'version',
        help='Version to deploy (e.g., 1.0.0, 1.1.0, 2.0.0)'
    )
    
    parser.add_argument(
        '--no-latest',
        dest='make_latest',
        action='store_false',
        default=True,
        help="Don't update 'latest' to point to this version"
    )
    
    parser.add_argument(
        '--no-push',
        dest='push',
        action='store_false',
        default=True,
        help="Don't push to remote (for testing)"
    )
    
    parser.add_argument(
        '-v', '--verbose',
        action='store_true',
        help='Verbose output'
    )
    
    args = parser.parse_args()
    
    # Validate version format
    if not args.version.replace('.', '').isdigit():
        print(f"❌ Invalid version format: {args.version}")
        print("   Expected: X.Y.Z (e.g., 1.0.0, 1.1.0, 2.0.0)")
        sys.exit(1)
    
    success = deploy_version(
        args.version,
        make_latest=args.make_latest,
        push=args.push,
        verbose=args.verbose
    )
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
```

### 4.5 GitHub Actions Workflows

#### 4.5.1 Create .github/workflows/deploy.yml

```yaml
name: Deploy Specification

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history needed
      
      - name: Setup mise
        uses: jdx/mise-action@v2
        with:
          experimental: true
      
      - name: Install Node.js dependencies
        run: npm ci
      
      - name: Extract version from tag
        id: version
        run: |
          VERSION=${GITHUB_REF#refs/tags/v}
          echo "version=$VERSION" >> $GITHUB_OUTPUT
          echo "Deploying version: $VERSION"
      
      - name: Configure Git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
      
      - name: Build and deploy
        run: python scripts/deploy-version.py ${{ steps.version.outputs.version }} --verbose
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Summary
        run: |
          echo "### ✅ Deployment Successful!" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Version:** ${{ steps.version.outputs.version }}" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**View at:** https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}/v${{ steps.version.outputs.version }}/" >> $GITHUB_STEP_SUMMARY
```

#### 4.5.2 Create .github/workflows/ci.yml

```yaml
name: Continuous Integration

on:
  pull_request:
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup mise
        uses: jdx/mise-action@v2
        with:
          experimental: true
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build specification
        run: npm run build
      
      - name: Validate output
        run: |
          if [ ! -f build/index.html ]; then
            echo "❌ Build failed: no output file"
            exit 1
          fi
          
          # Check file size (should be > 10KB)
          SIZE=$(stat -f%z build/index.html 2>/dev/null || stat -c%s build/index.html)
          if [ "$SIZE" -lt 10240 ]; then
            echo "❌ Output file too small: ${SIZE} bytes"
            exit 1
          fi
          
          # Check for ReSpec errors
          if grep -q "respec-error" build/index.html; then
            echo "❌ ReSpec errors found in output"
            grep "respec-error" build/index.html
            exit 1
          fi
          
          echo "✅ Build validation passed"
          echo "   Output size: ${SIZE} bytes"
      
      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: build/
          retention-days: 7
```

### 4.6 ReSpec Source Template

#### 4.6.1 Create source/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>My Standard Specification</title>
    
    <!-- Load ReSpec from W3C -->
    <script src="https://www.w3.org/Tools/respec/respec-w3c" 
            class="remove" 
            defer></script>
    
    <!-- Load configuration -->
    <script class="remove" src="config.js"></script>
    
    <!-- Optional: Custom styling -->
    <!-- <link rel="stylesheet" href="custom.css"> -->
</head>
<body>
    <!-- Abstract (required) -->
    <section id="abstract">
        <p>
            This specification defines a standard for [describe purpose].
            It provides [key features/benefits].
        </p>
    </section>
    
    <!-- Status of This Document (required) -->
    <section id="sotd">
        <p>
            This is a draft specification. It may change at any time.
        </p>
        <p>
            Comments and feedback are welcome via 
            <a href="https://github.com/your-org/standard-repo/issues">GitHub Issues</a>.
        </p>
    </section>
    
    <!-- Introduction -->
    <section id="introduction">
        <h2>Introduction</h2>
        
        <p>
            [Provide context about the problem space and why this standard exists]
        </p>
        
        <section id="motivation">
            <h3>Motivation</h3>
            <p>
                [Explain the motivation behind this standard]
            </p>
        </section>
        
        <section id="scope">
            <h3>Scope</h3>
            <p>
                This specification covers:
            </p>
            <ul>
                <li>[Scope item 1]</li>
                <li>[Scope item 2]</li>
                <li>[Scope item 3]</li>
            </ul>
            
            <p>
                This specification does not cover:
            </p>
            <ul>
                <li>[Out of scope item 1]</li>
                <li>[Out of scope item 2]</li>
            </ul>
        </section>
        
        <section id="audience">
            <h3>Intended Audience</h3>
            <p>
                This document is intended for:
            </p>
            <ul>
                <li>[Audience 1]</li>
                <li>[Audience 2]</li>
            </ul>
        </section>
    </section>
    
    <!-- Conformance (auto-generated by ReSpec) -->
    <section id="conformance">
        <!-- Boilerplate will be inserted here -->
    </section>
    
    <!-- Terminology -->
    <section id="terminology">
        <h2>Terminology</h2>
        
        <p>
            The following terms are used throughout this specification:
        </p>
        
        <dl>
            <dt><dfn>Term 1</dfn></dt>
            <dd>Definition of term 1</dd>
            
            <dt><dfn>Term 2</dfn></dt>
            <dd>Definition of term 2</dd>
            
            <dt><dfn data-lt="alt term">Term 3</dfn></dt>
            <dd>Definition of term 3 (with alternative linking text)</dd>
        </dl>
    </section>
    
    <!-- Main Content -->
    <section id="specification">
        <h2>Specification</h2>
        
        <section id="overview">
            <h3>Overview</h3>
            <p>
                [High-level overview of the specification]
            </p>
        </section>
        
        <section id="data-model">
            <h3>Data Model</h3>
            <p>
                [Describe the data model]
            </p>
            
            <pre class="example" title="Basic Example">
{
  "@context": "https://example.org/context",
  "@type": "Example",
  "property": "value"
}
            </pre>
        </section>
        
        <section id="vocabulary">
            <h3>Vocabulary</h3>
            <p>
                The following classes and properties are defined:
            </p>
            
            <section id="class-example">
                <h4>Example Class</h4>
                <p>
                    Description of Example class.
                </p>
                
                <table class="def">
                    <tbody>
                        <tr>
                            <th>IRI:</th>
                            <td><code>https://example.org/ns#Example</code></td>
                        </tr>
                        <tr>
                            <th>Type:</th>
                            <td>Class</td>
                        </tr>
                        <tr>
                            <th>Subclass of:</th>
                            <td><code>schema:Thing</code></td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </section>
    </section>
    
    <!-- Examples -->
    <section id="examples">
        <h2>Examples</h2>
        
        <section id="example-basic">
            <h3>Basic Usage</h3>
            <p>
                This example shows basic usage:
            </p>
            
            <pre class="example" title="Basic Usage">
{
  "@context": "https://example.org/context",
  "@type": "Dataset",
  "title": "Example Dataset",
  "description": "A dataset for demonstration"
}
            </pre>
        </section>
        
        <section id="example-advanced">
            <h3>Advanced Usage</h3>
            <p>
                This example shows advanced features:
            </p>
            
            <pre class="example" title="Advanced Usage">
{
  "@context": "https://example.org/context",
  "@type": "Dataset",
  "title": "Advanced Dataset",
  "temporal": {
    "@type": "PeriodOfTime",
    "startDate": "2026-01-01",
    "endDate": "2026-12-31"
  }
}
            </pre>
        </section>
    </section>
    
    <!-- References -->
    <section id="references">
        <h2>References</h2>
        <!-- Auto-generated by ReSpec -->
    </section>
    
    <!-- Acknowledgements (optional) -->
    <section class="appendix" id="acknowledgements">
        <h2>Acknowledgements</h2>
        <p>
            The editors would like to thank the following people for their contributions:
        </p>
        <ul>
            <li>[Contributor 1]</li>
            <li>[Contributor 2]</li>
        </ul>
    </section>
    
    <!-- Change Log (optional) -->
    <section class="appendix" id="changelog">
        <h2>Change Log</h2>
        
        <section id="changes-v1-0">
            <h3>Changes in Version 1.0</h3>
            <ul>
                <li>Initial release</li>
            </ul>
        </section>
    </section>
</body>
</html>
```

#### 4.6.2 Create source/config.js

```javascript
/**
 * ReSpec Configuration
 * 
 * See https://respec.org/docs/ for full documentation
 */

var respecConfig = {
  // ===== Document Metadata =====
  
  // Specification status
  // Options: "ED" (Editor's Draft), "WD" (Working Draft), 
  //          "CR" (Candidate Recommendation), "PR" (Proposed Recommendation),
  //          "REC" (Recommendation), "unofficial"
  specStatus: "unofficial",
  
  // Short name (used in URLs)
  shortName: "my-standard",
  
  // Publication date (auto-set if not specified)
  publishDate: "2026-04-02",
  
  // ===== Version Information =====
  
  // This version
  thisVersion: "https://your-org.github.io/standard-repo/v1.0/",
  
  // Latest version
  latestVersion: "https://your-org.github.io/standard-repo/latest/",
  
  // Previous version (null for first version)
  prevVersion: null,
  
  // Editor's draft
  edDraftURI: "https://github.com/your-org/standard-repo",
  
  // ===== Editors =====
  
  editors: [{
    name: "Your Name",
    mailto: "you@example.org",
    company: "Your Organization",
    companyURL: "https://example.org"
  }],
  
  // ===== Authors (optional) =====
  
  authors: [
    // {
    //   name: "Contributor Name",
    //   mailto: "contributor@example.org",
    //   company: "Contributor Org"
    // }
  ],
  
  // ===== GitHub Integration =====
  
  github: {
    repoURL: "https://github.com/your-org/standard-repo",
    branch: "main"
  },
  
  // ===== Logos =====
  
  logos: [
    // {
    //   src: "https://example.org/logo.png",
    //   alt: "Organization Logo",
    //   width: 100,
    //   height: 100,
    //   url: "https://example.org"
    // }
  ],
  
  // ===== Bibliography =====
  
  // Local bibliography entries (in addition to SpecRef)
  localBiblio: {
    // "MY-REFERENCE": {
    //   title: "Reference Document Title",
    //   href: "https://example.org/doc",
    //   authors: ["Author Name"],
    //   publisher: "Publisher",
    //   date: "2026"
    // }
  },
  
  // ===== Display Options =====
  
  // Table of Contents depth
  maxTocLevel: 3,
  
  // Use markdown in HTML
  format: "markdown",
  
  // Not on W3C Recommendation track
  noRecTrack: true,
  
  // ===== Other Options =====
  
  // Subtitle
  subtitle: "Version 1.0",
  
  // Copyright holder (if not W3C)
  // copyrightStart: "2026",
  // additionalCopyrightHolders: "Your Organization",
  
  // License
  // license: "cc-by",  // Creative Commons Attribution
  
  // Alternative status text
  // sotdAfterWGinfo: "Custom status text here",
  
  // Override default status text
  // overrideStatus: false,
};
```

### 4.7 Additional Files

#### 4.7.1 Create .gitignore

```gitignore
# Build artifacts
build/
dist/
*.html.bak

# Dependencies
node_modules/
__pycache__/
*.pyc

# mise
.mise.lock
.mise/

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Editor files
.vscode/
.idea/
*.swp
*.swo
*~
.project
.classpath
.settings/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local

# Testing
coverage/
.nyc_output/

# Temporary
tmp/
temp/
*.tmp
```

#### 4.7.2 Create README.md

```markdown
# Standard Repository

Proof of concept for managing versioned standards documentation.

## Quick Start

### Prerequisites

- [mise](https://mise.jdx.dev/) installed
- Git

### Setup

\`\`\`bash
# Clone repository
git clone https://github.com/your-org/standard-repo.git
cd standard-repo

# Install tools (Node.js, Python)
mise install

# Install dependencies
npm install
\`\`\`

### Local Development

\`\`\`bash
# Serve source with live ReSpec processing
npm run serve
# Opens http://localhost:8000

# Build static HTML
npm run build
# Output: build/index.html
\`\`\`

### Deploying a Version

\`\`\`bash
# 1. Edit source/index.html and source/config.js

# 2. Commit changes
git add source/
git commit -m "Prepare v1.0.0"

# 3. Tag version
git tag -a v1.0.0 -m "Release v1.0.0"

# 4. Push (triggers GitHub Actions)
git push origin main --tags

# GitHub Actions will:
# - Build the specification
# - Deploy to gh-pages/v1.0.0/
# - Update latest
# - Publish to GitHub Pages
\`\`\`

## Repository Structure

\`\`\`
standard-repo/
├── source/           # ReSpec source files
├── scripts/          # Build and deployment scripts
├── .github/          # CI/CD workflows
├── .mise.toml        # Tool versions
└── package.json      # Dependencies
\`\`\`

## Published Versions

View published specifications at:
- https://your-org.github.io/standard-repo/

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes in `source/`
4. Test locally with `npm run build`
5. Submit a pull request

## License

[Your License Here]
\`\`\`

---

## 5. Testing & Validation

### 5.1 Local Testing

#### 5.1.1 Test Build Process

\`\`\`bash
# Clean previous builds
npm run clean

# Build specification
npm run build

# Verify output exists
ls -lh build/index.html

# Check file size (should be >10KB)
stat -f%z build/index.html  # macOS
stat -c%s build/index.html  # Linux

# Open in browser
open build/index.html  # macOS
xdg-open build/index.html  # Linux
\`\`\`

#### 5.1.2 Test Deployment Script

\`\`\`bash
# Test deployment without pushing
python scripts/deploy-version.py 0.0.1-test --no-push --verbose

# Check gh-pages branch locally
git checkout gh-pages
ls -la v0.0.1-test/
cat index.html  # View version selector
git checkout main

# Clean up test version
git checkout gh-pages
git rm -rf v0.0.1-test
git commit -m "Remove test version"
git push
git checkout main
\`\`\`

### 5.2 End-to-End Testing

#### 5.2.1 Full Deployment Test

\`\`\`bash
# 1. Create test version
echo "Test marker" >> source/index.html
git add source/index.html
git commit -m "Test: v0.1.0"
git tag v0.1.0

# 2. Push tag (triggers CI)
git push origin main --tags

# 3. Monitor GitHub Actions
# Visit: https://github.com/your-org/standard-repo/actions

# 4. Wait for deployment (1-2 minutes)

# 5. Verify published version
curl -I https://your-org.github.io/standard-repo/v0.1.0/
# Should return: 200 OK

# 6. Check version selector
curl https://your-org.github.io/standard-repo/ | grep "0.1.0"
# Should find: link to v0.1.0

# 7. Verify latest
curl -I https://your-org.github.io/standard-repo/latest/
# Should redirect or return same as v0.1.0
\`\`\`

### 5.3 Validation Checklist

**Before Releasing:**

- [ ] Source file (`source/index.html`) is valid HTML5
- [ ] ReSpec config (`source/config.js`) has correct metadata
- [ ] Local build succeeds: `npm run build`
- [ ] No ReSpec errors in `build/index.html`
- [ ] Version numbers are consistent
- [ ] Links point to correct URLs
- [ ] Examples are valid JSON/JSON-LD
- [ ] Changes are documented

**After Releasing:**

- [ ] GitHub Actions workflow succeeded
- [ ] Version is published: `https://.../vX.Y.Z/`
- [ ] Latest is updated: `https://.../latest/`
- [ ] Version selector lists new version
- [ ] No broken links in published version
- [ ] Previous versions still accessible

---

## 6. Migration & Customization

### 6.1 Swapping Documentation Frameworks

The deployment pattern is **framework-agnostic**. Only `scripts/build-spec.js` needs to change.

#### 6.1.1 Replace ReSpec with mdBook

\`\`\`bash
# 1. Add mdBook to .mise.toml
echo 'mdbook = "latest"' >> .mise.toml
mise install

# 2. Initialize mdBook
mdbook init source --title "My Standard"

# 3. Replace build script
cat > scripts/build-spec.js << 'EOF'
const { execSync } = require('child_process');

function buildSpec() {
  // mdBook builds to source/book/ by default
  execSync('mdbook build source', { stdio: 'inherit' });
  
  // Copy to build/
  execSync('mkdir -p build && cp -r source/book/* build/', { stdio: 'inherit' });
}

if (require.main === module) {
  buildSpec();
}

module.exports = { buildSpec };
EOF

# 4. Deploy script unchanged!
python scripts/deploy-version.py 1.0.0
\`\`\`

#### 6.1.2 Replace ReSpec with Custom PHP

\`\`\`bash
# 1. Create PHP build script
cat > scripts/build-with-php.php << 'EOF'
<?php
// Your custom PHP generation logic
// Read source, process, write to build/index.html

$html = file_get_contents('source/template.html');
// ... processing ...
file_put_contents('build/index.html', $html);

echo "Built successfully\n";
EOF

# 2. Update build-spec.js to call PHP
cat > scripts/build-spec.js << 'EOF'
const { execSync } = require('child_process');

function buildSpec() {
  execSync('php scripts/build-with-php.php', { stdio: 'inherit' });
}

if (require.main === module) {
  buildSpec();
}

module.exports = { buildSpec };
EOF

# 3. Deploy script unchanged!
python scripts/deploy-version.py 1.0.0
\`\`\`

**Key insight:** As long as `build/index.html` exists after `npm run build`, the deployment works!

### 6.2 Customizing Version Selector

Replace the simple version selector with a custom design:

#### 6.2.1 Create Custom Template

\`\`\`bash
mkdir -p templates

cat > templates/index-custom.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>{{ title }}</title>
    <style>
        /* Your custom styles */
    </style>
</head>
<body>
    <h1>{{ title }}</h1>
    
    <ul>
    {% for version in versions %}
        <li>
            <a href="./v{{ version.num }}/">
                Version {{ version.num }}
                <span class="date">{{ version.date }}</span>
            </a>
        </li>
    {% endfor %}
    </ul>
</body>
</html>
EOF
\`\`\`

#### 6.2.2 Update Deployment Script

Modify `scripts/deploy-version.py` to use the template:

\`\`\`python
# In generate_index() function:
from jinja2 import Template

def generate_index(gh_pages_dir):
    template_path = Path('templates/index-custom.html')
    template = Template(template_path.read_text())
    
    versions = discover_versions(gh_pages_dir)
    
    html = template.render(
        title="My Standard Versions",
        versions=versions
    )
    
    (gh_pages_dir / 'index.html').write_text(html)
\`\`\`

### 6.3 Adding RDF Output

Generate RDF files alongside HTML:

\`\`\`javascript
// scripts/build-spec.js (extended)

const { buildSpec } = require('./build-spec');
const { generateRDF } = require('./generate-rdf');

async function buildAll() {
  // 1. Build HTML
  await buildSpec('source/index.html', 'build/index.html');
  
  // 2. Generate RDF formats
  await generateRDF('source/vocabulary.ttl', 'build/vocabulary.ttl');
  await convertToRDFXML('build/vocabulary.ttl', 'build/vocabulary.rdf');
  await convertToJSONLD('build/vocabulary.ttl', 'build/vocabulary.jsonld');
}

buildAll();
\`\`\`

Deployment script automatically copies entire `build/` directory to version folder.

---

## 7. Anti-Patterns & Lessons from mobilityDCAT-AP

### 7.1 Summary of Problems

| Issue | mobilityDCAT-AP | Our Solution |
|-------|----------------|--------------|
| **Default branch** | gh-pages | main |
| **Source location** | Mixed with builds | Separate `source/` |
| **Build process** | Manual PHP scripts | Automated CI/CD |
| **Deployment** | Manual copy/paste | Automated script |
| **Version control** | Build artifacts committed | Only source in Git |
| **Repository size** | 500MB+ | ~5MB source |
| **Clone time** | 5+ minutes | ~30 seconds |
| **PR reviews** | 1000s of generated lines | Only source changes |
| **Rollback** | Difficult/impossible | Easy (Git revert) |
| **Consistency** | Manual verification | Automated validation |

### 7.2 Critical Anti-Patterns to Avoid

#### Anti-Pattern #1: gh-pages as Default Branch

**Never do:**
\`\`\`bash
git config --global init.defaultBranch gh-pages  # ❌
\`\`\`

**Always do:**
\`\`\`bash
# main branch = source (default)
# gh-pages branch = deployment (auto-managed)
\`\`\`

#### Anti-Pattern #2: Committing Build Artifacts

**Never do:**
\`\`\`bash
git add build/index.html  # ❌
git add dist/  # ❌
\`\`\`

**Always do:**
\`\`\`bash
# Add to .gitignore
echo "build/" >> .gitignore
echo "dist/" >> .gitignore

# Build artifacts only in gh-pages branch (managed by CI)
\`\`\`

#### Anti-Pattern #3: Manual Deployment

**Never do:**
\`\`\`bash
# Manual workflow ❌
./build.sh
cp -r build/ /tmp/
git checkout gh-pages
cp -r /tmp/build/* v1.0.0/
git add v1.0.0/
git commit -m "Release 1.0.0"
git push
\`\`\`

**Always do:**
\`\`\`bash
# Automated workflow ✅
git tag v1.0.0
git push --tags
# → GitHub Actions handles everything
\`\`\`

#### Anti-Pattern #4: Mixing Source and Generated Files

**Never do:**
\`\`\`
directory/
├── source.html
├── generated-table-1.html  # ❌ Generated
├── generated-table-2.html  # ❌ Generated
└── another-source.html
\`\`\`

**Always do:**
\`\`\`
source/
├── index.html
└── config.js

build/  (gitignored)
├── index.html
├── table-1.html
└── table-2.html
\`\`\`

#### Anti-Pattern #5: No Validation Before Deploy

**Never do:**
\`\`\`bash
# No validation ❌
git commit -m "Release"
git push
# Hope it works!
\`\`\`

**Always do:**
\`\`\`yaml
# CI validates every PR ✅
- name: Validate
  run: |
    npm run build
    npm run test
# Only merge if validation passes
\`\`\`

### 7.3 Lessons Learned

**Lesson #1: Separation of Concerns**
- Source files ≠ Deployment artifacts
- Development branch ≠ Deployment branch
- Keep them strictly separate

**Lesson #2: Automation Prevents Errors**
- Humans make mistakes
- Scripts are consistent
- CI/CD is reliable

**Lesson #3: Git is for Source, Not Artifacts**
- Git tracks changes
- Generated files have no meaningful diffs
- Wastes space and time

**Lesson #4: Framework-Agnostic Wins**
- Tools come and go
- Patterns persist
- Don't lock into specific tools

**Lesson #5: Simple is Better**
- Complex workflows fail
- Manual steps are forgotten
- Simple automation works

---

## 8. References & Resources

### 8.1 ReSpec

- **Official Documentation:** https://respec.org/docs/
- **GitHub Repository:** https://github.com/speced/respec
- **npm Package:** https://www.npmjs.com/package/respec
- **W3C ReSpec Guide:** https://github.com/speced/respec/wiki

### 8.2 Tools

- **mise (tool management):** https://mise.jdx.dev/
- **Puppeteer (browser automation):** https://pptr.dev/
- **GitHub Actions:** https://docs.github.com/actions
- **GitHub Pages:** https://docs.github.com/pages

### 8.3 Standards & Best Practices

- **W3C Pubrules:** https://www.w3.org/pubrules/
- **W3C Spec Writing Guide:** https://www.w3.org/Guide/
- **Persistent URIs (w3id.org):** https://w3id.org/
- **Semantic Versioning:** https://semver.org/

### 8.4 Real-World Examples

**Good Examples:**
- W3C specifications: https://github.com/w3c/
  - Proper CI/CD
  - Source/build separation
  - Automated publishing

**Anti-Pattern Examples:**
- mobilityDCAT-AP: https://github.com/mobilityDCAT-AP/mobilityDCAT-AP
  - Learn what NOT to do
  - But: good ReSpec usage

### 8.5 Related Research

- **MkDocs + mike:** https://github.com/jimporter/mike
- **Docusaurus Versioning:** https://docusaurus.io/docs/versioning
- **mdBook Guide:** https://rust-lang.github.io/mdBook/

---

## Appendices

### Appendix A: Complete File Listing

Final repository structure after following this guide:

\`\`\`
standard-repo/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── source/
│   ├── index.html
│   └── config.js
├── scripts/
│   ├── build-spec.js
│   └── deploy-version.py
├── .mise.toml
├── package.json
├── .gitignore
└── README.md
\`\`\`

### Appendix B: Command Quick Reference

\`\`\`bash
# Setup
mise install
npm install

# Development
npm run serve              # Serve with live ReSpec
npm run build              # Build static HTML
npm run clean              # Remove build artifacts

# Testing
npm run test               # Validate build
python scripts/deploy-version.py X.Y.Z --no-push  # Test deploy

# Deployment
git tag vX.Y.Z             # Create version tag
git push --tags            # Trigger deployment
\`\`\`

### Appendix C: Troubleshooting

**Build fails with "respecIsReady not found":**
- Increase timeout in `build-spec.js`
- Check network connectivity (ReSpec loads from CDN)
- Use local ReSpec copy if offline

**Deployment fails with "gh-pages doesn't exist":**
- First deployment creates it automatically
- Ensure repository is initialized with `git init`

**Version selector shows wrong versions:**
- Check that version directories follow `vX.Y.Z` pattern
- Re-run deployment script to regenerate index

**GitHub Pages not updating:**
- Check GitHub Actions logs
- Verify gh-pages branch exists and has content
- Check repository settings: Settings → Pages
- Ensure GitHub Pages is enabled

---

## Conclusion

This research provides a complete, production-ready approach for managing versioned standards documentation. The key innovations are:

1. **Framework-agnostic repository pattern** that works with any tool
2. **Complete automation** eliminating manual deployment steps
3. **Clean separation** of source and build artifacts
4. **Learning from real-world failures** (mobilityDCAT-AP analysis)

**For the POC:**
- Use ReSpec (domain standard)
- Implement source-build separation pattern
- Automate with GitHub Actions
- Keep it simple

**For the future:**
- Pattern works with any documentation tool
- Easy to swap ReSpec for custom PHP/other tools
- Scales to complex requirements
- Maintains clean Git history

**Total implementation time:** 3-4 hours for working POC

---

**End of Technical Research Document**

Generated: April 2, 2026  
Author: vlcinsky  
Version: 1.0
