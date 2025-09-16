// ==UserScript==
// @name         GeoFS Addon Menu
// @version      0.4.2
// @description  A customizable addon for addons to add a universal menu for all addons to share
// @author       GGamerGGuy & Chiroyce
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
    window.gmenu.allHTML = {}; //All HTML blocks
    window.gmenu.allLS = []; //All localStorage values (it's a 2d array: [lsValue_str, isCheckbox_bool])
    var styleEl = document.createElement('style');
    styleEl.innerHTML = `
        .gmenu-cb {
            width: 1rem;
            height: 1rem;
        }
        .gmenu-hr {
            background: darkgray;
            height: 2px;
            margin: 10px;
        }
        .gmenu-reset {
            background: rgb(195 147 2);
            font-weight: 600;
            color: white;
            box-shadow: 0 0 10px 0 black;
            border: 1px solid gray;
            border-radius: 5px;
            padding: 5px 10px;
            cursor: pointer;
            transition: 0.3s;
        }
        .gmenu-reset:hover {
            background: rgb(198 163 58);
            box-shadow: 0 0 10px 0 #696969;
        }
        .gmenu-reset:active {
            transition: 0s;
            background: white;
            color: rgb(195 147 2);
            box-shadow: 0 0 8px 2 black;
        }
        .gmenu-sc {
            background: #2b3745ff;
            color: white;
            border: 1px solid gray;
            border-radius: 0.75rem;
            min-width: 3rem;
            font-size: 1rem;
            font-family: monospace;
            box-shadow: 0 0 0px 0 #385371aa;
            transition: 0.5s;
        }
        .gmenu-sc:hover {
            background: #2b3745aa;
            box-shadow: 0 0 10px 0 #385371aa;
        }
        .gmenu-edit {
            background: #385371ff;
            color: #ddd;
        }
    `;
    document.head.appendChild(styleEl);
})();
window.gmenu.waitForElm = function(selector) {
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
};
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
};

window.gmenu.compileAllHTML = function() {
    let keys = Object.keys(window.gmenu.allHTML).sort();
    window.gmenu.menuDiv.innerHTML = ``; //Clear the HTML to refresh it
    for (let i of keys) {
        let h = window.gmenu.allHTML[i]; //Current block of HTML
        window.gmenu.menuDiv.innerHTML += `<div>`; //Inner div
        window.gmenu.menuDiv.innerHTML += h;
        window.gmenu.menuDiv.innerHTML += `<div class="gmenu-hr"></div></div>`; //Horizontal rule and div end (I would use the <hr> element but I think this is a little nicer and more visible)
    }
};

window.gmenu.changeShortcut = function(id) {
    console.log(id);
    let btn = document.getElementById(id);
    if (btn.innerHTML !== 'Press any key...') {
        btn.innerHTML = 'Press any key...';
        btn.classList.add("gmenu-edit");
        function listen(e) {
            let ovrrd = [e.code.toLowerCase().includes("control"), e.code.toLowerCase().includes("shift"), e.code.toLowerCase().includes("alt"), e.code.toLowerCase().includes("meta")];
            localStorage.setItem(id, `${e.code}&,${ovrrd[0] ? "true" : e.ctrlKey.toString()}&,${ovrrd[1] ? "true" : e.shiftKey.toString()}&,${ovrrd[2] ? "true" : e.altKey.toString()}&,${ovrrd[3] ? "true" : e.metaKey.toString()}`);
            btn.classList.remove("gmenu-edit");
            btn.innerHTML = `${(e.ctrlKey && !ovrrd[0]) ? "Ctrl+" : ""}${(e.shiftKey && !ovrrd[1]) ? "Shift+" : ""}${(e.altKey && !ovrrd[2]) ? "Alt+" : ""}${(e.metaKey && !ovrrd[3]) ? "Meta+" : ""}${e.code}`;
            btn.removeEventListener('keyup', listen);
        }
        btn.addEventListener('keyup', listen);
    }
};

window.GMenu = class { //The 'G' stands for GeoFS. I put the class in the window scope for easy access.
    //Calling the constructor should automatically create the menu button. Options: name: A string, the name of your addon; prefix: A string, a short unique identifier for your addon which will be used for localStorage
    constructor(name, prefix) {
        this.defaults = [];
        this.name = name;
        this.prefix = prefix;
        if (!window.gmenu.isGMenuInit) {
            this.initialize();
        }
        this.html = ``; //This HTML will be enclosed in a Div; Instead of adding to the main HTML directly, methods add to this HTML.
        //this.htmlIndex = window.gmenu.allHTML.length; //This instance's index in the allHTML array
    }

    //Called automatically, initializes the button, menu div, and a couple of other things
    initialize() {
        window.gmenu.isGMenuInit = true; //Prevent other instances from initializing this window
        var bottomDiv = document.getElementsByClassName('geofs-ui-bottom')[0];
        window.gmenu.btn = document.createElement('div');
        window.gmenu.btn.id = "gamenu";
        window.gmenu.btn.classList = "mdl-button mdl-js-button geofs-f-standard-ui";
        //window.gmenu.btn.style.padding = "0px";
        bottomDiv.appendChild(window.gmenu.btn);
        window.gmenu.btn.innerHTML = `Addon Settings <img src="https://raw.githubusercontent.com/tylerbmusic/GPWS-files_geofs/refs/heads/main/s_icon.png" style="width: 30px" title="GMenu Settings">`;
        document.getElementById("gamenu").onclick = () => {window.gmenu.toggleMenu();};
        if (!window.gmenu.menuDiv) {
            window.gmenu.menuDiv = document.createElement('div');
            window.gmenu.menuDiv.id = "ggamergguyDiv";
            window.gmenu.menuDiv.classList = "geofs-list geofs-toggle-panel geofs-preference-list geofs-preferences";
            window.gmenu.menuDiv.style.zIndex = "100";
            window.gmenu.menuDiv.style.position = "fixed";
            window.gmenu.menuDiv.style.width = "40%";
            window.gmenu.menuDiv.style.paddingLeft = "1rem";
            window.gmenu.menuDiv.style.backdropFilter = "blur(25px)";
            window.gmenu.menuDiv.style.boxShadow = "0 0 40px 1px black";
            window.gmenu.menuDiv.style.display = "none";
            document.body.appendChild(window.gmenu.menuDiv);
        }
    }

    updateHTML() {
        if (!window.gmenu.isOpen) {
            window.gmenu.allHTML[this.name] = `
            <h1>${this.name}</h1>
            <span>Enabled: </span>
            <input id="${this.prefix}Enabled" type="checkbox" checked="${localStorage.getItem(this.prefix + "Enabled") == "true"}" onchange="localStorage.setItem('${this.prefix}Enabled', this.checked)" class="gmenu-cb"><br>
            ${this.html}
            <button id="${this.prefix}Reset" class="gmenu-reset">RESET</button>
            `;
            window.gmenu.compileAllHTML();
            if (localStorage.getItem(this.prefix + "Enabled") == null) {
                localStorage.setItem(this.prefix + "Enabled", "true");
            }
            window.gmenu.waitForElm(`#${this.prefix}Reset`).then(window.gmenu.waitForElm(`#${this.prefix}Enabled`)).then((elm) => {
                setTimeout(() => {
                    //console.log('Menu stuff added');
                    document.getElementById(this.prefix + "Enabled").checked = (localStorage.getItem(this.prefix + "Enabled") == "true");
                    //Automatically include a RESET button to reset all values
                    //console.log(document.getElementById(this.prefix + "Reset"));
                    document.getElementById(this.prefix + "Reset").addEventListener("click", () => {
                        console.log(this.prefix + " reset"); //debugging
                        console.log(this.defaults);          //More debugging
                        for (let i = 0; i < this.defaults.length; i++) {
                            let currD = this.defaults[i]; //currD[0] = idName, currD[1] = defaultValue, currD[2] = isCheckbox
                            localStorage.setItem(currD[0], currD[1]);
                            if (currD[2]) { //if it's a checkbox or radio
                                document.getElementById(currD[0]).checked = currD[1];
                            } else {
                                document.getElementById(currD[0]).value = currD[1];
                            }
                        }
                        window.gmenu.toggleMenu();
                        window.gmenu.toggleMenu(); //Reload the menu
                    }); //End onclick function
                    //console.log(document.getElementById(this.prefix + "Reset").onclick); //debugging
                }, 500);
            });
            return true;
        }
        return false;
    } //End updateHTML()

    //Note: The defaultValue should always be a string, and ALL LOCALSTORAGE VALUES ARE STRINGS. This means that checkbox values, for instance, will be either "true" or "false".
    //Adds an item to the menu. Options: description: String, a very short description;  lsName: String, the name used for localStorage retrieval/storage (also the id name), will be automatically prefixed by the prefix;  type: any of the standard HTML input types;  level: Integer, the indentation of the item, where 0 is no indentation;  defaultValue: Self explanatory, the value if the item was not set or was reset
    addItem(description, lsName, type = "text", level = 0, defaultValue, options = "") {
        let idName = this.prefix + lsName;
        this.defaults.push([idName, defaultValue, (type == "checkbox" || type == "radio")]); //Checkboxes and radios are... "special." (elem.value doesn't work on them, they require elem.checked)
        if (localStorage.getItem(idName) == null) {
            localStorage.setItem(idName, defaultValue);
        }
        window.gmenu.allLS.push([idName, (type == "checkbox" || type == "radio")]);
        if (type !== "checkbox" && type !== "radio") {
            this.html += `
            <span style="
                padding-left: ${level}rem
            ">${description}</span>
            <input id="${idName}" type="${type}" onchange="localStorage.setItem('${idName}', this.value)" ${options}><br>
            `;
        } else { //if (type == "checkbox" || type == "radio")
            this.html += `
            <span style="
                padding-left: ${level}rem
            ">${description}</span>
            <input id="${idName}" type="${type}" onchange="localStorage.setItem('${idName}', this.checked)"class="gmenu-cb" ${options}><br>
            `;
        }
        this.updateHTML();
    }

    //Adds a keyboard shortcut to the menu (this method is similar to the addItem method, but adds a keydown listener and function).
    addKBShortcut(description, lsName, level = 0, defaultValue, fn) {
        let idName = this.prefix + lsName;
        this.defaults.push([idName, defaultValue, false]);
        if (localStorage.getItem(idName) == null) {
            console.log(idName + " is null, setting to " + defaultValue);
            localStorage.setItem(idName, defaultValue);
        }
        window.gmenu.allLS.push([idName, false]);
        let tester = localStorage.getItem(idName).split('&,');
        let oldSave = (tester.length == 1);
        let e = (oldSave) ? {code: tester[0], ctrlKey: false, shiftKey: false, altKey: false, metaKey: false} : {code: tester[0], ctrlKey: (tester[1] == "true"), shiftKey: (tester[2] == "true"), altKey: (tester[3] == "true"), metaKey: (tester[4] == "true")};
        this.html += `<span style="padding-left: ${level}rem">${description}</span>
        <button id="${this.prefix + lsName}" class="gmenu-sc" onclick="window.gmenu.changeShortcut('${this.prefix + lsName}')">${e.ctrlKey ? "Ctrl+" : ""}${e.shiftKey ? "Shift+" : ""}${e.altKey ? "Alt+" : ""}${e.metaKey ? "Meta+" : ""}${e.code}</button><br>`;
        this.updateHTML();
        function t(event) { //I used 't' for the function name for no particular reason
            let tester = localStorage.getItem(idName).split('&,');
            let oldSave = (tester.length == 1);
            if ((event.key == tester[0] || event.code == tester[0]) && (oldSave || (event.ctrlKey.toString() == tester[1] && event.shiftKey.toString() == tester[2] && event.altKey.toString() == tester[3] && event.metaKey.toString() == tester[4]))) {
                console.log(event.key + " pressed");
                fn();
            }
        };
        document.addEventListener("keydown", t);
    }

    //Adds a button to the menu. Options: title: String, the button's title; fn: A function to be run when the button is clicked
    addButton(title, fn, options = "") {
        this.html += `<button id="${this.prefix}${title}" ${options}>${title}</button><br>`;
        this.updateHTML();
        document.getElementById(this.prefix + title).addEventListener('click', fn);
    }

    //Adds a header of the specified level (from 1 to 6, but it is recommended to start at 2 as h1 is used for the addon titles)
    addHeader(level, text) {
        this.html += `<h${level}>${text}</h${level}>`;
        this.updateHTML();
    }
}
window.fireBasicEvent('GMenuLoaded');
