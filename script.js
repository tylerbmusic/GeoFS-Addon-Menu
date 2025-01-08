async function main() {
	/**
	 * @typedef {Object} Addon
	 * @property {string} name - The name of the addon.
	 * @property {string} description - A short description of the addon.
	 * @property {string} version - The version of the addon.
	 * @property {string} script - The file name of the addon script (*.js)
	 * @property {string} author - The author of the addon.
	 * @property {string} repository - The repository URL of the addon.
	 */

	const { log, err, initAddon, createDefaultSettings } = await import(
		chrome.runtime.getURL("utils.js")
	);

	/**
	 * Loads the list of addons from the JSON file.
	 * @returns {Promise<Addon[]>} A promise that resolves to an array of addons.
	 */
	async function loadAddonList() {
		// Get the correct URL for addons.json inside the extension
		const addonsJsonUrl = chrome.runtime.getURL("addons.json");
		const response = await fetch(addonsJsonUrl);
		if (!response.ok) {
			err("Failed to load addons.json:", response.statusText);
			return [];
		}
		const addons = await response.json();
		return addons;
	}

	const addons = await loadAddonList();
	log(`Loaded ${addons.length} addons`);
	const storage = await chrome.storage.local.get();
	let settings;

	if (!Object.keys(storage).length) {
		settings = await createDefaultSettings(addons);
	} else {
		settings = storage.settings;
	}

	log(settings);

	addons.forEach(async (addon) => {
		if (settings[addon.name].enabled) {
			initAddon(addon);
		}
	});
}

setTimeout(main, 3000);
