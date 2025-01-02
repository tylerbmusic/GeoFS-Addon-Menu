import { log, createDefaultSettings } from "./utils.js";

// if the popup is not open, this page is opened in a new tab
if (chrome.extension.getViews({ type: "popup" }).length === 0) {
	document.querySelector("#newTab").remove();
} else {
	// limit the width of the popup to 400px
	document.body.style.width = "400px";
}

document.querySelector("#reset").addEventListener("click", () => {
	if (!confirm("Are you sure you want to disable all addons?")) return;
	chrome.storage.local.clear(() => {
		log("All storage cleared.");
		location.reload();
	});
});

function initToggle(addon, settings) {
	const toggle = document.createElement("input");
	toggle.type = "checkbox";
	toggle.style.scale = "1.5";
	toggle.checked = settings.enabled;

	const bottomText = document.createElement("span");

	const version = document.createElement("code");
	version.textContent = `v${addon.version} • by `;

	const author = document.createElement("a");
	author.href = addon.repository;
	author.textContent = `${addon.author}`;
	author.target = "_blank";

	bottomText.appendChild(version);
	bottomText.appendChild(author);
	const toggleDiv = document.createElement("div");

	toggleDiv.appendChild(bottomText);
	toggleDiv.style.display = "flex";
	toggleDiv.style.alignItems = "center";
	toggleDiv.style.justifyContent = "space-between";
	toggleDiv.style.marginTop = "1em";
	toggleDiv.appendChild(toggle);

	toggle.addEventListener("change", async () => {
		// update the settings when the toggle is changed
		settings.enabled = toggle.checked;
		const currentSettings = (await chrome.storage.local.get()).settings;
		// get all the settings and update the current addon's setting
		currentSettings[addon.name].enabled = toggle.checked;
		log(`${addon.name} ${toggle.checked ? "enabled" : "disabled"}`);
		// update all the settings at once
		// idk if this is the best way to do it, but it works
		await chrome.storage.local.set({ settings: currentSettings });
	});

	toggle.checked = settings.enabled;
	return toggleDiv;
}

function createAddonCard(addon, settings) {
	const div = document.createElement("div");
	const title = document.createElement("h3");
	const desc = document.createElement("p");
	const toggle = initToggle(addon, settings);

	title.textContent = addon.name;
	desc.textContent = addon.description;
	div.appendChild(title);
	div.appendChild(desc);
	div.appendChild(toggle);
	div.classList.add("addon");
	document.querySelector("#addons").appendChild(div);
}

async function main() {
	const addonsResponse = await fetch(chrome.runtime.getURL("addons.json"));
	const addons = await addonsResponse.json();
	const storage = await chrome.storage.local.get();
	let settings;

	if (!Object.keys(storage).length) {
		// if its the first time user is using the extension
		settings = await createDefaultSettings(addons);
	} else {
		settings = storage.settings;
	}

	log(settings);
	for (const addon of addons) {
		if (!settings[addon.name]) {
			// addon updates so set it to disabled by default
			settings[addon.name] = { enabled: false };
			await chrome.storage.local.set({ settings });
		}
		log(
			`${addon.name} ${settings[addon.name].enabled ? "enabled" : "disabled"}`
		);
		createAddonCard(addon, settings[addon.name]);
	}
}

main();
