const { JSDOM } = require("jsdom")
const request = require('request')
const fs = require('fs')
const Path = require('path')
const urljoin = require('url-join')
const Scrapper = require('./scrapper')
const rimraf = require("rimraf")


const REQUEST_RATE = 5000
var lastRequest
/**
 * @returns {Promise<JSDOM>}
 */
async function pageToDom (url, shallow)
{
    url = encodeURI(url)
    const toWait = lastRequest + REQUEST_RATE - Date.now() 
    if (toWait > 0 && lastRequest) await new Promise(resolve => setTimeout(resolve, toWait))
    lastRequest = Date.now()

    return new Promise(resolve =>
    {
        request.get(url, (err, response, body) =>
        {
            if (err) console.error(err, url)
            var dom = new JSDOM(response.body, {url})
            resolve(dom)
        })
    })
}

/**
 * @returns {Promise<HTMLElement>}
 */
async function pageToDomBody (url, shallow)
{
    const dom = await pageToDom(url, shallow)
    return dom.window.document.body
}

function getPageUrl (jobId, pagination)
{
    return `https://www.dofus.com/fr/mmorpg/encyclopedie/metiers/${jobId}?page=${pagination}&forum=1`
}

async function downloadJobs (jobId)
{
    const savePath = './downloads/jobs/' + jobId + '/pages'
    await downloadJobPages(jobId)
    const files = fs.readdirSync(savePath)
    for (var filepath of files)
    {
        filepath = urljoin(savePath, filepath)
        await parseJobPage(filepath)
    }
}

async function downloadJobPages (jobId)
{
    for (var i = 1; i < 30; i++)
    {
        const filename = 'job-' + i + '.html'
        const directory =  './downloads/jobs/' + jobId + '/pages'
        fs.mkdirSync(directory, {recursive: true})
        const path = urljoin(directory, filename)
        
        if (fs.existsSync(path))
        {
            const filecontent = fs.readFileSync(path, {encoding: 'utf-8'})
            if (!filecontent.startsWith('<'))
            {
                console.log('🔥 Page', path, 'not usable, redownloading.')
            }
            else continue
        }
        
        const pageUrl = getPageUrl(jobId, i)
        console.log('Downloading', pageUrl, 'to', path)
        await Scrapper.scrap(pageUrl, {savePath: path})
    }
}

async function parseJobPage (path)
{
    const savePath = urljoin(Path.dirname(path), 'saved.json')
    const job = fs.existsSync(savePath) ? JSON.parse(fs.readFileSync(savePath)) : {crafts: []}
    const b = new JSDOM(fs.readFileSync(path)).window.document.body
    const recipes = b.querySelectorAll('.ak-panel-content tbody tr')

    const {browser, page} = await Scrapper.newInstance()

    for (const recipe of recipes)
    {
        const itemElem = recipe.querySelector('td a')
        const itemName = itemElem.textContent
        if (job.crafts.some(i => i.name == itemName))
        {
            console.log('🟧 Already downloaded', itemName)
            continue
        }

        const itemUrl = 'https://www.dofus.com' + itemElem.getAttribute('href')
        const itemLevel = recipe.querySelector('.ak-fixed-100').innerHTML
        
        await sleep(10000)

        try
        {
            const item = await fetchJobItem(page, itemUrl)
            job.crafts.push(item)
            console.log('Total item count:', job.crafts.length)
            fs.writeFileSync(savePath, JSON.stringify(job))

            console.log('✅ Downloaded niv.', item.level, item.name)
        }
        catch (e)
        {
            console.log(e)
            console.error('Could not download', itemUrl)
        }
    }

    browser.close()

    return job
}

function sleep (ms)
{
    return new Promise(r => setTimeout(r, ms))
}

async function fetchJobItem (page, pageUrl)
{
    await page.goto(pageUrl)
    // const b = await pageToDomBody(pageUrl)

    const item =
    {
        name: (await Scrapper.getTextContent(page, await page.$('.ak-main-page .ak-return-link'))).replace(/\n/gm, '').trim(),
        level: Number.parseInt((await Scrapper.getTextContent(page, await page.$('.ak-encyclo-detail-level'))).split(':').pop()),
        recipe: []
    }

    const recipes = await page.$$('.ak-crafts .ak-content-list .ak-container .ak-list-element')
    for (const recipe of recipes)
    {
        const itemStack =
        {
            resourceName: await Scrapper.getTextContent(page, await recipe.$('.ak-content .ak-linker')),
            quantity: Number.parseInt(await Scrapper.getInnerHtml(page, await recipe.$('.ak-front')))
        }
        item.recipe.push(itemStack)
    }

    return item
}

module.exports = { downloadJobs }