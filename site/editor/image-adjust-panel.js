/* ========================================================================
 * site/editor/image-adjust-panel.js
 * Purpose: Image adjustment panel for prelude squares, cut-sheet images,
 *          and inline figures (fit/position/scale/rotation).
 * Module tag (Phase 2): [agf:image-adjust-panel]
 *
 * REQUIRED IMPORTS:
 *   from ./core.js   : el, toast, api, deepClone, API
 *   from ./section-form.js   : refreshAfterEdit
 *   Exports: openImageAdjustPanel, removeImageAdjustPanel
 * ========================================================================
 */

function removeImageAdjustPanel() {
	var panel = document.querySelector(".image-adjust-panel");
	if (panel) panel.remove();
}

/**
 * openImageAdjustPanel(imgEl)
 * Opens a floating panel for adjusting image fit, position, scale, and
 * rotation on prelude squares, cut-sheet images, and inline figures.
 * Reads current values from data-img-* attributes. Done persists via PUT.
 */
function openImageAdjustPanel(imgEl) {
	removeImageAdjustPanel();

	var imagePath = imgEl.getAttribute("data-image-path") || "";
	if (!imagePath) {
		toast("No image path found.", "error");
		return;
	}

	var sectionEl = imgEl.closest("[data-section-id]");
	var isPrelude = imagePath.startsWith("squares.");
	var hostEl = sectionEl || imgEl;

	// Read current settings (new fit/posX/posY format first, fallback to legacy size/position)
	var curFit =
		imgEl.getAttribute("data-img-fit") ||
		imgEl.getAttribute("data-img-size") ||
		"cover";
	var curPosX = parseFloat(imgEl.getAttribute("data-img-pos-x"));
	if (Number.isNaN(curPosX)) curPosX = 50;
	var curPosY = parseFloat(imgEl.getAttribute("data-img-pos-y"));
	if (Number.isNaN(curPosY)) curPosY = 50;
	var curScale = parseFloat(imgEl.getAttribute("data-img-scale"));
	if (Number.isNaN(curScale) || curScale <= 0) curScale = 100;
	var curRotation = parseFloat(imgEl.getAttribute("data-img-rotation"));
	if (Number.isNaN(curRotation)) curRotation = 0;

	var stFit = curFit;
	var stPosX = curPosX;
	var stPosY = curPosY;
	var stScale = curScale;
	var stRotation = curRotation;

	function applyLiveImagePreview() {
		var position = stPosX + "% " + stPosY + "%";
		var transform = "scale(" + stScale + "%) rotate(" + stRotation + "deg)";
		if (isPrelude) {
			imgEl.style.backgroundSize =
				stScale && stScale !== 100 ? stScale + "%" : stFit;
			imgEl.style.backgroundPosition = position;
			imgEl.style.transform = "rotate(" + stRotation + "deg)";
		} else {
			imgEl.style.objectFit = stFit === "fill" ? "fill" : stFit;
			imgEl.style.objectPosition = position;
			imgEl.style.transform = transform;
		}
	}

	function syncPanelUI() {
		fitGroup.querySelectorAll(".bg-segment-btn").forEach((b) => {
			b.classList.toggle("is-active", b.getAttribute("data-value") === stFit);
		});
		posXSlider.value = String(stPosX);
		posXVal.textContent = stPosX + "%";
		posYSlider.value = String(stPosY);
		posYVal.textContent = stPosY + "%";
		scaleSlider.value = String(stScale);
		scaleVal.textContent = stScale + "%";
		rotationGroup.querySelectorAll(".bg-segment-btn").forEach((b) => {
			b.classList.toggle(
				"is-active",
				parseInt(b.getAttribute("data-value"), 10) === stRotation,
			);
		});
	}

	var panel = el("div", { class: "image-adjust-panel" });

	// --- Fit ---
	panel.append(
		el("div", { class: "bg-settings-field" }, [el("label", { text: "Fit" })]),
	);
	var fitGroup = el("div", { class: "bg-segment-group" });
	["cover", "contain", "fill"].forEach((opt) => {
		var btn = el("button", {
			type: "button",
			class: "bg-segment-btn" + (stFit === opt ? " is-active" : ""),
			text: opt.charAt(0).toUpperCase() + opt.slice(1),
			"data-value": opt,
			onClick: () => {
				stFit = opt;
				fitGroup.querySelectorAll(".bg-segment-btn").forEach((b) => {
					b.classList.remove("is-active");
				});
				btn.classList.add("is-active");
				applyLiveImagePreview();
			},
		});
		fitGroup.append(btn);
	});
	panel.append(fitGroup);

	// --- Position X ---
	panel.append(
		el("div", { class: "bg-settings-field" }, [
			el("label", { text: "Position X" }),
		]),
	);
	var posXRow = el("div", { class: "bg-opacity-row" });
	var posXSlider = el("input", {
		type: "range",
		min: "0",
		max: "100",
		step: "1",
		value: String(stPosX),
	});
	var posXVal = el("span", { class: "bg-opacity-val", text: stPosX + "%" });
	posXSlider.addEventListener("input", () => {
		stPosX = parseInt(posXSlider.value, 10);
		posXVal.textContent = stPosX + "%";
		applyLiveImagePreview();
	});
	posXRow.append(posXSlider);
	posXRow.append(posXVal);
	panel.append(posXRow);

	// --- Position Y ---
	panel.append(
		el("div", { class: "bg-settings-field" }, [
			el("label", { text: "Position Y" }),
		]),
	);
	var posYRow = el("div", { class: "bg-opacity-row" });
	var posYSlider = el("input", {
		type: "range",
		min: "0",
		max: "100",
		step: "1",
		value: String(stPosY),
	});
	var posYVal = el("span", { class: "bg-opacity-val", text: stPosY + "%" });
	posYSlider.addEventListener("input", () => {
		stPosY = parseInt(posYSlider.value, 10);
		posYVal.textContent = stPosY + "%";
		applyLiveImagePreview();
	});
	posYRow.append(posYSlider);
	posYRow.append(posYVal);
	panel.append(posYRow);

	// --- Scale ---
	panel.append(
		el("div", { class: "bg-settings-field" }, [el("label", { text: "Scale" })]),
	);
	var scaleRow = el("div", { class: "bg-opacity-row" });
	var scaleSlider = el("input", {
		type: "range",
		min: "50",
		max: "300",
		step: "5",
		value: String(stScale),
	});
	var scaleVal = el("span", { class: "bg-opacity-val", text: stScale + "%" });
	scaleSlider.addEventListener("input", () => {
		stScale = parseInt(scaleSlider.value, 10);
		scaleVal.textContent = stScale + "%";
		applyLiveImagePreview();
	});
	scaleRow.append(scaleSlider);
	scaleRow.append(scaleVal);
	panel.append(scaleRow);

	// --- Rotation ---
	panel.append(
		el("div", { class: "bg-settings-field" }, [
			el("label", { text: "Rotation" }),
		]),
	);
	var rotationGroup = el("div", { class: "bg-segment-group" });
	[0, 90, 180, 270].forEach((deg) => {
		var btn = el("button", {
			type: "button",
			class: "bg-segment-btn" + (stRotation === deg ? " is-active" : ""),
			text: deg + "°",
			"data-value": String(deg),
			onClick: () => {
				stRotation = deg;
				rotationGroup.querySelectorAll(".bg-segment-btn").forEach((b) => {
					b.classList.remove("is-active");
				});
				btn.classList.add("is-active");
				applyLiveImagePreview();
			},
		});
		rotationGroup.append(btn);
	});
	panel.append(rotationGroup);

	// --- Actions ---
	var actions = el("div", { class: "bg-settings-actions" });
	actions.append(
		el("button", {
			type: "button",
			class: "bg-reset",
			text: "Reset",
			onClick: () => {
				stFit = "cover";
				stPosX = 50;
				stPosY = 50;
				stScale = 100;
				stRotation = 0;
				applyLiveImagePreview();
				syncPanelUI();
			},
		}),
	);
	actions.append(
		el("button", {
			type: "button",
			class: "bg-apply",
			text: "Done",
			onClick: () => {
				var settings = {
					fit: stFit,
					posX: stPosX,
					posY: stPosY,
					scale: stScale,
					rotation: stRotation,
				};
				persistImageSettings(imgEl, settings).then(() => {
					removeImageAdjustPanel();
				});
			},
		}),
	);
	panel.append(actions);

	// Position near the host element
	var rect = hostEl.getBoundingClientRect();
	panel.style.position = "fixed";
	panel.style.top = Math.max(8, rect.top - 8) + "px";
	panel.style.left = Math.min(window.innerWidth - 288, rect.right + 12) + "px";

	document.body.append(panel);

	// Close on outside click
	setTimeout(() => {
		document.addEventListener("mousedown", function onDocClick(ev) {
			if (!panel.contains(ev.target) && !hostEl.contains(ev.target)) {
				removeImageAdjustPanel();
				document.removeEventListener("mousedown", onDocClick);
			}
		});
	}, 0);
}

async function persistImageSettings(imgEl, settings) {
	var imagePath = imgEl.getAttribute("data-image-path") || "";
	var sectionEl = imgEl.closest("[data-section-id]");
	var productCard = imgEl.closest(".product-card[data-product-slug]");
	if (productCard) {
		toast("Product image adjustment is not supported here.", "error");
		return;
	}
	if (!sectionEl) {
		toast("Could not find a section for this image.", "error");
		return;
	}

	var sid = sectionEl.getAttribute("data-section-id");
	var schemaId = sectionEl.getAttribute("data-schema") || "";
	var section = await api("GET", API.sections + "/" + sid);
	var sData = section.data ? deepClone(section.data) : {};

	if (imagePath.startsWith("squares.")) {
		var squareIdx = parseInt(
			imagePath.replace("squares.", "").split(".")[0],
			10,
		);
		if (!Array.isArray(sData.squares)) sData.squares = [{}, {}, {}];
		while (sData.squares.length <= squareIdx) sData.squares.push({});
		sData.squares[squareIdx].image_settings = settings;
	} else if (imagePath === "image") {
		sData.image_settings = settings;
	} else if (imagePath.startsWith("modules.")) {
		// Concept-explainer module image: modules.N.image
		var ceParts = imagePath.split(".");
		var moduleIdx = parseInt(ceParts[1], 10);
		if (Number.isNaN(moduleIdx) || !Array.isArray(sData.modules)) {
			toast("Could not find module for this image.", "error");
			return;
		}
		if (!sData.modules[moduleIdx]) {
			toast("Module index out of range.", "error");
			return;
		}
		if (!sData.modules[moduleIdx].image_settings)
			sData.modules[moduleIdx].image_settings = {};
		sData.modules[moduleIdx].image_settings = settings;
	} else if (imagePath === "_figures") {
		var figureEl = imgEl.closest("figure[data-figure-id]");
		if (!figureEl) {
			toast("Could not find the figure element.", "error");
			return;
		}
		var figureId = figureEl.getAttribute("data-figure-id");
		var figs = Array.isArray(sData._figures) ? sData._figures : [];
		var idx = figs.findIndex((f) => f.id === figureId);
		if (idx < 0) {
			toast("Could not find the figure in section data.", "error");
			return;
		}
		figs[idx].settings = settings;
		sData._figures = figs;
	} else {
		toast("Unknown image type: " + imagePath, "error");
		return;
	}

	sData = await reconcileConventionFields("section", sid, sData);
	await api("PUT", API.sections + "/" + sid, {
		data: sData,
		title: section.title,
	});
	toast("Image settings saved.", "success");
	await refreshAfterEdit(sid, schemaId);
}
