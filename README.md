# GeoFS Addon Menu and Manager

An all-in-one repository for the GeoFS addon menu, GeoFS addon manager and related scripts.

# Addon Menu Docs

> The `addonMenu.js` script is injected into the page and provides an API for creating a settings menu for addons.

## Initial Setup

Paste the code below into your script(s) or use the entire extension

(see: [loading an unpacked extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked))

```javascript
if (!window.AddonMenu) {
    fetch(
        "https://raw.githubusercontent.com/tylerbmusic/GeoFS-Addon-Menu/refs/heads/main/addonMenu.js"
    )
        .then((response) => response.text())
        .then((script) => {
        eval(script);
    })
}
window.executeOnEventDone("addonMenuInitialized", afterAMenu);

function afterAMenu() {
	// Setup goes here
}
```

Remove `// Setup goes here`, and in that line, create a variable and initialize it to a `new AddonMenuItem("Your addon name")`.
For example, `const twLM = new window.AddonMenuItem("Taxiway Lights");` is what I used for my Taxiway Lights addon.

## Functions/Methods

To add settings, you can call a few methods.  
_Note: The defaultValue can be a boolean, string, or really anything that can be stringified. Don't use undefined or null though. For checkboxes it must be a boolean._  
_Also Note: A title header, an Enabled checkbox, and a reset button are automatically created, so it is not necessary to create them manually._

- `addItem(description, lsName, type, level, defaultValue)`: Adds an item to the menu. Options:
  - description: String, a very short description;
  - lsName: String, the name used for localStorage retrieval/storage (also the id name), will be automatically prefixed by the prefix, the first letter should be capitalized;
  - type: any of the standard HTML input types;
  - level: Integer, the indentation of the item, where 0 is no indentation;
  - defaultValue: Self explanatory, the value if the item was not set or was reset.
  - options: Optional String, additional HTML attributes to add to the element.
- `addKBShortcut(description, lsName, level, defaultValue, fn)`: Adds a keyboard shortcut to the menu (this method is similar to the addItem method, but adds a keydown listener and function). Shortcut values can either be keys (like 'a', '-', or '$') or codes (like keyA or Minus), but multiple-key shortcuts are not supported. Options:
  - description: Same as `addItem`
  - lsName: Same as `addItem`
  - level: Same as `addItem`
  - defaultValue: Same as `addItem`
  - fn: A function to be run when the key is pressed down
- `addButton(title, fn)`: Adds a button to the menu. Options:
  - title: String, the button's title;
  - fn: A function to be run when the button is clicked.
- `addHeader(level, text)`: Adds a header of the specified level (from 1 to 6, but it is recommended to start at 2 as h1 is used for the addon titles)

## Getting values

To get non-checkbox values, use `localStorage.getItem('prefixlsName')` (for example, if I had created a text input with the lsName `Test` and I had constructed the menu with the prefix `ex`, I could get its value by calling `localStorage.getItem('exTest')`.)  
Since all localStorage values are strings, checkbox items' localStorage values will either be "true" or "false", so to get them, use `(localStorage.getItem('prefixlsName') == 'true')`
