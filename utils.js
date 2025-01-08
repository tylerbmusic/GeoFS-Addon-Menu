export const log = console.log.bind(
	console,
	"%c[GeoFS Addons]",
	"color: lightblue; font-weight: bold;"
);

export const err = console.error.bind(
	console,
	"%c[GeoFS Addons]",
	"color: red; font-weight: bold;"
);

/**
 * Injects a script into the page.
 * @param {string} path - The absoulte path in this codebase to the script.
 */
export async function injectScript(path) {
	const scriptUrl = chrome.runtime.getURL(path);

	// Create a new script element and set the src attribute to the script URL
	const script = document.createElement("script");
	script.src = scriptUrl;

	// Append the script element to the document body
	document.body.appendChild(script);
}

/**
 * Initializes an addon by injecting its script into the page.
 * @param {Addon[]} addons - The addon to initialize.
 */

export async function createDefaultSettings(addons) {
	const settings = {};
	for (const addon of addons) {
		settings[addon.name] = {
			enabled: false,
		};
	}

	await chrome.storage.local.set({ settings });
	log("Default settings created");
	return settings;
}

/**
 * Initializes an addon by injecting its script into the page.
 * @param {Addon} addon - The addon to initialize.
 */
export async function initAddon(addon) {
	log(`Injecting addon: ${addon.name}`);
	const scriptPath = `addons/${addon.script}`;
	await injectScript(scriptPath);
}
