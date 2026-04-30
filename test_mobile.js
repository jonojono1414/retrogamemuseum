import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:3001');
  
  // Wait for 3D to render
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'hero_mobile.png' });
  
  // Click first card
  await page.click('.console-card');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'viewer_mobile.png' });
  
  await browser.close();
})();
