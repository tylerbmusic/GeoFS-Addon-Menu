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
        static #pref = (geofs.preferences.aMenu ||= {});
        static debugging = !1;
        constructor() {
            if (AddonMenu.#instance) return AddonMenu.#instance;
            AddonMenu.#instance = this;
            window.executeOnEventDone("geofsInitialized", this.init.bind(this)); // .bind forces init to use an AddonMenu instance as the "this" keyword instead of whatever is calling .init
        }
        button;
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
            if (geofs.preferences.aMenu[name]) return AddonMenu.debugging && console.error(`geofs.preferences.aMenu.${name} already added`), !0;
            if (geofs.preferencesDefault.aMenu[name]) return console.error(`default preference ${name} conflict`), !1;
            if (type === "checkbox" && typeof defaultVal !== "boolean") return console.error("checkbox default values can only be true or false"), !1;
            return AddonMenu.#pref[name] = geofs.preferencesDefault.aMenu[name] = defaultVal, true;
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
                    , b = AddonMenu.#supportedInputTypes[n];
                b ? b(a, o, n, c) : b !== null && (a.value = c);
            }
            ) // WE love jQuery
        }
        // this function MUST be run at runtime every single time the game starts to ensure the input is added
        // supported input types do NOT persist into localstorage because idk how to safely retrieve callback functions from localStorage without opening eval security holes
        static #supportedInputTypes = {
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
            "keydetect": null // geofs wants to skip the default for this kind of input, even though the game has none of these
        };
        /**
         * @description - adds a supported input type to be read at startup
         * @param {string} e - HTML input type value
         * @param {Function} t - callback function to be executed on init to initialise preference setting
        **/
        addSupportedInputType(e, t) {
            if (!e || !t) return AddonMenu.debugging && console.error("cannot support input type because of invalid type or callback"), !1;
            AddonMenu.#supportedInputTypes[e] = t;
        }
    }
    class AddonMenuItem {
        constructor(name) {
            this.$element = $("<div/>");
            this.name = name;
        }
        addHeader(level, text) {
            if (!level || !text) return console.error('required param(s) missing'), !1;
            return this.$element.append(`<h${level}/>`).text(text), this;
        }
        addButton(fn, text, id, options = "") {
            return $(`<button id="${id}">${text}</button><br>`).click(fn).appendTo(this.$element).attr(options), this;
        }
        /**
         * @description - adds an input to the addon menu. this can be made into a key input for a keyboard shortcut. there's no method for this so just put the onclick in the options param
         * @param {object} options - HTML options object. it's rlly just whatever jQuery's .attr will accept. try not to override style.height and style.width
        **/
        addInput(description, type = "text, level = 0, prefId, defaultValue, options = "") {
            AddonMenu.addPreference(prefId, defaultValue, type);
            const inp = $(`<input type="${type}" data-gespref="${geofs.preferences.aMenu[prefId]}">`);
            inp.attr(options); // shorthands huge conditional for checkboxes
            this.$element.append(`<span style="text-indent: ${level}rem">${description}</span>`, inp, '<br>');
            return this;
        }
        addToMenu(panel = "#addonMenu") {
            return $(panel).append(this.$element), this;
        }
    }
    window.AddonMenu = new AddonMenu();
    window.AddonMenuItem = AddonMenuItem;
})();
