const scrape = require('website-scraper')

const options =
{
    urls: ['https://www.dofus.com/fr/mmorpg/encyclopedie/metiers/13-sculpteur'],
    directory: './i',
    sources: [],
    request:
    {
        headers:
        {
            'Cookie': '__cf_bm=d9ApmX3PpYfhDdhimyinowcx25m8vwnTLvpzE80H7Ag=; __cfduid=ddb9dc4b93546bf9bbb40658f1c26e1131608898900;'
        }
    }
}

const result = scrape(options);
