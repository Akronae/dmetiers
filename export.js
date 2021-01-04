const fs = require('fs')
const urljoin = require('url-join')

async function generateCSV (jobId, fromLevel, toLevel)
{
    const info = JSON.parse(fs.readFileSync(urljoin('./downloads/jobs', jobId.toString(), 'pages/saved.json')))
    const targetCrafs = info.crafts.filter(c => c.level <= toLevel && c.level >= fromLevel)
    var res = {}

    for (const craft of targetCrafs)
    {
        for (const ingredient of craft.recipe)
        {
            res[ingredient.resourceName] = (res[ingredient.resourceName] || 0) + ingredient.quantity
        }
    }

    console.log(res)
}

module.exports = { generateCSV }