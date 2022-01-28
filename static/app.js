// okay there ends some nerd stuff and now there's my code (and my), at least at some point
import { App } from './mainClass.js';
import { item_id_to_name } from './items.js';
import { showModalError, showModalSuccess, swap, removeEveryNotFirstChildOfElement, insertInfoAfterElement } from './functions.js';

// Load some stuff and start searching for recipes
var app = new App();

// When page is loaded show all items
window.onload = flush_ui(true);

// Adding some events to things
$("#search").on("keyup", function() {
    flush_ui();
});
$("#send").on('click', send).hide();
$("#pause").on('click', pauseWorker);
$('#resume').on('click', resumeWorker).hide();
$('#info').on('click', showInfo);

function showInfo() {
    console.log(app.worker_running);
    console.log(app.current_recipe);
    console.log('this.current_recipe < 5000 = ' + app.current_recipe < 5000)
}

/**
 * Pause searching
 */
function pauseWorker() {
    app.pauseWorker();
    $('#pause').hide();
    $('#resume').show();
}

/**
 * Resume searching
 */
function resumeWorker() {
    app.resumeWorker();
    $('#resume').hide();
    $('#pause').show();
}

/**
 * Outputs items that have ID or name that includes value in searchbar
 * 
 * @param {Boolean} showAll if true, shows all items regardles of what is in searchbar
 */
function flush_ui(showAll = false){
    let divbox = document.getElementById("output")
    let output = ""
	let srchbar = document.getElementById('search').value;
    if(showAll) {
        srchbar = '';
    }
    let swapped = swap(item_id_to_name);
    let foundItems = [];
    Object.keys(swapped).forEach(function(item) {
        if (item.toLocaleLowerCase().includes(srchbar.toLocaleLowerCase()) || swapped[item].toString().toLocaleLowerCase().includes(srchbar.toLocaleLowerCase())) {
            let itemId = swapped[item];
            let itemObj = {
                itemName: item,
                itemId: itemId
            }
            foundItems.push(itemObj);
        }
    });
    
    Object.keys(foundItems).forEach(function(key) {
        output +=
        '<div class="item">' +
            '<h1 id="'+foundItems[key].itemId+'" data-recipeIndex="0"><span>'+foundItems[key].itemId+'. '+foundItems[key].itemName+'</span> <span class="clickable">(Show Recipes)</span></h1>' +
        '</div>';
    })

    divbox.innerHTML = output

    Object.keys(foundItems).forEach(function(key) {
        document.getElementById(foundItems[key].itemId.toString()).children[1].addEventListener('click', showRecipes);
    })
}

/**
 * Sends found recipes to the database
 */
function send() {
    let craftsToSend = {};
    for(let i=1; i<=Object.keys(app.crafts).length; i++) {
        if(!app.crafts[i]) {
            continue;
        }
        
        let usedIndexes = [];
        let maxJ = app.crafts[i].length < 10 ? app.crafts[i].length : 10;
        for(let j=1; j<=maxJ; j++) {
            let rand = Math.round(Math.random() * app.crafts[i].length);
            if(!app.crafts[i][rand]) {
                continue;
            }
            if(usedIndexes.includes(rand)) {
                j--;
            } else {
                if(!craftsToSend[i]) {
                    craftsToSend[i] = [];
                }
                craftsToSend[i].push(app.crafts[i][rand]);
                usedIndexes.push(rand);
            }
        }
    }

    console.log(craftsToSend);
    return;
    fetch('https://tcain.heyn.live/db', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"seed": app.seed, "auth_id": app.auth_id, "arr": JSON.stringify(app.crafts)})
    })
    .then(function() {
        showModalSuccess("Recipes successfully send to server");
        let y = document.getElementById("send")
        y.innerHTML = "<button disabled=\"true\">Send recipes to server</button>"
    })
    .catch(reason => {
        showModalError(reason);
    });
}

/**
 * Outputs all found recipies by id in event target
 * 
 * @param {PointerEvent} event event handler
 * @param {String} refreshMode Avaliable values: 'show', 'refresh', 'next', 'previous'
 */
function getRecipes(event, refreshMode) {
    removeEveryNotFirstChildOfElement(event.path[2]);

    let header = event.path[1];
    let itemId = header.id;
    let oldRecipeIndex = parseInt(header.getAttribute('data-recipeIndex'));

    if(refreshMode == 'show') {
        event.target.innerHTML = '(Refresh)';
        event.target.removeEventListener('click', showRecipes);
        event.target.addEventListener('click', refreshRecipes);
        let previous = document.createElement('span');
        previous.className = 'clickable';
        previous.addEventListener('click', previousRecipes);
        previous.innerHTML = '</br><- Previous Page ';
        event.target.parentNode.insertBefore(previous, event.target.previousSibling);

        let next = document.createElement('span');
        next.className = 'clickable';
        next.addEventListener('click', nextRecipes);
        next.innerHTML = ' Next Page ->';
        event.target.parentNode.insertBefore(next, event.target.nextSibling);
    }

    if(app.unexisting.includes(parseInt(itemId))) {
        insertInfoAfterElement('This item has no recipes', header);
    } else if (app.crafts[itemId].length == 0) {
        insertInfoAfterElement('No recipes found', header);
    } else {
        let newRecipeIndex = oldRecipeIndex;
        if(refreshMode == 'previous') {
            newRecipeIndex = oldRecipeIndex - 15;
        } else if(refreshMode == 'next') {
            newRecipeIndex = oldRecipeIndex + 15;
        }
        header.setAttribute('data-recipeIndex', newRecipeIndex);

        for (let _=newRecipeIndex+15; _>newRecipeIndex; _--) {
            if(app.crafts[itemId][_]) {
                let div = document.createElement('div');
                div.classList.add('recipe');
                for (let i=0; i<8; i++) {
                    let img = document.createElement('img');
                    img.classList.add("bofsym_"+app.crafts[itemId][_][i]);
                    div.appendChild(img);
                }
                header.parentNode.insertBefore(div, header.nextSibling);
            }
        }
    }
}

function showRecipes(event) {
    getRecipes(event, 'show');
}

function refreshRecipes(event) {
    getRecipes(event, 'refresh');
}

function nextRecipes(event) {
    getRecipes(event, 'next');
}

function previousRecipes(event) {
    getRecipes(event, 'previous');
}

/*
function run(tries_limit, no_popup=false) {
    let tries = 0;
    let currentPool = []
    while (true) {
        currentPool = combs1.next().value
        if (added.includes(currentPool)) {
            continue
        }
        //console.log(currentPool);
        let id = get_result(currentPool, str2seed(seed))
        tries += 1
        alltries += 1 
        if (unexisting.includes(id) || crafts[id].length >= 4) {
            added.push(currentPool)
            continue
        }
        if (!crafts[id].includes(currentPool)) {
            if (crafts[id].length >= 4) {
                added.push(currentPool)
                continue
            }
            if (tries_limit != default_tries) {additional +=1}
            found_recipes += 1
            crafts[id].push(currentPool)
        }
        added.push(currentPool)
        if (tries >= tries_limit || done(crafts, 4)) {
            if (done(crafts, 4)) {
                window.alert("Done!")
            }
            else if (tries_limit != default_tries) {
                //if (no_popup){window.alert("Found " + additional + " additional combinations")}
                additional = 0;
            }
            else if (tries >= tries_limit) {
                let x = document.getElementById("morebutton")
                x.innerHTML = "<button onclick=\"run(10000)\">Check more recipes</button>"
            }
            //console.log(crafts)
            setInterval(constant_run, 5);
            first_time = true;
            flush_ui(false)
            break
        }
    }
}
*/
//TODO:
// - enable all items, but that's kinda pointless
// - make better algorithm for finding recipes
// - add search remove a recipe button