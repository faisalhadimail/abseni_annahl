const puppeteer = require('puppeteer');

async function main() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process'
        ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Navigating to localhost:3000...');
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: '/home/z/my-project/page_screenshot.png', fullPage: false });
    console.log('Screenshot saved!');
    
    const title = await page.title();
    console.log('Page title:', title);
    
    await browser.close();
    console.log('Done!');
}

main().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
