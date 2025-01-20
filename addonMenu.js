// ==UserScript==
// @name         GeoFS Addon Menu
// @version      0.2.1
// @description  A customizable addon for addons to add a universal menu for all addons to share
// @author       GGamerGGuy
// @match        https://geo-fs.com/geofs.php*
// @match        https://*.geo-fs.com/geofs.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    if (!window.gmenu) {
        window.gmenu = {};
    }
    window.gmenu.isGMenuInit = false; //This will be set to true when the first GMenu is added
    window.gmenu.isOpen = false; //Whether or not the menu is open
    window.gmenu.allHTML = []; //All HTML blocks
    window.gmenu.allLS = []; //All localStorage values (it's a 2d array: [lsValue_str, isCheckbox_bool])
})();
//Function to open/close the menu
window.gmenu.toggleMenu = function() {
    if (window.gmenu.isOpen) {
        window.gmenu.isOpen = false;
        window.gmenu.menuDiv.style.display = "none";
    } else {
        window.gmenu.isOpen = true;
        window.gmenu.menuDiv.style.display = "block";
        for (let i = 0; i < window.gmenu.allLS.length; i++) {
            let currLS = window.gmenu.allLS[i];
            currLS[1] ? document.getElementById(currLS[0]).checked = (localStorage.getItem(currLS[0]) == 'true') : document.getElementById(currLS[0]).value = localStorage.getItem(currLS[0]);
        }
    }
}

window.gmenu.compileAllHTML = function() {
    window.gmenu.menuDiv.innerHTML = ``; //Clear the HTML to refresh it
    for (let i = 0; i < window.gmenu.allHTML.length; i++) {
        let h = window.gmenu.allHTML[i]; //Current block of HTML
        window.gmenu.menuDiv.innerHTML += `<div>`; //Inner div
        window.gmenu.menuDiv.innerHTML += h;
        window.gmenu.menuDiv.innerHTML += `<div style="background: darkgray; height: 2px; margin: 10px;"></div></div>`; //Horizontal rule and div end (I would use the <hr> element but I think this is a little nicer and more visible)
    }
}

window.GMenu = class { //The 'G' stands for either GeoFS or GGamerGGuy, depending on how big you think my ego is. I put the class in the window scope for easy access.
    //Calling the constructor should automatically create the menu button. Options: name: A string, the name of your addon; prefix: A string, a short unique identifier for your addon which will be used for localStorage
    constructor(name, prefix) {
        this.defaults = [];
        this.name = name;
        this.prefix = prefix;
        if (!window.gmenu.isGMenuInit) {
            this.initialize();
        }
        this.html = ``; //This HTML will be enclosed in a Div; Instead of adding to the main HTML directly, methods add to this HTML.
        this.htmlIndex = window.gmenu.allHTML.length; //This instance's index in the allHTML array
    }
    #waitForElm(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });

            // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    //Called automatically, initializes the button, menu div, and a couple of other things
    initialize() {
        window.gmenu.isGMenuInit = true; //Prevent other instances from initializing this window
        var bottomDiv = document.getElementsByClassName('geofs-ui-bottom')[0];
        window.gmenu.btn = document.createElement('div');
        window.gmenu.btn.id = "gamenu";
        window.gmenu.btn.classList = "mdl-button mdl-js-button geofs-f-standard-ui";
        window.gmenu.btn.style.padding = "0px";
        bottomDiv.appendChild(window.gmenu.btn);
        window.gmenu.btn.innerHTML = `<img src="https://raw.githubusercontent.com/tylerbmusic/GPWS-files_geofs/refs/heads/main/s_icon.png" style="width: 30px">`;
        document.getElementById("gamenu").onclick = () => {window.gmenu.toggleMenu();};
        if (!window.gmenu.menuDiv) {
            window.gmenu.menuDiv = document.createElement('div');
            window.gmenu.menuDiv.id = "ggamergguyDiv";
            window.gmenu.menuDiv.classList = "geofs-list geofs-toggle-panel geofs-preference-list geofs-preferences";
            window.gmenu.menuDiv.style.zIndex = "100";
            window.gmenu.menuDiv.style.position = "fixed";
            window.gmenu.menuDiv.style.width = "40%";
            document.body.appendChild(window.gmenu.menuDiv);
        }
    }

    updateHTML() {
        if (!window.gmenu.isOpen) {
            window.gmenu.allHTML[this.htmlIndex] = `
            <h1>${this.name}</h1>
            <span>Enabled: </span>
            <input id="${this.prefix}Enabled" type="checkbox" checked="${localStorage.getItem(this.prefix + "Enabled") == "true"}" onchange="localStorage.setItem('${this.prefix}Enabled', this.checked)" style="width: 30px; height: 30px;"><br>
            ${this.html}
            <button id="${this.prefix}Reset">RESET</button>
            `;
            window.gmenu.compileAllHTML();
            if (localStorage.getItem(this.prefix + "Enabled") == null) {
                localStorage.setItem(this.prefix + "Enabled", "true");
            }
            this.#waitForElm(`#${this.prefix}Reset`).then((elm) => {
                console.log('Menu stuff added');
                document.getElementById(this.prefix + "Enabled").checked = (localStorage.getItem(this.prefix + "Enabled") == "true");
                //Automatically include a RESET button to reset all values
                document.getElementById(this.prefix + "Reset").onclick = function() {
                    console.log(this.prefix + " reset"); //debugging
                    for (let i = 0; i < this.defaults.length; i++) {
                        let currD = this.defaults[i]; //currD[0] = idName, currD[1] = defaultValue, currD[2] = isCheckbox
                        localStorage.setItem(currD[0], currD[1]);
                        if (currD[2]) { //if it's a checkbox
                            document.getElementById(currD[0]).checked = currD[1];
                        } else {
                            document.getElementById(currD[0]).value = currD[1];
                        }
                    }
                    window.gmenu.toggleMenu();
                    window.gmenu.toggleMenu(); //Reload the menu
                }; //End onclick function
                console.log(document.getElementById(this.prefix + "Reset").onclick); //debugging
            });
            return true;
        }
        return false;
    } //End updateHTML()

    //Note: The defaultValue should always be a string, and ALL LOCALSTORAGE VALUES ARE STRINGS. This means that checkbox values, for instance, will be either "true" or "false".
    //Adds an item to the menu. Options: description: String, a very short description;  lsName: String, the name used for localStorage retrieval/storage (also the id name), will be automatically prefixed by the prefix;  type: any of the standard HTML input types;  level: Integer, the indentation of the item, where 0 is no indentation;  defaultValue: Self explanatory, the value if the item was not set or was reset
    addItem(description, lsName, type, level, defaultValue, options) {
        let idName = this.prefix + lsName;
        this.defaults.push([idName, defaultValue, (type == "checkbox")]); //Checkboxes are... "special." (elem.value doesn't work on them, they require elem.checked)
        if (localStorage.getItem(idName) == null) {
            localStorage.setItem(idName, defaultValue);
        }
        window.gmenu.allLS.push([idName, (type == "checkbox")]);
        if (type !== "checkbox") {
            this.html += (options == undefined) ? `
            <span style="
                text-indent: ${level}rem
            ">${description}</span>
            <input id="${idName}" type="${type}" onchange="localStorage.setItem('${idName}', this.value)"><br>
            ` : `
            <span style="
                text-indent: ${level}rem
            ">${description}</span>
            <input id="${idName}" type="${type}" onchange="localStorage.setItem('${idName}', this.value)" ${options}><br>
            `;
        } else { //if (type == "checkbox")
            this.html += `
            <span style="
                text-indent: ${level}rem
            ">${description}</span>
            <input id="${idName}" type="${type}" onchange="localStorage.setItem('${idName}', this.checked)" style="
                width: 30px;
                height: 30px;
            "><br>
            `;
        }
        this.updateHTML();
    }

    //Adds a keyboard shortcut to the menu (this method is similar to the addItem method, but adds a keydown listener and function).
    addKBShortcut(description, lsName, level, defaultValue, fn) {
        let idName = this.prefix + lsName;
        this.defaults.push([idName, defaultValue, false]);
        if (localStorage.getItem(idName) == null) {
            console.log(idName + " is null, setting to " + defaultValue);
            localStorage.setItem(idName, defaultValue);
        }
        window.gmenu.allLS.push([idName, false]);
        this.html += `<span style="text-indent: ${level}rem">${description}</span>
        <input id="${idName}" type="text" onchange="localStorage.setItem('${idName}', this.value)"><br>`;
        this.updateHTML();
        function t(event) { //I used 't' for the function name for no particular reason
            if (event.key == localStorage.getItem(idName) || event.code == localStorage.getItem(idName)) { //The user can either type in the key or the code
                console.log(event.key + " pressed");
                fn();
            }
        };
        document.addEventListener("keydown", t);
    }

    //Adds a button to the menu. Options: title: String, the button's title; fn: A function to be run when the button is clicked
    addButton(title, fn, options) {
        this.html += `<button id="${this.prefix}${title}" ${options || ""}>${title}</button>`;
        this.updateHTML();
        document.getElementById(this.prefix + title).onclick = fn;
    }

    //Adds a header of the specified level (from 1 to 6, but it is recommended to start at 2 as h1 is used for the addon titles)
    addHeader(level, text) {
        this.html += `<h${level}>${text}</h${level}>`;
        this.updateHTML();
    }
}
