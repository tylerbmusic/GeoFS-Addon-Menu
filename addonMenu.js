// ==UserScript==
// @name         GeoFS Addon Menu
// @version      1.0
// @description  A customizable (and now easily implementable) addon that adds a universal menu for all addons to share
// @author       GGamerGGuy & meatbroc
// @match        https://geo-fs.com/geofs.php*
// @match        https://*.geo-fs.com/geofs.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// @grant        none
// ==/UserScript==
(function() {
    // static methods are meant to be called by AddonMenu adjacent classes, not the user.
    // singleton pattern bcs why not lmao
    class AddonMenu {
        static #instance;
        constructor() {
            if (AddonMenu.#instance) return AddonMenu.#instance;
            AddonMenu.#instance = this;
            this.debugging = !1;
            window.executeOnEventDone("geofsInitialized", this.init());
        }
        init() { // uses jQuery because jQuery is just better
            this.$button = $("<div/>", {class: "mdl-button mdl-js-button geofs-f-standard-ui"})
                .attr({
                    id: "addonMenuButton",
                    "data-toggle-panel": "#addonMenu", // functions as an onclick
                    "data-noblur": true, // prevents the menu from closing when u click smth on it
                })
                .css("padding", "0px")
                .html(`<img src="https://raw.githubusercontent.com/tylerbmusic/GPWS-files_geofs/refs/heads/main/s_icon.png" style="width: 30px">`)
                .appendTo(".geofs-ui-bottom");
            this.$menu = $("<div/>", {class: "geofs-list geofs-toggle-panel geofs-preference-list geofs-preferences"})
                .attr({id: "addonMenu"})
                .css({
                    zIndex: "100",
                    position: "fixed",
                    width: "40%"
                })
                .appendTo(".geofs-ui-left");
            var a = 'aMenu';
            geofs.preferences[a] ||= {}, geofs.preferencesDefault[a] = {};
            this.setPreferenceValues();
            $("<style/>").html(`#addonMenu > checkbox {\nwidth: 30px !important;\nheight: 30px !important;\n}`).appendTo("head"); // css for checkboxes
            $(window).on("unload", geofs.savePreferences); // save all the stuff
            window.fireBasicEvent("addonMenuInitialized");
        }
        static addPreference(name, defaultVal, type) {
            if (geofs.preferences.aMenu[name]) return this.debugging && console.error(`geofs.preferences.aMenu.${name} already added`), !1;
            if (geofs.preferencesDefault.aMenu[name]) return console.error(`default preference ${name} conflict`), !1;
            if (type === "checkbox" && typeof defaultVal !== "boolean") return console.error("checkbox default values can only be true or false"), !1;
            return geofs.preferences.aMenu[name] = geofs.preferencesDefault.aMenu[name] = defaultVal, true;
        }
        setPreferenceValues = function() {
            $(this.$menu).find("[data-gespref]").each( (e, a) => {
                var o = $(a)
                  , n = a.getAttribute("data-type") || a.getAttribute("type");
                "SELECT" == a.nodeName && (n = "select"),
                n = n.toLowerCase();
                for (var r = a.getAttribute("data-gespref").split("."), s = window, e = 0; e < r.length - 1; e++)
                s = s[r[e]];
                var c = s[r[e]]
                    , b = AddonMenu.supportedInputTypes[n];
                b ? b(a, o, n, c) : b !== null && (a.value = c);
            }
            ) // WE love jQuery
        }
        // this function MUST be run at runtime every single time the game starts to ensure the input is added
        // supported input types do NOT persist into localstorage because idk how to safely retrieve callback functions from localStorage without opening eval security holes
        static supportedInputTypes = {
            "slider": (a, o, n, c) => o.slider("value", c),
            "select": (a, o, n, c) => geofs.selectDropdown(a, c),
            "radio-button": function (a, o, n, c) {
                var u = a.getAttribute("data-matchvalue");
                u && u == c && o.addClass("is-checked");
            },
            "checkbox": (a, o, n, c) => a.checked = c,
            "radio": function (a, o, n, c) {
                var d, u = a.getAttribute("data-matchvalue");
                d = u ? u == c : !0 == c,
                o.prop("checked", d),
                d ? o.parent(".mdl-radio, .mdl-switch").addClass("is-checked") : o.parent(".mdl-radio, .mdl-switch").removeClass("is-checked");
            },
            "keydetect": null // geofs wants to skip the default for this kind of input because the key detection inputs use this [data-type] attribute
        };
        /**
         * @description - adds a supported input type to be read at startup
         * @param {string} e - HTML input type value
         * @param {Function} t - callback function to be executed on init to initialise preference setting
        **/
        addSupportedInputType(e, t) {
            if (!e || !t) return this.debugging && console.error("cannot support input type because of invalid type or callback"), !1;
            return AddonMenu.supportedInputTypes[e] === null ? (this.debugging && console.error('input type is intentionally ignored'), !1) : (AddonMenu.supportedInputTypes[e] = t, !0);
        }
        static populateKeyAssignments = function(e) {
            var t = "";
            for (var a in geofs.preferences.aMenu.keys) {
                var o = "keyInput" + geofs.preferences.aMenu.keys[a].keycode;
                t += '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label"><input id="' + o + '" class="geofs-preferences-key-detect mdl-textfield__input" type="text" data-type="keydetect" data-gespref="geofs.preferences.aMenu.keys.' + a + '" keycode="' + geofs.preferences.aMenu.keys[a].keycode + '" value="' + geofs.preferences.aMenu.keys[a].label + '"/><label class="mdl-textfield__label" for="' + o + '">' + a + "</label></div>"
            }
            e.html(t),
            e.on("click focus", ".geofs-preferences-key-detect", t => {
                $(".geofs-preference-key-detecting", e).each( (e, t) => {
                    t.value = t._originalValue,
                    $(t).removeClass("geofs-preference-key-detecting")
                }
                ),
                t.currentTarget._originalValue = t.currentTarget.value,
                t.currentTarget.value = "",
                $(t.currentTarget).addClass("geofs-preference-key-detecting")
            }
            ).on("keyup", ".geofs-preferences-key-detect", e => {
                var t, a = e.currentTarget;
                $(a).hasClass("geofs-preference-key-detecting") && (27 != e.which ? (t = geofs.preferencesKeycodeLookup[e.which] ? geofs.preferencesKeycodeLookup[e.which] : a.value.toUpperCase(),
                a.value = t,
                a.setAttribute("keycode", e.which),
                geofs.setPreferenceFromInput(a)) : a.value = a._originalValue,
                $(a).removeClass("geofs-preference-key-detecting"),
                $(a).blur(),
                e.stopPropagation(),
                e.preventDefault())
            }
            ).on("keydown", ".geofs-preferences-key-detect", e => {
                $(e.currentTarget).hasClass("geofs-preference-key-detecting") && 9 == e.which && (e.stopPropagation(),
                e.preventDefault())
            }
            ).on("blur", ".geofs-preferences-key-detect", e => {
                $(e.currentTarget).hasClass("geofs-preference-key-detecting") && ("" == e.currentTarget.value && (e.currentTarget.value = e.currentTarget._originalValue),
                $(e.currentTarget).removeClass("geofs-preference-key-detecting"),
                e.stopPropagation(),
                e.preventDefault())
            }
            ),
            componentHandler.upgradeDom()
        }
    }
    class AddonMenuItem {
        constructor(name, options = "") {
            this.$element = $("<div/>")
            this.$element.attr(options);
            this.name = name;
        }
        addHeader(text, level, options = "") {
            if (!level || !text) return console.error('required param(s) missing'), !1;
            return this.$element.append(`<h${level}/>`).text(text).attr(options), this;
        }
        addButton(fn, text, id, options = "") {
            return $(`<button id="${id}">${text}</button><br>`).click(fn).appendTo(this.$element).attr(options), this;
        }
        /**
         * @description - adds an input to the addon menu. this can be made into a key input for a keyboard shortcut. there's no method for this so just put the onclick in the options param
         * @param {object} options - HTML options object. it's rlly just whatever jQuery's .attr will accept. try not to override style.height and style.width for checkboxes
        **/
        addInput(description, type = "text", level = 0, prefId, defaultValue, options = "") {
            AddonMenu.addPreference(prefId, defaultValue, type);
            const inp = $(`<input type="${type}" data-gespref="${geofs.preferences.aMenu[prefId]}">`);
            inp.attr(options); // shorthands huge conditional for checkboxes
            this.$element.append(`<span style="text-indent: ${level}rem">${description}</span>`, inp, '<br>');
            return this;
        }
        /**
         * @description - adds a keyboard shortcut input to the addon menu.
         * @param {object} defaultValue - object styled after a geofs.preferencesDefault.keyboard.keys entry, so something like this. { "Toggle Autopilot": { keycode: 65, label: "<A>" }
        **/
        addKeyboardShortcut(prefId, defaultValue, callback) {
            return AddonMenu.addPreference(prefId, defaultValue, "keydetect"), AddonMenu.populateKeyAssignments(this.$element), this;
        }
        addToMenu(panel = "#addonMenu") {
            return $(panel).append(this.$element), this;
        }
    }
    try {
        window.AddonMenu = new AddonMenu();
        window.AddonMenuItem = AddonMenuItem;
    } catch (e) {
        window.addEventListener("geofsInitialized", () => {
            $(document).on("preferenceRead", () => {
                try {
                    window.AddonMenu = new AddonMenu();
                    window.AddonMenuItem = AddonMenuItem;
                    console.log('addonMenu initialized')
                } catch (er) {
                    console.error(er);
                }
            })
        }, { once: true });
    }
})();
