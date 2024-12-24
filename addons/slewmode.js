// ==UserScript==
// @name         GeoFS Slew Mode
// @version      0.5pre1
// @description  Slew mode from FSX
// @author       GGamerGGuy
// @match        https://www.geo-fs.com/geofs.php?v=*
// @match        https://*.geo-fs.com/geofs.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// @grant        none
// ==/UserScript==

(function () {
	"use strict";
	window.addEventListener("load", function (event) {
		setTimeout(() => {
			slewInit();
		}, 1500);
	});
	if (localStorage.getItem("slewEnabled") == null) {
		//Set defaults
		localStorage.setItem("slewEnabled", "true");
		localStorage.setItem("slewLatSpeed", "0.0001");
		localStorage.setItem("slewVertSpeed", "2");
		localStorage.setItem("slewRotAmount", "2");
		localStorage.setItem("slewSpeedMultiplier", "1.96");
		localStorage.setItem("slewSpeedMultiplierFlaps", "2.7");
		localStorage.setItem("toggleSlew", "y");
		localStorage.setItem("slewForward", "i");
		localStorage.setItem("slewBackwards", "k");
		localStorage.setItem("slewLeft", "j");
		localStorage.setItem("slewRight", "l");
		localStorage.setItem("slewUp", "u");
		localStorage.setItem("slewDown", "Enter");
		localStorage.setItem("slewRotTiltUp", "ArrowUp");
		localStorage.setItem("slewRotTiltDown", "ArrowDown");
		localStorage.setItem("slewRotRLeft", "ArrowLeft");
		localStorage.setItem("slewRotRRight", "ArrowRight");
		localStorage.setItem("slewRotYLeft", ",");
		localStorage.setItem("slewRotYRight", ".");
	}

	var isSlewing = false;
	var tilt = 0;
	var roll = 0;
	var speedF = 0; //forward/backward
	var sideways = 0; //left/right
	var speedV = 0; //up/down
	var slewA = 0;
	var slewB = 0;
	var slewAlt = 0;
	var headingRad = 0; //Used to make forward the aircraft's heading, not true north.
	window.lastCam = 0;
	window.lastGravity = [0, 0, 0];
	window.slewDiv = document.createElement("div");
	window.slewDiv.style.width = "fit-content";
	window.slewDiv.style.height = "fit-content";
	window.slewDiv.style.color = "red";
	window.slewDiv.style.position = "fixed";
	window.slewDiv.style.margin = "5px";
	document.body.appendChild(window.slewDiv);

	let lastFrameNumber = window.geofs.frameNumber;

	function checkFrameNumber() {
		if (!isSlewing) return;

		if (window.geofs.frameNumber !== lastFrameNumber) {
			lastFrameNumber = window.geofs.frameNumber;
			updateSlew();
		}
		requestAnimationFrame(checkFrameNumber);
	}

	document.addEventListener("keydown", function (event) {
		let shortcuts = {
			//Change the values in quotes to change keybinds
			enableSlew: localStorage.getItem("toggleSlew"),
			slewForward: localStorage.getItem("slewForward"), //Increase slew forward speed/decrease slew backward speed
			slewLeft: localStorage.getItem("slewLeft"), //Increase slew left speed/decrease slew right speed
			slewBackward: localStorage.getItem("slewBackwards"), //Increase slew backward speed/derease slew forward speed
			slewRight: localStorage.getItem("slewRight"), //Increase slew right speed/decrease slew left speed
			slewUp: localStorage.getItem("slewUp"), //Increase slew up speed/decrease slew down speed
			slewHR: localStorage.getItem("slewRotYRight"), //Heading Right (turns your plane right 2 degrees)
			slewHL: localStorage.getItem("slewRotYLeft"), //Heading Left (turns your plane left 2 degrees)
			rotation: {
				up: localStorage.getItem("slewRotTiltUp"), //Rotate up 2 degrees
				down: localStorage.getItem("slewRotTiltDown"), //Rotate down 2 degrees
				left: localStorage.getItem("slewRotRLeft"), //Rotate left 2 degrees
				right: localStorage.getItem("slewRotRRight"), //Rotate right 2 degrees
			},
			slewDown: localStorage.getItem("slewDown"), //Increase slew down speed/decrease slew up speed
		};
		const isChatFocused =
			document.activeElement === document.getElementById("chatInput");
		if (!isChatFocused && localStorage.getItem("slewEnabled") == "true") {
			if (event.key == shortcuts.enableSlew) {
				isSlewing = !isSlewing;
				if (isSlewing) {
					window.slew();
				} else {
					window.geofs.camera.set(window.lastCam);
					speedF = 0;
					sideways = 0;
					speedV = 0;
					tilt = 0;
					roll = 0;
					window.geofs.aircraft.instance.rigidBody.gravityForce =
						window.lastGravity;
					window.slewDiv.innerHTML = ``;
					if (!window.geofs.animation.values.groundContact) {
						var c = window.geofs.aircraft.instance;
						var m;
						if (window.geofs.animation.values.flapsTarget == 0) {
							m =
								(c.definition.minimumSpeed /
									Number(localStorage.getItem("slewSpeedMultiplier"))) *
								c.definition.mass; // default 1.94
						} else {
							m =
								(c.definition.minimumSpeed /
									Number(localStorage.getItem("slewSpeedMultiplierFlaps"))) *
								c.definition.mass; // default 2.7
						}
						c.rigidBody.applyCentralImpulse(
							window.V3.scale(c.object3d.getWorldFrame()[1], m)
						);
					}
				}
			} else if (event.key == shortcuts.slewForward) {
				speedF += Number(localStorage.getItem("slewLatSpeed")); // 0.0001 by default
			} else if (event.key == shortcuts.slewBackward) {
				speedF -= Number(localStorage.getItem("slewLatSpeed"));
			} else if (event.key == shortcuts.slewRight) {
				sideways += Number(localStorage.getItem("slewLatSpeed"));
			} else if (event.key == shortcuts.slewLeft) {
				sideways -= Number(localStorage.getItem("slewLatSpeed"));
			} else if (event.key == shortcuts.slewUp) {
				speedV += Number(localStorage.getItem("slewVertSpeed"));
			} else if (event.key == shortcuts.slewDown) {
				speedV -= Number(localStorage.getItem("slewVertSpeed"));
			} else if (event.key == shortcuts.slewHR) {
				headingRad +=
					Number(localStorage.getItem("slewRotAmount")) * window.DEGREES_TO_RAD;
			} else if (event.key == shortcuts.slewHL) {
				headingRad -=
					Number(localStorage.getItem("slewRotAmount")) * window.DEGREES_TO_RAD;
			} else if (event.key == shortcuts.rotation.up) {
				tilt +=
					Number(localStorage.getItem("slewRotAmount")) * window.DEGREES_TO_RAD;
			} else if (event.key == shortcuts.rotation.down) {
				tilt -=
					Number(localStorage.getItem("slewRotAmount")) * window.DEGREES_TO_RAD;
			} else if (event.key == shortcuts.rotation.left) {
				roll +=
					Number(localStorage.getItem("slewRotAmount")) * window.DEGREES_TO_RAD;
			} else if (event.key == shortcuts.rotation.right) {
				roll -=
					Number(localStorage.getItem("slewRotAmount")) * window.DEGREES_TO_RAD;
			}
		}
	});

	async function updateSlew() {
		//console.log([slewA, slewB, slewAlt]);
		headingRad = headingRad % (360 * window.DEGREES_TO_RAD);
		window.controls.setMode(window.pControl);
		var deltaX =
			Math.cos(headingRad) * speedF - Math.sin(headingRad) * sideways;
		var deltaY =
			Math.sin(headingRad) * speedF + Math.cos(headingRad) * sideways;
		slewA += deltaX;
		slewB += deltaY;
		slewAlt =
			window.geofs.animation.values.groundContact && speedV < 0
				? slewAlt
				: slewAlt + speedV; //I'm pretty confident this will work (but it's giving me the most problems :\)
		window.geofs.aircraft.instance.llaLocation = [slewA, slewB, slewAlt];
		window.geofs.aircraft.instance.object3d.setInitialRotation([
			tilt,
			roll,
			headingRad,
		]);
		window.geofs.aircraft.instance.rigidBody.v_linearVelocity = [0, 0, 0];
		window.geofs.aircraft.instance.rigidBody.v_acceleration = [0, 0, 0];
		window.geofs.aircraft.instance.rigidBody.v_angularVelocity = [0, 0, 0];
		window.geofs.aircraft.instance.rigidBody.v_angularAcceleration = [0, 0, 0];
		window.geofs.aircraft.instance.rigidBody.gravityForce = [0, 0, 0];
		window.slewDiv.innerHTML = `
        <p style="margin: 0px; font-weight: bold;">LAT: ${slewA.toFixed(
					4
				)} LON: ${slewB.toFixed(4)} ALT: ${(
			slewAlt * window.METERS_TO_FEET
		).toFixed(1)} FT MSL MAG ${(headingRad * window.RAD_TO_DEGREES).toFixed(
			0
		)} ${(
			(Math.abs(speedF) + Math.abs(sideways)) /
			Number(localStorage.getItem("slewLatSpeed"))
		).toFixed(0)} UNITS</p>
        `;
	}

	window.slew = async function () {
		speedF = 0;
		sideways = 0;
		speedV = 0;
		tilt = 0;
		roll = 0;
		window.lastGravity = window.geofs.aircraft.instance.rigidBody.gravityForce;
		window.lastCam = window.geofs.camera.currentMode;
		headingRad =
			window.geofs.animation.values.heading360 * window.DEGREES_TO_RAD;
		window.pControl = window.geofs.preferences.controlMode;
		slewA = window.geofs.aircraft.instance.llaLocation[0];
		slewB = window.geofs.aircraft.instance.llaLocation[1];
		slewAlt = window.geofs.aircraft.instance.llaLocation[2];
		window.geofs.camera.set(5);
		requestAnimationFrame(checkFrameNumber);
	};
})();
function slewInit() {
	//Initializes the menu
	/*<div id="gmenu" class="mdl-button mdl-js-button geofs-f-standard-ui" style="
    padding: 0px;
" onclick="window.ggamergguy.toggleMenu()"><img src="https://raw.githubusercontent.com/tylerbmusic/GPWS-files_geofs/refs/heads/main/s_icon.png" style=":;/: 0px;width: 30px;"></div>*/
	if (!window.ggamergguy) {
		window.ggamergguy = {};
		var bottomDiv = document.getElementsByClassName("geofs-ui-bottom")[0];
		window.ggamergguy.btn = document.createElement("div");

		window.ggamergguy.btn.id = "gmenu";
		window.ggamergguy.btn.classList =
			"mdl-button mdl-js-button geofs-f-standard-ui";

		window.ggamergguy.btn.style.padding = "0px";

		bottomDiv.appendChild(window.ggamergguy.btn);
		window.ggamergguy.btn.innerHTML = `<img src="https://raw.githubusercontent.com/tylerbmusic/GPWS-files_geofs/refs/heads/main/s_icon.png" style="width: 30px">`;
		document.getElementById("gmenu").onclick = function () {
			window.ggamergguy.toggleMenu();
		};
	} //End if (!window.ggamergguy)
	if (!window.ggamergguy.toggleMenu) {
		window.ggamergguy.toggleMenu = function () {
			if (window.ggamergguy.menuDiv.style.display == "none") {
				window.ggamergguy.menuDiv.style.display = "block";
				//set the values to the menu
				for (let i in window.ggamergguy.tM) {
					window.ggamergguy.tM[i]();
				}
			} else {
				window.ggamergguy.menuDiv.style.display = "none";
			} //End if-else (window.ggamergguy.menuDiv.classList.length == 5)
		};
	} //End if (!window.ggamergguy.toggleMenu)
	if (!window.ggamergguy.menuDiv) {
		/*<div id="ggamergguy" class="geofs-list geofs-toggle-panel geofs-preference-list geofs-preferences" style="
    z-index: 100;
    position: fixed;
    display: block;
    width: 40%;
"></div>*/
		window.ggamergguy.menuDiv = document.createElement("div");

		window.ggamergguy.menuDiv.id = "ggamergguyDiv";
		window.ggamergguy.menuDiv.classList =
			"geofs-list geofs-toggle-panel geofs-preference-list geofs-preferences";

		window.ggamergguy.menuDiv.style.zIndex = "100";
		window.ggamergguy.menuDiv.style.position = "fixed";
		window.ggamergguy.menuDiv.style.width = "40%";
		document.body.appendChild(window.ggamergguy.menuDiv);
	} //End if (!window.ggamergguy.menuDiv)
	if (!window.ggamergguy.menuContents) {
		//The difference is = vs +=
		window.ggamergguy.menuContents = `
                <div id="stLts">
<h2>Slew Mode Settings</h2>
<span>Enabled: </span>
<input id="slewEnabled" type="checkbox" onchange="localStorage.setItem('slewEnabled', this.checked)" style="
    width: 5%;
    height: 5%;
"><br>
<span>Horizontal Speed (in degrees/frame): </span>
<input id="slewHSpeed" type="number" onchange="localStorage.setItem('slewLatSpeed', this.value)"><br>
<span>Vertical Speed (in feet/frame): </span>
<input id="slewVSpeed" type="number" onchange="localStorage.setItem('slewVertSpeed', this.value)"><br>
<span>Rotate Amount (in degrees): </span>
<input id="slewRotAmount" type="number" onchange="localStorage.setItem('slewRotAmount', this.value)"><br>
<span>Speed after slew disabled (higher values are lower speeds, no flaps): </span>
<input id="slewSpeedMultiplier" type="number" onchange="localStorage.setItem('slewSpeedMultiplier', this.value)"><br>
<span>Speed multiplier after slew disabled (higher values are lower speeds, with flaps): </span>
<input id="slewSpeedMultiplierFlaps" type="number" onchange="localStorage.setItem('slewSpeedMultiplierFlaps', this.value)"><br>

<h3>Keybinds: </h3>
<span>Toggle Slew Mode: </span>
<input id="slewToggle" onchange="localStorage.setItem('toggleSlew', this.value)"><br>
<span>Forwards: </span>
<input id="slewF" onchange="localStorage.setItem('slewForward', this.value)"><br>
<span>Backwards: </span>
<input id="slewB" onchange="localStorage.setItem('slewBackwards', this.value)"><br>
<span>Left: </span>
<input id="slewL" onchange="localStorage.setItem('slewLeft', this.value)"><br>
<span>Right: </span>
<input id="slewR" onchange="localStorage.setItem('slewRight', this.value)"><br>
<span>Up: </span>
<input id="slewU" onchange="localStorage.setItem('slewUp', this.value)"><br>
<span>Down: </span>
<input id="slewD" onchange="localStorage.setItem('slewDown', this.value)"><br>
<h4>Rotation: </h4>
<span>Rotate Up (tilt): </span>
<input id="slewRotTiltUp" onchange="localStorage.setItem('slewRotTiltUp', this.value)"><br>
<span>Rotate Down (tilt): </span>
<input id="slewRotTiltDown" onchange="localStorage.setItem('slewRotTiltDown', this.value)"><br>
<span>Roll right: </span>
<input id="slewRotRRight" onchange="localStorage.setItem('slewRotRRight', this.value)"><br>
<span>Roll left: </span>
<input id="slewRotRLeft" onchange="localStorage.setItem('slewRotRLeft', this.value)"><br>
<span>Yaw Right: </span>
<input id="slewRotYRight" onchange="localStorage.setItem('slewRotYRight', this.value)"><br>
<span>Yaw Left: </span>
<input id="slewRotYLeft" onchange="localStorage.setItem('slewRotYLeft', this.value)"><br>
<div style="
    background: darkgray;
    height: 2px;
    margin: 10px;
"></div>
</div>
            `;
		window.ggamergguy.menuDiv.innerHTML = window.ggamergguy.menuContents;
		function t() {
			console.log("SlewT1");
			let a = document.getElementById("slewEnabled");
			let b = document.getElementById("slewHSpeed");
			let c = document.getElementById("slewVSpeed");
			let q = document.getElementById("slewRotAmount");
			let r = document.getElementById("slewSpeedMultiplier");
			let s = document.getElementById("slewSpeedMultiplierFlaps");
			let d = document.getElementById("slewToggle");
			let e = document.getElementById("slewF");
			let f = document.getElementById("slewB");
			let g = document.getElementById("slewL");
			let h = document.getElementById("slewR");
			let i = document.getElementById("slewU");
			let j = document.getElementById("slewD");
			let k = document.getElementById("slewRotTiltUp");
			let l = document.getElementById("slewRotTiltDown");
			let m = document.getElementById("slewRotRRight");
			let n = document.getElementById("slewRotRLeft");
			let o = document.getElementById("slewRotYRight");
			let p = document.getElementById("slewRotYLeft");
			a.checked = localStorage.getItem("slewEnabled") == "true";
			b.value = Number(localStorage.getItem("slewLatSpeed"));
			c.value = Number(localStorage.getItem("slewVertSpeed"));
			q.value = Number(localStorage.getItem("slewRotAmount"));
			r.value = Number(localStorage.getItem("slewSpeedMultiplier"));
			s.value = Number(localStorage.getItem("slewSpeedMultiplierFlaps"));
			d.value = localStorage.getItem("toggleSlew");
			e.value = localStorage.getItem("slewForward");
			f.value = localStorage.getItem("slewBackwards");
			g.value = localStorage.getItem("slewLeft");
			h.value = localStorage.getItem("slewRight");
			i.value = localStorage.getItem("slewUp");
			j.value = localStorage.getItem("slewDown");
			k.value = localStorage.getItem("slewRotTiltUp");
			l.value = localStorage.getItem("slewRotTiltDown");
			m.value = localStorage.getItem("slewRotRRight");
			n.value = localStorage.getItem("slewRotRLeft");
			o.value = localStorage.getItem("slewRotYRight");
			p.value = localStorage.getItem("slewRotYLeft");
		}
		if (!window.ggamergguy.tM) {
			window.ggamergguy.tM = [];
		}
		window.ggamergguy.tM.push(t);
	} else {
		//End if, start else (!window.ggamergguy.menuContents)
		window.ggamergguy.menuContents += `
                <div id="stLts">
<h2>Slew Mode Settings</h2>
<span>Enabled: </span>
<input id="slewEnabled" type="checkbox" onchange="localStorage.setItem('slewEnabled', this.checked)" style="
    width: 5%;
    height: 5%;
"><br>
<span>Horizontal Speed (in degrees/frame): </span>
<input id="slewHSpeed" type="number" onchange="localStorage.setItem('slewLatSpeed', this.value)"><br>
<span>Vertical Speed (in feet/frame): </span>
<input id="slewVSpeed" type="number" onchange="localStorage.setItem('slewVertSpeed', this.value)"><br>
<span>Rotate Amount (in degrees): </span>
<input id="slewRotAmount" type="number" onchange="localStorage.setItem('slewRotAmount', this.value)"><br>
<span>Speed multiplier after slew disabled (no flaps): </span>
<input id="slewSpeedMultiplier" type="number" onchange="localStorage.setItem('slewSpeedMultiplier', this.value)"><br>
<span>Speed multiplier after slew disabled (with flaps): </span>
<input id="slewSpeedMultiplierFlaps" type="number" onchange="localStorage.setItem('slewSpeedMultiplierFlaps', this.value)"><br>

<h3>Keybinds: </h3>
<span>Toggle Slew Mode: </span>
<input id="slewToggle" onchange="localStorage.setItem('toggleSlew', this.value)"><br>
<span>Forwards: </span>
<input id="slewF" onchange="localStorage.setItem('slewForward', this.value)"><br>
<span>Backwards: </span>
<input id="slewB" onchange="localStorage.setItem('slewBackwards', this.value)"><br>
<span>Left: </span>
<input id="slewL" onchange="localStorage.setItem('slewLeft', this.value)"><br>
<span>Right: </span>
<input id="slewR" onchange="localStorage.setItem('slewRight', this.value)"><br>
<span>Up: </span>
<input id="slewU" onchange="localStorage.setItem('slewUp', this.value)"><br>
<span>Down: </span>
<input id="slewD" onchange="localStorage.setItem('slewDown', this.value)"><br>
<h4>Rotation: </h4>
<span>Rotate Up (tilt): </span>
<input id="slewRotTiltUp" onchange="localStorage.setItem('slewRotTiltUp', this.value)"><br>
<span>Rotate Down (tilt): </span>
<input id="slewRotTiltDown" onchange="localStorage.setItem('slewRotTiltDown', this.value)"><br>
<span>Roll right: </span>
<input id="slewRotRRight" onchange="localStorage.setItem('slewRotRRight', this.value)"><br>
<span>Roll left: </span>
<input id="slewRotRLeft" onchange="localStorage.setItem('slewRotRLeft', this.value)"><br>
<span>Yaw Right: </span>
<input id="slewRotYRight" onchange="localStorage.setItem('slewRotYRight', this.value)"><br>
<span>Yaw Left: </span>
<input id="slewRotYLeft" onchange="localStorage.setItem('slewRotYLeft', this.value)"><br>
<div style="
    background: darkgray;
    height: 2px;
    margin: 10px;
"></div>
</div>
            `;
		window.ggamergguy.menuDiv.innerHTML = window.ggamergguy.menuContents;
		function t() {
			console.log("SlewT1");
			let a = document.getElementById("slewEnabled");
			let b = document.getElementById("slewHSpeed");
			let c = document.getElementById("slewVSpeed");
			let q = document.getElementById("slewRotAmount");
			let r = document.getElementById("slewSpeedMultiplier");
			let s = document.getElementById("slewSpeedMultiplierFlaps");
			let d = document.getElementById("slewToggle");
			let e = document.getElementById("slewF");
			let f = document.getElementById("slewB");
			let g = document.getElementById("slewL");
			let h = document.getElementById("slewR");
			let i = document.getElementById("slewU");
			let j = document.getElementById("slewD");
			let k = document.getElementById("slewRotTiltUp");
			let l = document.getElementById("slewRotTiltDown");
			let m = document.getElementById("slewRotRRight");
			let n = document.getElementById("slewRotRLeft");
			let o = document.getElementById("slewRotYRight");
			let p = document.getElementById("slewRotYLeft");
			a.checked = localStorage.getItem("slewEnabled") == "true";
			b.value = Number(localStorage.getItem("slewLatSpeed"));
			c.value = Number(localStorage.getItem("slewVertSpeed"));
			q.value = Number(localStorage.getItem("slewRotAmount"));
			r.value = Number(localStorage.getItem("slewSpeedMultiplier"));
			s.value = Number(localStorage.getItem("slewSpeedMultiplierFlaps"));
			d.value = localStorage.getItem("toggleSlew");
			e.value = localStorage.getItem("slewForward");
			f.value = localStorage.getItem("slewBackwards");
			g.value = localStorage.getItem("slewLeft");
			h.value = localStorage.getItem("slewRight");
			i.value = localStorage.getItem("slewUp");
			j.value = localStorage.getItem("slewDown");
			k.value = localStorage.getItem("slewRotTiltUp");
			l.value = localStorage.getItem("slewRotTiltDown");
			m.value = localStorage.getItem("slewRotRRight");
			n.value = localStorage.getItem("slewRotRLeft");
			o.value = localStorage.getItem("slewRotYRight");
			p.value = localStorage.getItem("slewRotYLeft");
		}
		if (!window.ggamergguy.tM) {
			window.ggamergguy.tM = [];
		}
		window.ggamergguy.tM.push(t);
	} //End if-else (!window.ggamerguy.menuContents)
} //End function slewInit()
