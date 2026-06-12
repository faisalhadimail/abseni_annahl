const puppeteer = require('puppeteer');

async function main() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--no-zygote',
            '--single-process'
        ]
    });
    
    const page = await browser.newPage();
    
    // Step 1: Navigate to localhost:3000
    console.log('Step 1: Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Step 2: Take screenshot of landing page
    console.log('Step 2: Taking screenshot of landing page...');
    await page.screenshot({ path: '/home/z/my-project/landing_page.png' });
    console.log('Screenshot saved to /home/z/my-project/landing_page.png');
    
    await browser.close();
    
    console.log('\n=== TEST COMPLETE ===');
}

main().catch(console.error);
