// Here are functions that don't need external variables

/**
 * Generates random string
 * @param {Number} len length of string
 */
export function generate_random_string(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < len; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

/**
 * Shows error modal with custom message that disappears after 3s
 * @param {String} msg custom message
 */
export function showModalError(msg) {
    let modal = document.getElementById('modal');
    modal.children[0].children[0].className = 'text-error';
    modal.children[0].children[0].innerHTML = msg;
    modal.style.display = 'block';
    setTimeout(hideModal, 3000);
}

/**
 * Shows success modal with custom message that disappears after 3s
 * @param {String} msg custom message
 */
export function showModalSuccess(msg) {
    let modal = document.getElementById('modal');
    modal.children[0].children[0].className = 'text-success';
    modal.children[0].children[0].innerHTML = msg;
    modal.style.display = 'block';
    setTimeout(hideModal, 3000);
}

/**
 * Runs animation that hides modal
 */
export function hideModal() {
    $('#modal').animate({
        opacity: 0
    }, 1000, function(){
        let modal = document.getElementById('modal');
        modal.style.display = 'none';
        modal.style.opacity = 1;
    });
}

/**
 * Swaps keys with values in array
 * @param {Object} json 
 * @returns {Object}
 */
export function swap(json) {
    var ret = {};
    for(var key in json){
      ret[json[key]] = key;
    }
    return ret;
}

/**
 * Removes all children of the HTML element except first
 * @param {HTMLElement} element parent element
 */
export function removeEveryNotFirstChildOfElement(element) {
    while (element.childElementCount != 1) {
        element.removeChild(element.lastChild);
    }
}

/**
 * Inserts <h3> with info message after HTML element
 * @param {String} msg info message
 * @param {HTMLElement} element HTML element
 */
export function insertInfoAfterElement(msg, element) {
    let info = document.createElement('h3');
    info.innerHTML = msg;
    element.parentNode.insertBefore(info, element.nextSibling);
}

/**
 * Returns object with recipes for each item
 * @param {Object} allCrafts all found crafts
 * @param {Number} maxRecipes max number of recipes per item
 */
export function createCrafsToSend(allCrafts, maxRecipes) {
    let craftsToSend = {};
    for(let i=1; i<=Object.keys(allCrafts).length; i++) {
        if(!allCrafts[i]) {
            continue;
        }
        
        let usedIndexes = [];
        let maxJ = allCrafts[i].length < maxRecipes ? allCrafts[i].length : maxRecipes;
        for(let j=1; j<=maxJ; j++) {
            let rand = Math.round(Math.random() * allCrafts[i].length);
            if(!allCrafts[i][rand]) {
                continue;
            }
            if(usedIndexes.includes(rand)) {
                j--;
            } else {
                if(!craftsToSend[i]) {
                    craftsToSend[i] = [];
                }
                craftsToSend[i].push(allCrafts[i][rand]);
                usedIndexes.push(rand);
            }
        }
    }

    return craftsToSend;
}