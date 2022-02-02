// okay there ends some nerd stuff and now there's my code (and my), at least at some point
import { App } from './mainClass.js';
import { item_id_to_name } from './items.js';
import { showModalError, showModalSuccess, swap, removeEveryNotFirstChildOfElement, insertInfoAfterElement, createCrafsToSend } from './functions.js';

// Load some stuff and start searching for recipes
var app = new App();

// When page is loaded show all items
window.onload = generateAllItems;

// Adding some events to things
$("#search").on("keyup", flush_ui);
$("#send").on('click', send).hide();
$("#pause").on('click', pauseWorker);
$('#resume').on('click', resumeWorker).hide();

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
 * Generates all items on page
 */
function generateAllItems() {
    let divbox = document.getElementById('output');

    Object.keys(item_id_to_name).forEach(function(key) {
        let itemDiv = document.createElement('div');
        itemDiv.id = key;
        itemDiv.className = 'item';
        
        let header = document.createElement('h1');
        header.setAttribute('data-recipeIndex', 0);
    
        let name = document.createElement('span');
        name.textContent = key.toString()+'. '+item_id_to_name[key]
    
        let showButton = document.createElement('button');
        showButton.className = 'clickable';
        showButton.textContent = '(Show recipes)'
        showButton.addEventListener('click', showRecipes);
    
        header.appendChild(name);
        header.appendChild(showButton);
        itemDiv.appendChild(header);
    
        divbox.appendChild(itemDiv);
    });
}

/**
 * Filters items on page by value in searchbar
 */
function flush_ui(){
	let srchbar = document.getElementById('search').value;
    Object.keys(item_id_to_name).forEach(function(key) {
        if (item_id_to_name[key].toLocaleLowerCase().includes(srchbar.toLocaleLowerCase()) || key.toString().toLocaleLowerCase().includes(srchbar.toLocaleLowerCase())) {
            document.getElementById(key).style.display = 'block';
        } else {
            document.getElementById(key).style.display = 'none';
        }
    });
}

/**
 * Sends found recipes to the database
 */
function send() {
    let craftsToSend = createCrafsToSend(app.crafts, 10);

    fetch('https://tcain.heyn.live/db', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"seed": app.seed, "auth_id": app.auth_id, "arr": JSON.stringify(craftsToSend)})
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
    let itemId = event.path[2].id;
    let oldRecipeIndex = parseInt(header.getAttribute('data-recipeIndex'));
    let numberOfItemsPerPage = 10;

    if(refreshMode == 'show') {
        removeEveryNotFirstChildOfElement(header);
        addNavigateButtons(header);
    }

    if(app.unexisting.includes(parseInt(itemId))) {
        insertInfoAfterElement('This item has no recipes', header);
    } else if (app.crafts[itemId].length == 0) {
        insertInfoAfterElement('No recipes found', header);
    } else {
        let newRecipeIndex = oldRecipeIndex;
        if(refreshMode == 'previous') {
            newRecipeIndex = oldRecipeIndex - numberOfItemsPerPage;
        } else if(refreshMode == 'next') {
            newRecipeIndex = oldRecipeIndex + numberOfItemsPerPage;
        }
        header.setAttribute('data-recipeIndex', newRecipeIndex);

        for (let _=newRecipeIndex+numberOfItemsPerPage-1; _>=newRecipeIndex; _--) {
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

function hideRecipes(event) {
    removeEveryNotFirstChildOfElement(event.path[2]);
    removeEveryNotFirstChildOfElement(event.path[1]);

    let header = event.path[1];
    let show = document.createElement('button');
    show.className = 'clickable';
    show.addEventListener('click', showRecipes);
    show.textContent = '(Show Recipes)';
    header.appendChild(show);
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

/**
 * adds navigate buttons to element
 * @param {HTMLElement} element parent element
 */
function addNavigateButtons(element) {
    let close = document.createElement('button');
    close.className = 'clickable';
    close.addEventListener('click', hideRecipes);
    close.innerHTML = '(Close)';
    element.appendChild(close);

    element.appendChild(document.createElement('br'));

    let previous = document.createElement('button');
    previous.className = 'clickable';
    previous.addEventListener('click', previousRecipes);
    previous.innerHTML = '<- Previous Page';
    element.appendChild(previous);

    let refresh = document.createElement('button');
    refresh.className = 'clickable';
    refresh.addEventListener('click', refreshRecipes);
    refresh.innerHTML = '(Refresh)';
    element.appendChild(refresh);
    
    let next = document.createElement('button');
    next.className = 'clickable';
    next.addEventListener('click', nextRecipes);
    next.innerHTML = 'Next Page ->';
    element.appendChild(next);
}

//TODO:
// - enable all items, but that's kinda pointless
// - make better algorithm for finding recipes
// - add search remove a recipe button