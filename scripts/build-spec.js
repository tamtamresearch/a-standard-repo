#!/usr/bin/env node
/**
 * Build ReSpec specification to static HTML
 * 
 * This script uses Puppeteer to load the ReSpec source document,
 * wait for ReSpec to finish processing, and extract the final HTML.
 * 
 * Usage:
 *   node scripts/build-spec.js [input] [output]
 *   node scripts/build-spec.js source/index.html build/index.html
 *   node scripts/build-spec.js --verbose
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
    timeout = 120000,  // Increased to 120s for network delays
    verbose = true     // Enable verbose by default for debugging
  } = options;

  if (verbose) {
    console.log(`\n${'='.repeat(60)}`);
    console.log('Building ReSpec Specification');
    console.log(`${'='.repeat(60)}\n`);
    console.log(`Input:  ${inputFile}`);
    console.log(`Output: ${outputFile}`);
    console.log(`Timeout: ${timeout}ms\n`);
  }

  // Validate input file exists
  if (!fs.existsSync(inputFile)) {
    throw new Error(`Input file not found: ${inputFile}`);
  }

  console.log('🚀 Launching headless browser...');

  // Launch headless browser
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
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
    if (verbose) console.log(`📄 Loading: ${fileUrl}`);
    
    await page.goto(fileUrl, {
      waitUntil: 'networkidle0',
      timeout: timeout
    });

    console.log('⏳ Waiting for ReSpec to process...');
    
    // Wait for ReSpec to finish processing
    if (verbose) console.log(`  Waiting for ReSpec...`);
    
    // Add console logging from the page
    page.on('console', msg => {
      if (verbose) console.log('Page console:', msg.text());
    });
    
    // Check if ReSpec is even loading
    const hasReSpec = await page.evaluate(() => {
      return typeof window.respecConfig !== 'undefined';
    });
    
    if (verbose) console.log(`  ReSpec config found: ${hasReSpec}`);
    
    // Try multiple detection methods for ReSpec completion
    try {
      await page.waitForFunction(() => {
        // Check multiple possible completion signals
        return window.hasOwnProperty('respecIsReady') || 
               (document.body && document.body.classList.contains('respec-ready')) ||
               (document.getElementById('abstract') && document.querySelector('.respec-h2'));
      }, { timeout: timeout });
    } catch (err) {
      // Try a simple wait as fallback - if we see ReSpec output, it's probably done
      console.log('  ReSpec signal not detected, checking if document looks complete...');
      await new Promise(resolve => setTimeout(resolve, 5000));  // Wait 5 more seconds
      
      const hasContent = await page.evaluate(() => {
        return document.body && document.body.innerText.length > 1000;
      });
      
      if (!hasContent) {
        const bodyText = await page.evaluate(() => document.body.innerText);
        console.error('Page content:', bodyText.substring(0, 500));
        throw new Error(`ReSpec did not finish processing within ${timeout}ms. This might be a network issue loading ReSpec from CDN.`);
      }
      
      console.log('  Document appears complete despite missing signal');
    }

    console.log('✓ ReSpec processing complete');

    // Check for ReSpec errors
    const errors = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('.respec-error');
      return Array.from(errorElements).map(el => el.textContent.trim());
    });

    if (errors.length > 0) {
      console.error('\n❌ ReSpec errors found:');
      errors.forEach(err => console.error(`   - ${err}`));
      throw new Error('ReSpec processing failed with errors');
    }

    // Check for ReSpec warnings (non-fatal)
    const warnings = await page.evaluate(() => {
      const warnElements = document.querySelectorAll('.respec-warning');
      return Array.from(warnElements).map(el => el.textContent.trim());
    });

    if (warnings.length > 0 && verbose) {
      console.log('\n⚠️  ReSpec warnings:');
      warnings.forEach(warn => console.log(`   - ${warn}`));
    }

    // Extract the processed HTML
    if (verbose) console.log('\n📦 Extracting HTML...');
    const html = await page.content();

    // Ensure output directory exists
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      if (verbose) console.log(`✓ Created directory: ${outputDir}`);
    }

    // Write to output file
    fs.writeFileSync(outputFile, html, 'utf8');

    const stats = fs.statSync(outputFile);
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    console.log(`\n✅ Built successfully!`);
    console.log(`   Output: ${outputFile}`);
    console.log(`   Size: ${sizeKB} KB`);

  } finally {
    await browser.close();
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  let input = 'source/index.html';
  let output = 'build/index.html';
  let verbose = false;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--verbose' || args[i] === '-v') {
      verbose = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Usage: node scripts/build-spec.js [input] [output] [options]

Arguments:
  input   Path to ReSpec source HTML (default: source/index.html)
  output  Path to output static HTML (default: build/index.html)

Options:
  --verbose, -v    Verbose output
  --help, -h       Show this help message

Examples:
  node scripts/build-spec.js
  node scripts/build-spec.js source/index.html build/index.html
  node scripts/build-spec.js --verbose
      `);
      process.exit(0);
    } else if (!args[i].startsWith('--')) {
      if (i === 0 || (i === 1 && verbose)) {
        input = args[i];
      } else if (i === 1 || (i === 2 && verbose)) {
        output = args[i];
      }
    }
  }

  buildSpec(input, output, { verbose })
    .then(() => {
      console.log('\n✨ Build complete!\n');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Build failed:', err.message);
      if (verbose) console.error(err.stack);
      process.exit(1);
    });
}

module.exports = { buildSpec };
