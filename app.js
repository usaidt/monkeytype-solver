const { timeout } = require('puppeteer');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/nix/store/33r3za8x217l57666ff0j51lni6z9nhx-user-environment/bin/google-chrome-stable',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('https://monkeytype.com');
  await page.waitForSelector('button.acceptAll');
  await page.click('button.acceptAll');
  await page.waitForSelector('#wordsInput');

  await page.click('button[mode="words"]');

  await page.waitForSelector('button[mode="words"].active', { visible: true });
  console.log('Words mode activated');

  await page.waitForSelector('.wordCount', { visible: true });
  console.log('Word count options visible');

  const wordButton = await page.$('button[wordcount="10"]');
  await wordButton.click({ force: true });

  await page.waitForSelector('#wordsInput');
  await page.click('#wordsInput');
  timeout(1010) // First word becomes mistake otherwise

  const words = await page.evaluate(() => {
    const wordDivs = document.querySelectorAll('#words .word');
    const wordArray = [];
    wordDivs.forEach((wordDiv) => {
      const word = Array.from(wordDiv.querySelectorAll('letter')).map(letter => letter.textContent).join('');
      wordArray.push(word);
    });
    return wordArray;
  });

  for (const word of words) {
    await page.type('#wordsInput', word + ' ', { delay: 2 });
  }
  
})();
