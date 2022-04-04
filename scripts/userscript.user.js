// ==UserScript==
// @name         Hololive combo
// @namespace    http://tampermonkey.net/
// @version      0.2.1
// @description  Spread the love
// @author       oralekin
// @match        https://hot-potato.reddit.com/embed*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @grant        none
// ==/UserScript==
if (window.top !== window.self) {
	window.addEventListener("load", () => {
		const opacity = 1;
		const camera = document.querySelector("mona-lisa-embed").shadowRoot.querySelector("mona-lisa-camera");
		const layout = document.querySelector("mona-lisa-embed").shadowRoot;
		const canvas = camera.querySelector("mona-lisa-canvas");
		const container = canvas.shadowRoot.querySelector(".container");
		function addImage(src, posX, posY) {
			let img = document.createElement("img");
			const hint = document.createElement("canvas");
			img.onload = () => {
				const width = img.width;
				const height = img.height;
				const style = `
					position: absolute;
					left: ${posX}px;
					top: ${posY}px;
					image-rendering: pixelated;
					width: ${width}px;
					height: ${height}px;`;

				img.setAttribute("id", "planOverlay");
				img.style = style;

				hint.setAttribute("id", "hintOverlay");
				hint.width = width * 3;
				hint.height = height * 3;
				hint.style = style;
				const ctx = hint.getContext("2d");
				ctx.globalAlpha = opacity;
				for (let y = 0; y < height; y++) {
					for (let x = 0; x < width; x++) {
						ctx.drawImage(img, x, y, 1, 1, x * 3 + 1, y * 3 + 1, 1, 1);
					}
				}
			};
			img.src = src;
			return [hint, img];
		}

		const waitForPreview = setInterval(() => {
			const preview = camera.querySelector("mona-lisa-pixel-preview");
			if (preview) {
				clearInterval(waitForPreview);
				const style = document.createElement("style");
				const loEx = -20;
				const hiEx = 120;
				const loIn = 30;
				const hiIn = 69;
				style.innerHTML = `.pixel {
					clip-path: polygon(
						${loEx}% ${loEx}%,
						${loEx}% ${hiEx}%,
						${loIn}% ${hiEx}%,
						${loIn}% ${loIn}%,
						${hiIn}% ${loIn}%,
						${hiIn}% ${hiIn}%,
						${loIn}% ${hiIn}%,
						${loIn}% ${hiEx}%,
						${hiEx}% ${hiEx}%,
						${hiEx}% ${loEx}%
					) !important;
				}`;
				preview.shadowRoot.appendChild(style);

				loadRegions();
				setTimeout(() => {
					loadRegions();
					if (typeof regionInterval == "undefined") {
						const regionInterval = setInterval(loadRegions, 5000);
					}
				}, 1000);
			}
		}, 100);

		function insertAfter(newNode, referenceNode) {
			referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
		}
		// I would like to personally thank the osu team for inspiring (read: letting me copy paste) this code
		// free software :P
		function addInput(y, id, label, kind, setup) {
			if (layout.contains(layout.querySelector(`#${id}`))) return;
			let visDiv = document.createElement("div");

			// designed to be below the osu team's slider
			visDiv.style = `
				position: fixed;
				left: calc(var(--sail) + 16px);
				right: calc(var(--sair) + 16px);
				display: flex;
				flex-flow: row nowrap;
				align-items: center;
				justify-content: center;
				height: 40px;
				top: calc(var(--sait) + ${y}px);
				text-shadow: black 1px 0 10px;
				text-align: center;
			`;

			function createInput() {
				let visInput = document.createElement("input");
				visInput.setAttribute("type", kind);
				visInput.setAttribute("id", id);
				setup(visInput);
				visDiv.appendChild(visInput);
				return visInput;
			}
			
			let visText = document.createElement("div");
			visText.innerText = label;
			visDiv.appendChild(visText);
			visText.style = "background-color: rgba(0, 0, 0, 0.5)";
			createInput();

			let topControls = document.querySelector("mona-lisa-embed").shadowRoot.querySelector(".layout .top-controls");
			insertAfter(visDiv, topControls);
		}

		const src = "https://raw.githubusercontent.com/TheGeka/pixel/main/output.png";
		let [hint, plan] = addImage(src, 0, 0);

		function loadRegions() {
			console.log("LOADING REGIONS");

			const toggleOverlay = (id, checked) => {
				container.querySelector(`#${id}`).style.display = checked ? "block" : "none";
			};

			addInput(80, "visHintCheckbox", "Show hint", "checkbox", visInput => {
				container.appendChild(hint);
				visInput.checked = true;
				visInput.onclick = () => toggleOverlay("hintOverlay", visInput.checked);
			});
			addInput(112, "visPlanCheckbox", "Preview full plans", "checkbox", visInput => {
				container.appendChild(plan);
				visInput.checked = true;
				visInput.onclick = () => toggleOverlay("planOverlay", visInput.checked);
				visInput.click();
			});
		}
	}, false);
}
