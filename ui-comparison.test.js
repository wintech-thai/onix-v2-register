/**
 * UI Comparison Test Script
 *
 * Compares the Registration UI with the Template UI to ensure visual consistency.
 * Tests header, footer, colors, typography, and layout structure.
 *
 * Usage:
 *   node ui-comparison.test.js
 *
 * Prerequisites:
 *   - Dev server running on port 4500 (npm run dev)
 *   - Playwright installed (npm install -D playwright)
 */

const { chromium } = require('playwright');
const http = require('http');

// Expected design tokens from template
const EXPECTED_COLORS = {
  header: {
    background: 'rgb(24, 49, 83)', // #183153
    border: 'rgb(37, 64, 107)',    // #25406b
    text: 'rgb(243, 247, 250)',    // #f3f7fa
    badge: 'rgb(37, 99, 235)',     // #2563eb
  },
  footer: {
    background: 'rgb(24, 49, 83)', // #183153
    border: 'rgb(37, 64, 107)',    // #25406b
    text: 'rgb(182, 198, 227)',    // #b6c6e3
  },
  layout: {
    background: 'rgb(247, 248, 251)', // #f7f8fb
  },
  dropdown: {
    background: 'rgb(255, 255, 255)',
    selectedBg: 'rgb(239, 246, 255)', // #eff6ff
    selectedText: 'rgb(30, 58, 138)', // #1e3a8a
  },
};

const EXPECTED_DIMENSIONS = {
  badge: { width: 28, height: 28 },
  container: { maxWidth: '960px' },
  dropdown: { width: '160px' },
};

// Test results
const results = {
  passed: [],
  failed: [],
  warnings: [],
};

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m',
  };

  const prefix = {
    info: 'ℹ',
    success: '✓',
    error: '✗',
    warning: '⚠',
  };

  console.log(`${colors[type]}${prefix[type]} ${message}${colors.reset}`);
}

function addResult(category, test, passed, actual, expected) {
  const result = {
    category,
    test,
    passed,
    actual,
    expected,
  };

  if (passed) {
    results.passed.push(result);
    log(`${category}: ${test} - PASSED`, 'success');
  } else {
    results.failed.push(result);
    log(`${category}: ${test} - FAILED`, 'error');
    log(`  Expected: ${expected}`, 'error');
    log(`  Actual: ${actual}`, 'error');
  }
}

function addWarning(category, message) {
  results.warnings.push({ category, message });
  log(`${category}: ${message}`, 'warning');
}

function colorsMatch(actual, expected, tolerance = 3) {
  // Parse RGB strings like "rgb(24, 49, 83)"
  const parseRgb = (str) => {
    const match = str.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : null;
  };

  const actualRgb = parseRgb(actual);
  const expectedRgb = parseRgb(expected);

  if (!actualRgb || !expectedRgb) return false;

  return actualRgb.every((val, i) => Math.abs(val - expectedRgb[i]) <= tolerance);
}

function dimensionsMatch(actual, expected, tolerance = 2) {
  return Math.abs(actual - expected) <= tolerance;
}

async function testHeaderColors(page) {
  log('\n=== Testing Header Colors ===', 'info');

  const nav = await page.locator('header nav').first();

  // Background color
  const bgColor = await nav.evaluate(el => window.getComputedStyle(el).backgroundColor);
  addResult(
    'Header Colors',
    'Background color',
    colorsMatch(bgColor, EXPECTED_COLORS.header.background),
    bgColor,
    EXPECTED_COLORS.header.background
  );

  // Border color
  const borderColor = await nav.evaluate(el => {
    const border = window.getComputedStyle(el).borderBottomColor;
    return border;
  });
  addResult(
    'Header Colors',
    'Border color',
    colorsMatch(borderColor, EXPECTED_COLORS.header.border),
    borderColor,
    EXPECTED_COLORS.header.border
  );

  // Text color
  const textColor = await nav.evaluate(el => {
    const link = el.querySelector('a');
    return link ? window.getComputedStyle(link).color : 'not found';
  });
  addResult(
    'Header Colors',
    'Text color',
    colorsMatch(textColor, EXPECTED_COLORS.header.text),
    textColor,
    EXPECTED_COLORS.header.text
  );

  // PS Badge color
  const badgeColor = await nav.evaluate(el => {
    const badge = el.querySelector('a span');
    return badge ? window.getComputedStyle(badge).backgroundColor : 'not found';
  });
  addResult(
    'Header Colors',
    'PS Badge background',
    colorsMatch(badgeColor, EXPECTED_COLORS.header.badge),
    badgeColor,
    EXPECTED_COLORS.header.badge
  );
}

async function testHeaderDimensions(page) {
  log('\n=== Testing Header Dimensions ===', 'info');

  // PS Badge dimensions
  const badge = await page.locator('header a span').first();
  const badgeBox = await badge.boundingBox();

  if (badgeBox) {
    addResult(
      'Header Dimensions',
      'PS Badge width',
      dimensionsMatch(badgeBox.width, EXPECTED_DIMENSIONS.badge.width),
      `${badgeBox.width.toFixed(1)}px`,
      `${EXPECTED_DIMENSIONS.badge.width}px`
    );

    addResult(
      'Header Dimensions',
      'PS Badge height',
      dimensionsMatch(badgeBox.height, EXPECTED_DIMENSIONS.badge.height),
      `${badgeBox.height.toFixed(1)}px`,
      `${EXPECTED_DIMENSIONS.badge.height}px`
    );
  } else {
    addWarning('Header Dimensions', 'PS Badge not found');
  }

  // Container max-width
  const container = await page.locator('header nav > div').first();
  const maxWidth = await container.evaluate(el => window.getComputedStyle(el).maxWidth);
  addResult(
    'Header Dimensions',
    'Container max-width',
    maxWidth === EXPECTED_DIMENSIONS.container.maxWidth,
    maxWidth,
    EXPECTED_DIMENSIONS.container.maxWidth
  );
}

async function testHeaderTypography(page) {
  log('\n=== Testing Header Typography ===', 'info');

  // Title font weight
  const titleWeight = await page.locator('header a span').nth(1).evaluate(el =>
    window.getComputedStyle(el).fontWeight
  );
  addResult(
    'Header Typography',
    'Title font weight',
    titleWeight === '700',
    titleWeight,
    '700'
  );

  // Title letter spacing
  const letterSpacing = await page.locator('header a span').nth(1).evaluate(el =>
    window.getComputedStyle(el).letterSpacing
  );
  const hasLetterSpacing = letterSpacing !== 'normal' && parseFloat(letterSpacing) > 0;
  addResult(
    'Header Typography',
    'Title letter spacing',
    hasLetterSpacing,
    letterSpacing,
    '0.2px (positive value)'
  );
}

async function testFooterColors(page) {
  log('\n=== Testing Footer Colors ===', 'info');

  const footer = await page.locator('footer').first();

  // Background color
  const bgColor = await footer.evaluate(el => window.getComputedStyle(el).backgroundColor);
  addResult(
    'Footer Colors',
    'Background color',
    colorsMatch(bgColor, EXPECTED_COLORS.footer.background),
    bgColor,
    EXPECTED_COLORS.footer.background
  );

  // Text color
  const textColor = await footer.evaluate(el => {
    const div = el.querySelector('div > div');
    return div ? window.getComputedStyle(div).color : 'not found';
  });
  addResult(
    'Footer Colors',
    'Text color',
    colorsMatch(textColor, EXPECTED_COLORS.footer.text),
    textColor,
    EXPECTED_COLORS.footer.text
  );

  // Border color
  const borderColor = await footer.evaluate(el =>
    window.getComputedStyle(el).borderTopColor
  );
  addResult(
    'Footer Colors',
    'Border color',
    colorsMatch(borderColor, EXPECTED_COLORS.footer.border),
    borderColor,
    EXPECTED_COLORS.footer.border
  );
}

async function testFooterContent(page) {
  log('\n=== Testing Footer Content ===', 'info');

  // Copyright text
  const copyrightText = await page.locator('footer div > div').first().textContent();
  const hasCopyright = copyrightText.includes('2025') && copyrightText.includes('Please Scan');
  addResult(
    'Footer Content',
    'Copyright text',
    hasCopyright,
    copyrightText?.trim(),
    '© 2025 Please Scan'
  );

  // Privacy link
  const privacyLink = await page.locator('footer a').first();
  const privacyHref = await privacyLink.getAttribute('href');
  const privacyText = await privacyLink.textContent();

  addResult(
    'Footer Content',
    'Privacy link href',
    privacyHref === 'https://please-scan.com/privacy',
    privacyHref,
    'https://please-scan.com/privacy'
  );

  addResult(
    'Footer Content',
    'Privacy link text (Thai)',
    privacyText === 'นโยบายความเป็นส่วนตัว',
    privacyText,
    'นโยบายความเป็นส่วนตัว'
  );
}

async function testLayoutStructure(page) {
  log('\n=== Testing Layout Structure ===', 'info');

  // Page background
  const pageContainer = await page.locator('body > div').first();
  const bgColor = await pageContainer.evaluate(el =>
    window.getComputedStyle(el).backgroundColor
  );
  addResult(
    'Layout Structure',
    'Page background color',
    colorsMatch(bgColor, EXPECTED_COLORS.layout.background),
    bgColor,
    EXPECTED_COLORS.layout.background
  );

  // Flex layout
  const display = await pageContainer.evaluate(el =>
    window.getComputedStyle(el).display
  );
  addResult(
    'Layout Structure',
    'Flex display',
    display === 'flex',
    display,
    'flex'
  );

  const flexDirection = await pageContainer.evaluate(el =>
    window.getComputedStyle(el).flexDirection
  );
  addResult(
    'Layout Structure',
    'Flex direction column',
    flexDirection === 'column',
    flexDirection,
    'column'
  );

  // Min height
  const minHeight = await pageContainer.evaluate(el =>
    window.getComputedStyle(el).minHeight
  );
  const hasFullHeight = minHeight.includes('100vh') || parseFloat(minHeight) >= 600;
  addResult(
    'Layout Structure',
    'Min-height (full viewport)',
    hasFullHeight,
    minHeight,
    '100vh or equivalent'
  );
}

async function testLanguageSelector(page) {
  log('\n=== Testing Language Selector ===', 'info');

  // Find language button
  const langButton = await page.locator('header button[aria-haspopup="true"]').first();

  // Check button exists
  const buttonExists = await langButton.count() > 0;
  addResult(
    'Language Selector',
    'Button exists',
    buttonExists,
    buttonExists ? 'Found' : 'Not found',
    'Found'
  );

  if (!buttonExists) {
    addWarning('Language Selector', 'Cannot test dropdown - button not found');
    return;
  }

  // Open dropdown
  await langButton.click();
  await page.waitForTimeout(300); // Wait for animation

  // Check dropdown visibility
  const dropdown = await page.locator('header div[role="menu"]').first();
  const isVisible = await dropdown.isVisible();
  addResult(
    'Language Selector',
    'Dropdown opens',
    isVisible,
    isVisible ? 'Visible' : 'Hidden',
    'Visible'
  );

  if (isVisible) {
    // Dropdown background
    const dropdownBg = await dropdown.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    addResult(
      'Language Selector',
      'Dropdown background',
      colorsMatch(dropdownBg, EXPECTED_COLORS.dropdown.background),
      dropdownBg,
      EXPECTED_COLORS.dropdown.background
    );

    // Dropdown width
    const dropdownWidth = await dropdown.evaluate(el =>
      window.getComputedStyle(el).width
    );
    addResult(
      'Language Selector',
      'Dropdown width',
      dropdownWidth === EXPECTED_DIMENSIONS.dropdown.width,
      dropdownWidth,
      EXPECTED_DIMENSIONS.dropdown.width
    );

    // Check selected item styling
    const selectedItem = await page.locator('header div[role="menuitem"]').first();
    if (await selectedItem.count() > 0) {
      const selectedBg = await selectedItem.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      addResult(
        'Language Selector',
        'Selected item background',
        colorsMatch(selectedBg, EXPECTED_COLORS.dropdown.selectedBg),
        selectedBg,
        EXPECTED_COLORS.dropdown.selectedBg
      );
    }
  }

  // Close dropdown (click outside)
  await page.mouse.click(10, 10);
  await page.waitForTimeout(200);
}

async function testResponsive(page) {
  log('\n=== Testing Responsive Behavior ===', 'info');

  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(200);

    // Check if header is visible
    const headerVisible = await page.locator('header').isVisible();
    addResult(
      'Responsive',
      `${viewport.name} (${viewport.width}px) - Header visible`,
      headerVisible,
      headerVisible ? 'Visible' : 'Hidden',
      'Visible'
    );

    // Check if footer is visible
    const footerVisible = await page.locator('footer').isVisible();
    addResult(
      'Responsive',
      `${viewport.name} (${viewport.width}px) - Footer visible`,
      footerVisible,
      footerVisible ? 'Visible' : 'Hidden',
      'Visible'
    );
  }

  // Reset to desktop
  await page.setViewportSize({ width: 1920, height: 1080 });
}

function printSummary() {
  console.log('\n' + '='.repeat(70));
  console.log('                    TEST SUMMARY                    ');
  console.log('='.repeat(70));

  const total = results.passed.length + results.failed.length;
  const passRate = total > 0 ? ((results.passed.length / total) * 100).toFixed(1) : 0;

  log(`\nTotal Tests: ${total}`, 'info');
  log(`Passed: ${results.passed.length}`, 'success');
  log(`Failed: ${results.failed.length}`, results.failed.length > 0 ? 'error' : 'success');
  log(`Warnings: ${results.warnings.length}`, results.warnings.length > 0 ? 'warning' : 'success');
  log(`Pass Rate: ${passRate}%`, passRate >= 95 ? 'success' : passRate >= 80 ? 'warning' : 'error');

  if (results.failed.length > 0) {
    console.log('\n' + '-'.repeat(70));
    log('FAILED TESTS:', 'error');
    results.failed.forEach(result => {
      console.log(`\n  ${result.category}: ${result.test}`);
      console.log(`    Expected: ${result.expected}`);
      console.log(`    Actual:   ${result.actual}`);
    });
  }

  if (results.warnings.length > 0) {
    console.log('\n' + '-'.repeat(70));
    log('WARNINGS:', 'warning');
    results.warnings.forEach(warning => {
      console.log(`  ${warning.category}: ${warning.message}`);
    });
  }

  console.log('\n' + '='.repeat(70));

  if (passRate >= 95) {
    log('\n🎉 UI COMPARISON PASSED! Visual match is excellent.', 'success');
  } else if (passRate >= 80) {
    log('\n⚠️  UI COMPARISON PARTIAL PASS. Some minor differences found.', 'warning');
  } else {
    log('\n❌ UI COMPARISON FAILED. Significant differences found.', 'error');
  }

  console.log('='.repeat(70) + '\n');
}

async function checkServer() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:4500/en', (res) => {
      resolve(true);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function runTests() {
  log('Starting UI Comparison Test...', 'info');
  log('Connecting to http://localhost:4500/en\n', 'info');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    // Navigate to page
    await page.goto('http://localhost:4500/en', { waitUntil: 'networkidle' });
    log('Page loaded successfully\n', 'success');

    // Run all test suites
    await testHeaderColors(page);
    await testHeaderDimensions(page);
    await testHeaderTypography(page);
    await testFooterColors(page);
    await testFooterContent(page);
    await testLayoutStructure(page);
    await testLanguageSelector(page);
    await testResponsive(page);

    // Print summary
    printSummary();

  } catch (error) {
    log(`\nTest execution failed: ${error.message}`, 'error');
    console.error(error);
  } finally {
    await browser.close();
  }

  // Exit with appropriate code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Main execution
(async () => {
  log('\n🔍 Checking if dev server is running...', 'info');

  const serverRunning = await checkServer();

  if (!serverRunning) {
    log('\n❌ Error: Dev server is not running on port 4500', 'error');
    log('\nPlease start the server first:', 'info');
    log('  cd onix-v2-register', 'info');
    log('  npm run dev\n', 'info');
    log('Then run this test again:', 'info');
    log('  node ui-comparison.test.js\n', 'info');
    process.exit(1);
  }

  log('✓ Dev server is running on port 4500\n', 'success');

  await runTests();
})();
