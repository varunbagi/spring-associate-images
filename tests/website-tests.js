# Test File 1: tests/website-tests.js
const puppeteer = require('puppeteer');
const fs = require('fs');

async function runWebsiteTests() {
    console.log('🚀 Starting Spring Associates Website Tests...');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    const testResults = [];
    
    try {
        // Test 1: Page loads successfully
        console.log('📄 Testing page load...');
        const response = await page.goto('https://varunbagi.github.io/spring-associate-images/', {
            waitUntil: 'networkidle2',
            timeout: 10000
        });
        
        const pageLoadTest = {
            name: 'Page Load',
            passed: response.status() === 200,
            details: `Status: ${response.status()}`
        };
        testResults.push(pageLoadTest);
        console.log(pageLoadTest.passed ? '✅ Page loads successfully' : '❌ Page failed to load');
        
        // Test 2: All required sections exist
        console.log('🔍 Testing section existence...');
        const sections = ['hero', 'tea-types', 'signature-blends', 'services', 'contact'];
        let sectionsFound = 0;
        
        for (const sectionId of sections) {
            const element = await page.$(`#${sectionId}`);
            if (element) {
                sectionsFound++;
                console.log(`✅ Section '${sectionId}' found`);
            } else {
                console.log(`❌ Section '${sectionId}' missing`);
            }
        }
        
        testResults.push({
            name: 'Required Sections',
            passed: sectionsFound === sections.length,
            details: `${sectionsFound}/${sections.length} sections found`
        });
        
        // Test 3: Hamburger menu functionality
        console.log('🍔 Testing hamburger menu...');
        
        // Check if hamburger exists
        const hamburger = await page.$('.hamburger');
        const navMenu = await page.$('#navMenu');
        
        if (hamburger && navMenu) {
            // Click hamburger
            await hamburger.click();
            await page.waitForTimeout(500);
            
            // Check if menu is active
            const isMenuActive = await page.evaluate(() => {
                const menu = document.getElementById('navMenu');
                return menu && menu.classList.contains('active');
            });
            
            testResults.push({
                name: 'Hamburger Menu',
                passed: isMenuActive,
                details: isMenuActive ? 'Menu opens correctly' : 'Menu failed to open'
            });
            console.log(isMenuActive ? '✅ Hamburger menu works' : '❌ Hamburger menu failed');
        } else {
            testResults.push({
                name: 'Hamburger Menu',
                passed: false,
                details: 'Menu elements not found'
            });
            console.log('❌ Hamburger menu elements missing');
        }
        
        // Test 4: Tea card click functionality
        console.log('🫖 Testing tea card clicks...');
        const teaCards = await page.$$('.tea-card');
        
        testResults.push({
            name: 'Tea Cards',
            passed: teaCards.length === 2,
            details: `Found ${teaCards.length} tea cards (expected 2)`
        });
        console.log(`Found ${teaCards.length} tea cards`);
        
        // Test 5: Service cards color variety
        console.log('🎨 Testing service card colors...');
        const serviceCards = await page.$$('.service-card');
        
        const backgroundColors = await Promise.all(
            serviceCards.map(card =>
                page.evaluate(el => window.getComputedStyle(el).backgroundImage, card)
            )
        );
        
        const uniqueColors = new Set(backgroundColors);
        testResults.push({
            name: 'Service Card Colors',
            passed: uniqueColors.size === 3 && serviceCards.length === 3,
            details: `${uniqueColors.size} unique colors found in ${serviceCards.length} cards`
        });
        console.log(`Service cards have ${uniqueColors.size} unique colors`);
        
        // Test 6: Image loading
        console.log('🖼️ Testing image loading...');
        const images = await page.$$('img');
        let loadedImages = 0;
        
        for (const img of images) {
            const isLoaded = await page.evaluate(el => el.complete && el.naturalWidth > 0, img);
            if (isLoaded) loadedImages++;
        }
        
        testResults.push({
            name: 'Image Loading',
            passed: loadedImages === images.length,
            details: `${loadedImages}/${images.length} images loaded successfully`
        });
        console.log(`${loadedImages}/${images.length} images loaded`);
        
        // Test 7: Navigation links
        console.log('🧭 Testing navigation...');
        const navLinks = await page.$$('.nav-menu a');
        
        testResults.push({
            name: 'Navigation Links',
            passed: navLinks.length === 5,
            details: `Found ${navLinks.length} navigation links (expected 5)`
        });
        console.log(`Found ${navLinks.length} navigation links`);
        
    } catch (error) {
        console.error('Test execution error:', error);
        testResults.push({
            name: 'Test Execution',
            passed: false,
            details: error.message
        });
    }
    
    await browser.close();
    
    // Generate test report
    const passedTests = testResults.filter(test => test.passed).length;
    const totalTests = testResults.length;
    
    console.log('\n' + '='.repeat(50));
    console.log(`TEST SUMMARY: ${passedTests}/${totalTests} tests passed`);
    console.log('='.repeat(50));
    
    testResults.forEach(test => {
        const status = test.passed ? '✅' : '❌';
        console.log(`${status} ${test.name}: ${test.details}`);
    });
    
    // Save results to file
    const report = {
        timestamp: new Date().toISOString(),
        summary: `${passedTests}/${totalTests} tests passed`,
        tests: testResults
    };
    
    fs.mkdirSync('test-results', { recursive: true });
    fs.writeFileSync('test-results/website-test-report.json', JSON.stringify(report, null, 2));
    
    // Exit with error if tests failed
    process.exit(passedTests === totalTests ? 0 : 1);
}

runWebsiteTests();

---

# Test File 2: tests/lighthouse-test.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

async function runLighthouseTest() {
    console.log('🔍 Running Lighthouse Performance Test...');
    
    const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
    const options = {logLevel: 'info', output: 'json', port: chrome.port};
    
    try {
        const runnerResult = await lighthouse('https://varunbagi.github.io/spring-associate-images/', options);
        
        const scores = {
            performance: Math.round(runnerResult.lhr.categories.performance.score * 100),
            accessibility: Math.round(runnerResult.lhr.categories.accessibility.score * 100),
            bestPractices: Math.round(runnerResult.lhr.categories['best-practices'].score * 100),
            seo: Math.round(runnerResult.lhr.categories.seo.score * 100)
        };
        
        console.log('Lighthouse Scores:');
        console.log(`📊 Performance: ${scores.performance}/100`);
        console.log(`♿ Accessibility: ${scores.accessibility}/100`);
        console.log(`✨ Best Practices: ${scores.bestPractices}/100`);
        console.log(`🔍 SEO: ${scores.seo}/100`);
        
        // Save detailed report
        fs.mkdirSync('test-results', { recursive: true });
        fs.writeFileSync('test-results/lighthouse-report.json', runnerResult.report);
        
        // Check if scores meet minimum requirements
        const minimumScores = { performance: 70, accessibility: 90, bestPractices: 80, seo: 80 };
        let allPassed = true;
        
        Object.entries(minimumScores).forEach(([category, minimum]) => {
            if (scores[category] < minimum) {
                console.log(`❌ ${category} score (${scores[category]}) below minimum (${minimum})`);
                allPassed = false;
            } else {
                console.log(`✅ ${category} score meets requirements`);
            }
        });
        
        process.exit(allPassed ? 0 : 1);
        
    } finally {
        await chrome.kill();
    }
}

runLighthouseTest();

---

# Package.json
{
  "name": "spring-associates-tests",
  "version": "1.0.0",
  "description": "Automated tests for Spring Associates website",
  "scripts": {
    "test": "node tests/website-tests.js && node tests/lighthouse-test.js"
  },
  "dependencies": {
    "puppeteer": "^19.0.0",
    "lighthouse": "^10.0.0",
    "chrome-launcher": "^0.15.0"
  }
}
