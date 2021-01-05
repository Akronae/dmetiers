const input = document.createElement('input')
input.type = 'file'
document.body.appendChild(input)

const fromLevel = document.createElement('input')
fromLevel.placeholder = 'from level'
document.body.appendChild(fromLevel)
const toLevel = document.createElement('input')
toLevel.placeholder = 'to level'
document.body.appendChild(toLevel)

async function readFile (file)
{
    return new Promise(resolve =>
    {
        const reader = new FileReader()
        reader.onload = event => resolve(event.target.result)
        reader.readAsText(file)
    })
}

input.onchange = async function ()
{
    const content = JSON.parse(await readFile(input.files[0]))

    const targetCrafs = content.crafts.filter(c => c.level <= (toLevel.value || 200) && c.level >= (fromLevel.value || 0))
    var res = {}

    for (const craft of targetCrafs)
    {
        for (const ingredient of craft.recipe)
        {
            res[ingredient.resourceName] = (res[ingredient.resourceName] || 0) + ingredient.quantity
        }
    }

    const msg = document.createElement('h2')
    msg.innerText = targetCrafs.length + ' recettes trouvées. Cliquer pour commencer'
    document.body.appendChild(msg)

    var index = 0
    var refreshContainer
    
    document.addEventListener('click', () =>
    {
        if (refreshContainer) document.body.removeChild(refreshContainer)
        refreshContainer = document.createElement('div')
        document.body.appendChild(refreshContainer)

        var itemName = Object.keys(res)[index]
        var quantity = res[itemName]
        const title = document.createElement('h1')
        title.innerText = itemName
        title.style.fontSize = '70px'
        title.style.fontFamily = 'Helvetica'
        const quantElem = document.createElement('div')
        quantElem.innerText = ' x' + quantity
        quantElem.style.fontSize = '120px'
        title.appendChild(quantElem)
        refreshContainer.appendChild(title)
        navigator.clipboard.writeText(itemName)
        
        const usedInRecipes = document.createElement('div')
        usedInRecipes.innerText = 'Utilisé pour : ' + targetCrafs.filter(c => c.recipe.some(i => i.resourceName == itemName)).map(c => c.name + ` (${c.recipe.find(i => i.resourceName == itemName).quantity})`).join(', ')
        refreshContainer.appendChild(usedInRecipes)

        const progress = document.createElement('div')
        progress.style.marginTop = '10px'
        progress.innerText = `Progression : ${index + 1}/${Object.keys(res).length}`
        refreshContainer.appendChild(progress)

        index += 1
    })
}