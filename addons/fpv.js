// ==UserScript==
// @name         GeoFS Flight Path Vector
// @version      1.0
// @description  Displays a Flight Path Vector on the screen
// @author       GGamerGGuy
// @match        https://www.geo-fs.com/geofs.php?v=*
// @match        https://*.geo-fs.com/geofs.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// @grant        none
// ==/UserScript==

// Notes
// Pressing 'l' will hide the FPV
// The FPV is calculated based on the camera's position. This means that the FPV shows where the camera would hit the ground if it were to keep going in the same direction, and not the aircraft.
function cF(x, y, z) {
	return { x, y, z };
}
function waitForEntities() {
	try {
		if (geofs.api) {
			// Entities are already defined, no need to wait
			main();
			return;
		}
	} catch (error) {
		// Handle any errors (e.g., log them)
		console.log("Error in waitForEntities:", error);
	}
	// Retry after 1000 milliseconds
	setTimeout(waitForEntities, 1000);
}
window.lastLoc;
window.onload = setTimeout(waitForEntities, 10000);
window.howFar = 15; //                                THIS DETERMINES HOW FAR AWAY THE DOT IS. IT IS A FACTOR, AND THE ACTUAL DISTANCE IS DIRECTLY RELATED TO THE TRUE AIRSPEED.
function main() {
	(function () {
		"use strict";
		window.y = geofs.api.viewer.entities.add({
			position: Cesium.Cartesian3.fromDegrees(
				geofs.camera.lla[1],
				geofs.camera.lla[0],
				geofs.animation.values.groundElevationFeet / 3.2808399
			),
			billboard: {
				image: "https://tylerbmusic.github.io/GPWS-files_geofs/FPV.png",
				scale: 0.03 * (1 / geofs.api.renderingSettings.resolutionScale),
			},
		});
		if (geofs.api.renderingSettings.resolutionScale <= 0.6) {
			window.y.billboard.image =
				"https://tylerbmusic.github.io/GPWS-files_geofs/FPV_Lowres.png";
		}
		window.lastLoc = Cesium.Cartesian3.fromDegrees(
			geofs.camera.lla[1],
			geofs.camera.lla[0],
			geofs.camera.lla[2]
		);
		// Update display
		function updateFlightDataDisplay() {
			// Check if geofs.animation.values is available
			if (geofs.animation.values && !geofs.isPaused()) {
				if (window.currLoc) {
					window.lastLoc = window.currLoc;
				}
				window.currLoc = Cesium.Cartesian3.fromDegrees(
					geofs.camera.lla[1],
					geofs.camera.lla[0],
					geofs.camera.lla[2]
				);
				window.deltaLoc = [
					window.currLoc.x - window.lastLoc.x,
					window.currLoc.y - window.lastLoc.y,
					window.currLoc.z - window.lastLoc.z,
				];
				// Retrieve and format the required values
				var agl =
					geofs.animation.values.altitude !== undefined &&
					geofs.animation.values.groundElevationFeet !== undefined
						? Math.round(
								geofs.animation.values.altitude -
									geofs.animation.values.groundElevationFeet +
									geofs.aircraft.instance.collisionPoints[
										geofs.aircraft.instance.collisionPoints.length - 2
									].worldPosition[2] *
										3.2808399
						  )
						: "N/A";
				var glideslope;
				if (
					geofs.animation.getValue("NAV1Direction") &&
					geofs.animation.getValue("NAV1Distance") !== 600
				) {
					//The second part to the if statement prevents the divide by 0 error.
					glideslope =
						geofs.animation.getValue("NAV1Direction") === "to"
							? (
									Math.atan(
										(agl * 0.3048) /
											(geofs.animation.getValue("NAV1Distance") + 600)
									) * RAD_TO_DEGREES
							  ).toFixed(1)
							: (
									Math.atan(
										(agl * 0.3048) /
											Math.abs(geofs.animation.getValue("NAV1Distance") - 600)
									) * RAD_TO_DEGREES
							  ).toFixed(1); //The center of the aiming point is exactly 600 meters from the start of the runway (in GeoFS).
				} else {
					glideslope = "N/A";
				}
				if (
					!geofs.aircraft.instance.groundContact &&
					!(window.deltaLoc[0] + window.deltaLoc[1] + window.deltaLoc[2] == 0)
				) {
					window.y.position = cF(
						window.currLoc.x + window.howFar * window.deltaLoc[0],
						window.currLoc.y + window.howFar * window.deltaLoc[1],
						window.currLoc.z + window.howFar * window.deltaLoc[2]
					);
				}

				// Display css
				var flightDataElement = document.getElementById("flightDataDisplay0");
				if (!flightDataElement) {
					flightDataElement = document.createElement("div");
					flightDataElement.id = "flightDataDisplay0";
					flightDataElement.style.position = "fixed";
					flightDataElement.style.bottom = "0";
					flightDataElement.style.right = "calc(10px + 48px + 16px)";
					flightDataElement.style.height = "36px";
					flightDataElement.style.minWidth = "64px";
					flightDataElement.style.padding = "0 16px";
					flightDataElement.style.display = "inline-block";
					flightDataElement.style.fontFamily =
						'"Roboto", "Helvetica", "Arial", sans-serif';
					flightDataElement.style.fontSize = "14px";
					flightDataElement.style.textTransform = "uppercase";
					flightDataElement.style.overflow = "hidden";
					flightDataElement.style.willChange = "box-shadow";
					flightDataElement.style.transition =
						"box-shadow .2s cubic-bezier(.4,0,1,1), background-color .2s cubic-bezier(.4,0,.2,1), color .2s cubic-bezier(.4,0,.2,1)";
					flightDataElement.style.textAlign = "center";
					flightDataElement.style.lineHeight = "36px";
					flightDataElement.style.verticalAlign = "middle";
					flightDataElement.style.zIndex = "9999";
					document.body.appendChild(flightDataElement);
				}

				flightDataElement.innerHTML = `
                <span style="background: 0 0; border: none; border-radius: 2px; color: #000; display: inline-block; padding: 0 8px;">Glideslope ${glideslope}</span>
            `;
			}
		}

		// Update flight data display every 100ms
		setInterval(
			updateFlightDataDisplay,
			geofs.debug.fps ? 1 / Number(geofs.debug.fps) + 5 : 100
		); //The +5 gives a buffer and the : 100 is an attempt to prevent a huge lag spike on touchdown that I was encountering.
		document.addEventListener("keydown", function (event) {
			if (event.key === "l") {
				window.y.show = !window.y.show;
			}
		});
	})();
}
