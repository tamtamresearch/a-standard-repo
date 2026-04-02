# a-standard-repo

**Proof of Concept:** Versioned Standards Documentation System

This repository demonstrates how to manage versioned standards documentation with clean separation of source and build artifacts, automated deployment, and GitHub Pages hosting.

## 🎯 Overview

This POC implements a framework-agnostic repository pattern for standards documentation that:

- ✅ Separates source files (main branch) from build artifacts (gh-pages branch)
- ✅ Automates deployment via GitHub Actions (zero manual steps)
- ✅ Publishes multiple versions simultaneously (v1.0, v2.0, v3.0, latest)
- ✅ Uses ReSpec for W3C-style specifications (easily swappable)
- ✅ Keeps repository small (~5MB source vs. 500MB+ with artifacts)

## 🚀 Quick Start

### Prerequisites

- [mise](https://mise.jdx.dev/) installed (for tool version management)
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/tamtamresearch/a-standard-repo.git
cd a-standard-repo

# Install tools (Node.js, Python)
mise install

# Install Node.js dependencies
npm install
```

### Local Development

```bash
# Serve source with live ReSpec processing
npm run serve
# Opens http://localhost:8000 in your browser

# Build static HTML
npm run build
# Output: build/index.html

# Clean build artifacts
npm run clean
```

## 📦 Deploying a Version

Deployment is **fully automated** via GitHub Actions:

```bash
# 1. Edit source files
vim source/index.html
vim source/config.js

# 2. Commit changes
git add source/
git commit -m "docs: update specification"
git push

# 3. Tag a version
git tag -a v1.0.0 -m "Release v1.0.0: Initial standard"

# 4. Push the tag (this triggers deployment)
git push origin --tags

# GitHub Actions will:
# - Build the specification
# - Deploy to gh-pages/v1.0.0/
# - Update latest → v1.0.0
# - Generate version selector
# - Publish to GitHub Pages
```

**That's it!** No manual steps required.

## 📁 Repository Structure

```
a-standard-repo/
├── source/              # ReSpec source files
│   ├── index.html       # Main specification document
│   └── config.js        # ReSpec configuration
│
├── scripts/
│   ├── build-spec.js    # Puppeteer-based ReSpec builder
│   └── deploy-version.py # Version deployment automation
│
├── .github/workflows/
│   ├── ci.yml           # PR validation
│   └── deploy.yml       # Tag-based deployment
│
├── .mise.toml           # Tool versions (Node.js, Python)
├── package.json         # Node.js dependencies
├── .gitignore           # Ignores build/ directory
└── README.md            # This file
```

**Note:** The `build/` directory is gitignored. Build artifacts only exist in the `gh-pages` branch.

## 🌐 Published Versions

View published specifications at:

- **Latest:** https://tamtamresearch.github.io/a-standard-repo/latest/
- **Version Selector:** https://tamtamresearch.github.io/a-standard-repo/
- **Specific versions:** https://tamtamresearch.github.io/a-standard-repo/v1.0/

## 🔧 How It Works

### Branch Strategy

**main branch (source):**
- Contains only source files and scripts
- Where development happens
- PRs reviewed against source changes only

**gh-pages branch (deployment):**
- Contains only generated HTML
- Managed exclusively by GitHub Actions
- Never manually edited

### Version Management

Versions follow [Semantic Versioning](https://semver.org/):

- **MAJOR:** Breaking changes (e.g., `v2.0.0`)
- **MINOR:** New features, backwards compatible (e.g., `v1.1.0`)
- **PATCH:** Bug fixes (e.g., `v1.0.1`)

### Build Process

1. ReSpec source loaded in headless browser (Puppeteer)
2. ReSpec JavaScript processes the document
3. Processed HTML extracted
4. Static HTML saved to `build/index.html`

### Deployment Process

1. Git tag triggers GitHub Actions
2. Build script generates static HTML
3. Deployment script:
   - Clones gh-pages branch
   - Copies HTML to `vX.Y.Z/` directory
   - Updates `latest/` symlink
   - Generates version selector page
   - Commits and pushes to gh-pages
4. GitHub Pages publishes automatically

## 🧪 Testing Locally

```bash
# Build the spec
npm run build

# Check output exists
ls -lh build/index.html

# View in browser
open build/index.html  # macOS
xdg-open build/index.html  # Linux

# Test deployment (without pushing)
python scripts/deploy-version.py 0.0.1-test --no-push

# Check the result
git checkout gh-pages
ls -la v0.0.1-test/
git checkout main

# Clean up
git checkout gh-pages
git rm -rf v0.0.1-test
git commit -m "Remove test version"
git push
git checkout main
```

## 📝 Contributing

### Making Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-change`
3. Edit source files in `source/`
4. Test locally: `npm run build`
5. Commit: `git commit -m "docs: describe change"`
6. Push and create a Pull Request

### Release Process

1. Update `source/config.js` with new version metadata
2. Update changelog in `source/index.html`
3. Commit changes
4. Create and push tag: `git tag v1.1.0 && git push --tags`
5. GitHub Actions deploys automatically

## 🔑 Key Principles

### ✅ Do's

- ✅ Keep source files in `main` branch
- ✅ Use Git tags for versioning
- ✅ Let GitHub Actions handle deployment
- ✅ Test builds locally before tagging
- ✅ Update version metadata in `config.js`

### ❌ Don'ts

- ❌ Never commit `build/` directory to main
- ❌ Never manually edit gh-pages branch
- ❌ Never modify published versions (create new version instead)
- ❌ Never skip CI validation
- ❌ Never deploy manually in production

## 🛠️ Customization

### Swapping Documentation Framework

This pattern works with **any** documentation tool:

**To replace ReSpec with mdBook:**

```bash
# 1. Add mdBook to .mise.toml
echo 'mdbook = "latest"' >> .mise.toml

# 2. Update scripts/build-spec.js to run mdBook
# 3. deploy-version.py needs NO CHANGES!
```

**To use custom PHP (like mobilityDCAT-AP):**

```bash
# 1. Add PHP scripts
# 2. Update scripts/build-spec.js to run PHP
# 3. deploy-version.py needs NO CHANGES!
```

The key: as long as `build/index.html` exists, deployment works!

## 📚 Documentation

For detailed technical information, see:

- **Technical Research:** `_bmad-output/planning-artifacts/research/technical-versioned-standards-docs-2026-04-02.md`
- **Project Context:** `_bmad-output/project-context.md`

## 🎓 Learning from mobilityDCAT-AP

This POC was inspired by analyzing the [mobilityDCAT-AP repository](https://github.com/mobilityDCAT-AP/mobilityDCAT-AP) and documenting anti-patterns to avoid:

**Their Problems:**
- ❌ Uses gh-pages as default branch (should be main)
- ❌ Mixes source and generated files
- ❌ No CI/CD automation
- ❌ Manual deployment process
- ❌ 500MB+ repository size

**Our Solution:**
- ✅ main = source, gh-pages = deployment
- ✅ Strict separation via `.gitignore`
- ✅ Full GitHub Actions automation
- ✅ Zero manual deployment
- ✅ ~5MB repository size

## 📖 References

- [ReSpec Documentation](https://respec.org/docs/)
- [mise Tool Manager](https://mise.jdx.dev/)
- [GitHub Pages](https://docs.github.com/pages)
- [Semantic Versioning](https://semver.org/)

## 📄 License

MIT License - see LICENSE file

## 🙏 Acknowledgements

- [ReSpec](https://github.com/speced/respec) for excellent specification authoring tools
- W3C for standards documentation best practices
- Inspired by the need for better standards documentation management

---

**Status:** Proof of Concept  
**Created:** April 2, 2026  
**Repository:** https://github.com/tamtamresearch/a-standard-repo
