const puppeteer = require('puppeteer');
const fs = require('fs')

async function scrap (url, {savePath} = {})
{
    const {browser, page} = await newInstance()
    await page.goto(url);
    await page.screenshot({path: 'screenshot.png'});
    let html = await page.content();
    browser.close();

    if (savePath)
    {
        fs.writeFileSync(savePath, html, {encoding: 'utf-8'})
    }

    return html
}

async function newInstance ()
{
    const browser = await puppeteer.launch({headless: false, defaultViewport: null, args: ['--start-maximized']});
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
    
    return {browser, page}
}

/**
 * 
 * @param {puppeteer.Page} page 
 * @param {ElementHandle<Element>} element 
 */
function getTextContent (page, element)
{
    return page.evaluate(e => e.textContent, element)
}

/**
 * 
 * @param {puppeteer.Page} page 
 * @param {ElementHandle<Element>} element 
 */
function getInnerHtml (page, element)
{
    return page.evaluate(e => e.innerHTML, element)
}


module.exports = {scrap, newInstance, getTextContent, getInnerHtml}