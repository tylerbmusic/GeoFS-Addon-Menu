// ==UserScript==
// @name         GeoFS Altieter
// @version      1.0
// @description  Altimeter that shows altitude AGL
// @author       Chiroyce1
// @match        https://www.geo-fs.com/geofs.php?v=*
// @match        https://*.geo-fs.com/geofs.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// @grant        none
// ==/UserScript==

function stat(prop) {
	return geofs.aircraft.instance.animationValue[prop];
}

function update() {
	let out = "";
	out += `${(stat("altitude") - stat("groundElevationFeet")).toFixed(2)}ft\n`;
	out += `${stat("verticalSpeed").toFixed(2)} FPM\n`;

	window._altimeter.div.innerText = out;
}

function main() {
	window._altimeter = {
		updater: null,
		div: document.createElement("div"),
	};
	document.querySelector(".geofs-ui-3dview").appendChild(window._altimeter.div);

	let styles = {
		// TODO: Consider changing the styles
		position: "fixed",
		top: "0px",
		left: "0px",
		height: "50px",
		width: "150px",
		marginLeft: "70vw",
		marginTop: "30vh",
		backgroundColor: "black",
		opacity: "70%",
		borderRadius: "5px",
		color: "white",
		fontSize: "1.5em",
		padding: "2em",
	};

	for (const style in styles) {
		window._altimeter.div.style[style] = styles[style];
	}

	window._altimeter_updater = setInterval(update, 100);
}

setTimeout(main, 1000);
