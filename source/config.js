/**
 * ReSpec Configuration for Example Standard
 * 
 * See https://respec.org/docs/ for full documentation
 */

var respecConfig = {
  // ===== Document Metadata =====
  
  // Specification status
  specStatus: "unofficial",  // Not on W3C track
  
  // Short name (used in URLs)
  shortName: "example-standard",
  
  // Publication date (auto-set if not specified)
  publishDate: "2026-04-02",
  
  // ===== Version Information =====
  
  // This version (will be updated per version)
  thisVersion: "https://tamtamresearch.github.io/a-standard-repo/v1.0/",
  
  // Latest version
  latestVersion: "https://tamtamresearch.github.io/a-standard-repo/latest/",
  
  // Previous version (null for first version)
  prevVersion: null,
  
  // Editor's draft
  edDraftURI: "https://github.com/tamtamresearch/a-standard-repo",
  
  // ===== Editors =====
  
  editors: [{
    name: "Example Editor",
    mailto: "[email protected]",
    company: "Example Organization",
    companyURL: "https://example.org"
  }],
  
  // ===== GitHub Integration =====
  
  github: {
    repoURL: "https://github.com/tamtamresearch/a-standard-repo",
    branch: "main"
  },
  
  // ===== Logos (optional) =====
  
  // logos: [{
  //   src: "https://example.org/logo.png",
  //   alt: "Organization Logo",
  //   width: 100,
  //   height: 100,
  //   url: "https://example.org"
  // }],
  
  // ===== Bibliography =====
  
  // Local bibliography entries (in addition to SpecRef)
  localBiblio: {
    "DCAT": {
      title: "Data Catalog Vocabulary (DCAT) - Version 3",
      href: "https://www.w3.org/TR/vocab-dcat-3/",
      authors: ["Riccardo Albertoni", "David Browning", "Simon Cox", "Alejandra Gonzalez Beltran", "Andrea Perego", "Peter Winstanley"],
      publisher: "W3C",
      date: "2024"
    }
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
  subtitle: "Version 1.0 - Proof of Concept",
  
  // Copyright
  copyrightStart: "2026",
  
  // License
  license: "cc-by",  // Creative Commons Attribution
};
