# GeoFS Addon Menu and Manager Documentation

An all-in-one repository for the GeoFS addon menu, GeoFS addon manager and related scripts.
> The `addonMenu.js` script is injected into the page and provides an API for creating a settings menu for addons.

# Initial Setup

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

Remove `// Setup goes here`, and in that line, create a variable and initialise it to a `new AddonMenuItem("Your addon name")`.

For example, 
```js
function afterAMenu() {
	const twLM = new window.AddonMenuItem("Taxiway Lights");
	// ...
}
```
is what I used for my Taxiway Lights addon.

---

# Functions/Methods
*Note: parameters that are bolded are **required** parameters*

---

To add to the addon menu, you must first initialise a window.AddonMenuItem class instance.

### Class: window.AddonMenuItem

*Every method in this class returns its 'this' property, allowing for method chaining like so: `new AddonMenuItem('exampleID').addHeader('example', 1).addToMenu()`*

Description: Wrapper for a section of the addon menu

Constructor Params:
- **id**: Any string. Will become the the id attribute of its $element property.
- options: Any object that will work in jQuery's .attr() function. Will be applied to the $element property of the AddonMenuItem instance.

Example Call:

```js
const myItem = new window.AddonMenuItem("coolItem", {class: "epic-item-styles"});
```
### Methods:
- addHeader
	- Params:
 		- **text**: String. text of the header
   		- **level**: Number or integer coercible string from 1-6. Will determine the <h{level}> element
     	- options: Object compatible with jQuery's .attr. Will be applied to the header.
  	- Example:
  	  ```js
  	  myItem.addHeader("harmoniousHeader", 1, {id: "harpischord_header"});
  	  ```
- addButton
	- Params:
		- fn: Onclick function. Not required, but making a button that does nothing is not recommended.
	  	- text: String. Label of the button.
   		- id: String. Button's id.
     	- options: Object compatible with jQuery's .attr. Will be applied to the button.
  	- Example:
  	  ```js
  	  myItem.addButton(() => alert('I'm the biggest button 🗣️💯🗣️💯'), "Banger Button", "biggestButton"/*, optionsGoesHere*/);
  	  ```
- addInput
	- Params:
		- **prefId**: String (please). Preference identifier that will be used to add a key to geofs.preferences.aMenu and geofs.preferencesDefault.aMenu. Remember what ID you use to add the preference so you can reference it later.
  		- **defaultValue**: Anything except a function. Value the preference will be initialised with if it doesn't exist already.
    	- **description**: String or anything coercible to one. Text of the span above the input.
     	- type: String. Must be a valid type of an HTMLInputElement. Defaults to text.
      	- level: Number or number coercible string. Text-indentation value.
      	- options: Object compatible with jQuery's .attr. Will be applied to the input.
	- Example:
      ```js
      myItem.addInput("perspicuousPreference", "vivaciousValue", "dolorous description", null /* will default to text */, "1", {"data-disestablishmentarianism": "anti"});
      ```
- addKeyboardShortcut
     *work in progress*
- addToMenu
	- Params:
 		- panel: HTML element selector. Defaults to the regular addon menu. Where the AddonMenuItem should be added to.
   	- Note: This function should be run after all the others to avoid excess DOM manipulation.
   	- Example:
   	  ```js
   	  myItem.addInput('foo', 'bar', 'baz').addToMenu(); // run it last
   	  ```
## Getting values

To get values, use geofs.preferences.aMenu. A function may be added for this later to make it more robust.
