import puppeteer, { Browser, Page } from 'puppeteer';
import { setTimeout } from "node:timers/promises";

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

  let mode: 'words' | 'time' = 'words' as 'words' | 'time';
  const configValue = 100;
  const punctuation = true;
  const numbers = true;

  await page.waitForSelector(`button[mode="${mode}"]`, { visible: true });
  await page.click(`button[mode="${mode}"]`);
  await page.waitForSelector(`button[mode="${mode}"].active`, { visible: true });
  console.log(`${mode} mode activated`);

  const configAttr = mode === 'time' ? 'timeconfig' : 'wordcount';
  await page.waitForSelector(`button[${configAttr}="${configValue}"]`, { visible: true });
  const configButton = await page.$(`button[${configAttr}="${configValue}"]`);
  if (configButton) {
    await configButton.click();
    console.log(`Set ${mode} mode to ${configValue}`);
  } else {
    console.error(`${configAttr} button not found!`);
    await browser.close();
    return;
  }
  if (punctuation) {
    const puncButton = await page.$('button.punctuationMode');
    if (puncButton) {
      const isActive = await puncButton.evaluate((el) => el.classList.contains('active'));
      if (!isActive) {
        await puncButton.click();
        console.log('Punctuation mode activated');
      }
    }
  }
  if (numbers) {
    const numbersButton = await page.$('button.numbersMode');
    if (numbersButton) {
      const isActive = await numbersButton.evaluate((el) => el.classList.contains('active'));
      if (!isActive) {
        await numbersButton.click();
        console.log('Numbers mode activated');
      }
    }
  }

  console.log('Typing test started...');
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

  console.log('Typing completed! Waiting for stats...');

  await page.waitForSelector('.stats', { visible: true, timeout: 600000 });

  const stats = await page.evaluate(() => {
    const wpm = document.querySelector('.stats .group.wpm .bottom')?.textContent?.trim();
    const acc = document.querySelector('.stats .group.acc .bottom')?.textContent?.trim();
    return { wpm, acc };
  });

  console.log('Test completed!');
  console.log(`WPM: ${stats.wpm}, Accuracy: ${stats.acc}`);

  // await browser.close();
})();
