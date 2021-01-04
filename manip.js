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
    var title
    var usedInRecipes
    
    document.addEventListener('click', () =>
    {
        if (title) document.body.removeChild(title)
        if (usedInRecipes) document.body.removeChild(usedInRecipes)
        var itemName = Object.keys(res)[index]

        var quantity = res[itemName]
        title = document.createElement('h1')
        title.innerText = itemName
        title.style.fontSize = '70px'
        title.style.fontFamily = 'Helvetica'
        const quantElem = document.createElement('div')
        quantElem.innerText = ' x' + quantity
        quantElem.style.fontSize = '120px'
        title.appendChild(quantElem)
        document.body.appendChild(title)
        navigator.clipboard.writeText(itemName)
        
        usedInRecipes = document.createElement('div')
        usedInRecipes.innerText = 'Utilisé pour : ' + targetCrafs.filter(c => c.recipe.some(i => i.resourceName == itemName)).map(c => c.name + ` (${c.recipe.find(i => i.resourceName == itemName).quantity})`).join(', ')
        document.body.appendChild(usedInRecipes)
        console.log(targetCrafs)

        index += 1
    })
}