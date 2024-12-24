# GeoFS Addons

An all-in-one repository for the GeoFS addon manager and related scripts.
Curently, the addon manager is in development and is not yet available for public use.

### `addons.json` example:

```json
	{
		"name": "Slew Mode",
		"description": "Slew mode from FSX",
		"version": "1.0",
		"author": "tylerbmusic",
		"script": "slewmode.js"
	},
```

### `addons.json` schema:

```json
	{
		"name": "name of the addon (MUST BE UNIQUE)",
		"description": "basic description of the addon",
		"version": "version number for debugging",
		"author": "creator of the addon (github username)",
		"script": "slewmode.js // the *.js script that will be loaded into the page"
	},
```
