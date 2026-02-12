# Addon Menu Docs

> The `addonMenu.js` script is injected into the page and provides an API for creating a settings menu for addons.

## Initial Setup

Paste the code below into your script(s)

```javascript
if (!window.gmenu || !window.GMenu) {
    fetch(
        "https://raw.githubusercontent.com/tylerbmusic/GeoFS-Addon-Menu/refs/heads/main/addonMenu.js"
    )
        .then((response) => response.text())
        .then((script) => {
        eval(script);
    })
        .then(() => {
        setTimeout(afterGMenu, 101);
    });
} else afterGMenu()

function afterGMenu() {
	// Setup goes here
}
```

Replace `// Setup goes here` with a variable and initialized to a `new GMenu("Your addon name", "Short identifier for your addon")`. A good short identifier does not have any spaces, and is ideally less than 5 letters long.  
For example, `const twLM = new window.GMenu("Taxiway Lights", "twL");` is what I used for my Taxiway Lights addon.

## Functions/Methods

As soon as a script calls `new GMenu()`, a title header, an Enabled checkbox, and a reset button are automatically created. To check if your script is enabled, use `window.gmenu.get("short identifier", "Enabled")`.

To add settings, you can call a few methods.  
_Note: The defaultValue should always be a string, and ALL LOCALSTORAGE VALUES ARE STRINGS. This means that checkbox values, for instance, will be either "true" or "false"._  

- `addItem(description, lsName, type, level, defaultValue)`: Adds an input item to the menu. Options:
  - description: String, a very short (<5 words) description
  - lsName: The name used for local storage retrieval/storage (also the id name), will be automatically prefixed by the prefix. It should be in camel case with the first letter capitalized.
  - type: Any of the standared HTML input types, defaults to `text`
  - level: The indentation level of the item, where 0 is no indentation, defaults to 0
  - defaultValue: The value of the setting that will be used upon the user's first time using the addon
  - options: Optional HTML attributes for the input
- `addKBShortcut(description, lsName, level, defaultValue, fn)`: Adds a keyboard shortcut to the menu (this method is similar to the addItem method, but adds a keydown listener and function). Options:
  - description: A very short (<5 words) description
  - lsName: The name used for local storage retrieval/storage (also the id name), will be automatically prefixed by the prefix. It should be in camel case with the first letter capitalized.
  - level: The indentation level of the item, where 0 is no indentation, defaults to 0
  - defaultValue: The default keyboard shortcut, prefferably in the format `"keyCode`&,`ctrlKey`&,`shiftKey`&,`altKey`&,`metaKey"` (e.x., `"KeyK&,false&,true&,false&,false"` for `Shift+K`)
  - fn: The function to be executed when the shortcut is pressed
- `addButton(title, fn)`: Adds a button to the menu. Options:
  - title: String, the button's title;
  - fn: A function to be run when the button is clicked.
- `addHeader(level, text)`: Adds a header of the specified level (from 1 to 6, but it is recommended to start at 2 as h1 is used for the addon titles)
- `addNote`: Adds small gray text to the menu, similar to Markdown's "-#". Use this below (after) a menu item for important information that is not conveyed in the menu item's description.
  - text: The note's text contents
- `addCustom`: Adds custom HTML to the menu.
  - html: The HTML to add

## Getting values

To get a setting, use `window.gmenu.get(id, name)`, where `id` is the addon's short identifier, and `name` is the setting's lsName.

----------

# GeoFS Addon Manager

An all-in-one repository for the GeoFS addon menu, GeoFS addon manager and related scripts.

Curently, the addon manager is in development and is not yet available for public use. The addons that come with the repository dont yet have a usable menu, but can be individually enabled/disabled via the browser extension.

### `addons.json` example:

```json
	{
		"name": "Slew Mode",
		"description": "Slew mode from FSX",
		"version": "1.0",
		"script": "slewmode.js",
		"author": "tylerbmusic",
		"repository": "https://github.com/tylerbmusic/GeoFS-Slew-Mode"

	},
```

### `addons.json` schema:

```json
	{
		"name": "name of the addon (MUST BE UNIQUE)",
		"description": "basic description of the addon",
		"version": "version number for debugging",
		"script": "slewmode.js // the *.js script that will be loaded into the page",
		"author": "creator of the addon (github username)",
		"repository": "link to GitHub repository"
	},
```
