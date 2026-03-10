const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:18080/index.html', { waitUntil: 'networkidle' });
  
  await page.waitForTimeout(2000); 
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(2000);
  
  // Set progress for DC Advisory. Scene index is 6.
  // Move camera close to DC Advisory so character is there and prompt appears
  await page.evaluate(() => window.scrollTo(0, 14400 * 0.5));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'assets/visual-review/lore_prompt_dc.png' });

  // Try to click the inspect prompt if visible
  const isVisible = await page.evaluate(() => {
    const el = document.getElementById('inspect-prompt');
    return el && el.style.display === 'block';
  });
  
  if (isVisible) {
    await page.click('#inspect-prompt');
    await page.waitForTimeout(2000); // Wait for typing
    await page.screenshot({ path: 'assets/visual-review/lore_dialogue_dc.png' });
  }

  await browser.close();
})();
