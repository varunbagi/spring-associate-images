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
