import puppeteer, { Browser, Page } from 'puppeteer';
import {setTimeout} from "node:timers/promises";

(async () => {
  const browser: Browser = await puppeteer.launch({
    executablePath: '/nix/store/33r3za8x217l57666ff0j51lni6z9nhx-user-environment/bin/google-chrome-stable',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page: Page = await browser.newPage();
  await page.goto('https://monkeytype.com');

  await page.waitForSelector('button.acceptAll', { visible: true });
  await page.click('button.acceptAll');

  await page.waitForSelector('button[mode="words"]', { visible: true });
  await page.click('button[mode="words"]');
  
  await page.waitForSelector('button[mode="words"].active', { visible: true });
  console.log('Words mode activated');

  await page.waitForSelector('button[wordcount="50"]', { visible: true });
  const wordButton = await page.$('button[wordcount="50"]');
  if (wordButton) {
    await wordButton.click();
  } else {
    console.error('Word count button not found!');
    await browser.close();
    return;
  }

  await page.waitForSelector('#wordsInput', { visible: true });
  await page.click('#wordsInput');

  await setTimeout(1000);

  const words = await page.evaluate(() => {
    const wordDivs = document.querySelectorAll('#words .word');
    const wordArray: string[] = [];
    wordDivs.forEach((wordDiv) => {
      const word = Array.from(wordDiv.querySelectorAll('letter'))
        .map((letter) => letter.textContent)
        .join('');
      wordArray.push(word);
    });
    return wordArray;
  });

  console.log('Words extracted:', words);

  for (const word of words) {
    await page.type('#wordsInput', word + ' ', { delay: 2 });
  }

  console.log('Typing completed!');
  // await browser.close();
})();
