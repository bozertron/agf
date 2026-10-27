/* ==========================================================================
   AGF · editor.js — Click-to-Edit Controller
   Self-contained, vanilla JS. Left-click on a section or product card opens
   the schema-driven edit form in-place. Right-click opens a context menu with
   Delete, Toggle Visibility, Move Up, Move Down. A "+" button in the nav bar
   opens the schema picker for adding new sections. Talks to /api/sections,
   /api/products, /api/schemas. Coexists with app.js by calling
   window.AGF.refreshSection / refreshProducts / refreshAll / toast after writes.
   ========================================================================== */
(() => {
	// ---------- shorthand ---------------------------------------------------
	const $ = (sel, root = document) => root.querySelector(sel);
	const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
	const API = {
		sections: "/api/sections",
		products: "/api/products",
		schemas: "/api/schemas",
	};

	// Cache fetched schema definitions so we don't refetch on every form open.
	const schemaCache = new Map(); // id -> full schema record
	let schemaListCache = null; // GET /api/schemas list

	// Tracks the slug of the product/section currently being edited; consumed by
	// image upload fields so that uploads are routed to the correct sub-folder.
	let currentEditSlug = null;
	let currentEditCategory = "products";

	// ---------- utilities ---------------------------------------------------
	function toast(msg, type) {
		if (window.AGF && typeof window.AGF.toast === "function") {
			window.AGF.toast(msg, type || "info");
		} else {
			console.warn("[toast:" + (type || "info") + "]", msg);
		}
	}

	async function api(method, url, body) {
		const opts = {
			method,
			headers: { Accept: "application/json" },
		};
		if (body !== undefined) {
			opts.headers["Content-Type"] = "application/json";
			opts.body = JSON.stringify(body);
		}
		const res = await fetch(url, opts);
		if (res.status === 204) return null;
		const ct = res.headers.get("content-type") || "";
		const payload = ct.includes("application/json")
			? await res.json()
			: await res.text();
		if (!res.ok) {
			const msg =
				payload && payload.error ? payload.error : "HTTP " + res.status;
			throw new Error(msg);
		}
		return payload;
	}

	// Fresh-GET reconcile for convention fields (any `_`-prefixed key such as
	// _style_overrides / _background_image). Used by every save path so a
	// form-open snapshot can never clobber a concurrent edit to a convention
	// field. Only FILLS GAPS: keys already present on `merged` win (the user's
	// current edit). A failed reconcile GET aborts the save (no silent clobber).
	// `hostType` is 'section' (hostIdOrSlug = id) or 'product' (= slug).
	async function reconcileConventionFields(hostType, hostIdOrSlug, merged) {
		var url =
			hostType === "product"
				? API.products + "/" + hostIdOrSlug
				: API.sections + "/" + hostIdOrSlug;
		var fresh;
		try {
			fresh = await api("GET", url);
		} catch (err) {
			throw new Error(
				"Save aborted: could not verify persisted convention fields (" +
					err.message +
					")",
			);
		}
		if (fresh && fresh.data) {
			// Future-proof: backfill ANY `_`-prefixed convention field that exists
			// on the live record but is missing from `merged` (Ticket #24).
			Object.keys(fresh.data).forEach((k) => {
				if (k.charAt(0) === "_" && fresh.data[k] && !merged[k]) {
					merged[k] = fresh.data[k];
				}
			});
		}
		return merged;
	}

	function escapeHTML(s) {
		return String(s == null ? "" : s)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;");
	}

	function el(tag, attrs, children) {
		const node = document.createElement(tag);
		if (attrs) {
			Object.keys(attrs).forEach((k) => {
				const v = attrs[k];
				if (v === undefined || v === null || v === false) return;
				if (k === "class") node.className = v;
				else if (k === "html") node.innerHTML = v;
				else if (k === "text") node.textContent = v;
				else if (k.startsWith("on") && typeof v === "function") {
					node.addEventListener(k.slice(2).toLowerCase(), v);
				} else {
					node.setAttribute(k, v === true ? "" : v);
				}
			});
		}
		if (children) {
			(Array.isArray(children) ? children : [children]).forEach((c) => {
				if (c == null || c === false) return;
				node.appendChild(
					typeof c === "string" ? document.createTextNode(c) : c,
				);
			});
		}
		return node;
	}

	// Resolve a JSON-Schema property descriptor to its effective shape, taking
	// the first non-null option from oneOf/anyOf if present.
	function resolveSchema(s) {
		if (!s || typeof s !== "object") return s || {};
		if (Array.isArray(s.oneOf)) {
			const pick = s.oneOf.find((o) => o && o.type !== "null") || s.oneOf[0];
			return Object.assign({}, s, pick);
		}
		if (Array.isArray(s.anyOf)) {
			const pick = s.anyOf.find((o) => o && o.type !== "null") || s.anyOf[0];
			return Object.assign({}, s, pick);
		}
		return s;
	}

	// Pull a default for a schema node — used when adding a new array item.
	function defaultFor(schema) {
		const s = resolveSchema(schema);
		if (!s || !s.type) return "";
		if (s.default !== undefined) return s.default;
		if (s.type === "string") return s.enum ? s.enum[0] : "";
		if (s.type === "integer" || s.type === "number") return 0;
		if (s.type === "boolean") return false;
		if (s.type === "array") return [];
		if (s.type === "object") {
			const o = {};
			if (s.properties) {
				Object.keys(s.properties).forEach((k) => {
					o[k] = defaultFor(s.properties[k]);
				});
			}
			return o;
		}
		return null;
	}

	function humanize(key) {
		return String(key || "")
			.replace(/[_-]+/g, " ")
			.replace(/\b\w/g, (c) => c.toUpperCase());
	}

	function isMarkdown(schema) {
		const desc = (schema && schema.description) || "";
		return /markdown/i.test(desc);
	}

	// ---------- schema fetching --------------------------------------------
	async function getSchemaList() {
		if (schemaListCache) return schemaListCache;
		schemaListCache = await api("GET", API.schemas);
		return schemaListCache;
	}

	async function getSchema(id) {
		if (schemaCache.has(id)) return schemaCache.get(id);
		const rec = await api("GET", API.schemas + "/" + encodeURIComponent(id));
		schemaCache.set(id, rec);
		return rec;
	}

	// ---------- form generation --------------------------------------------
	/**
	 * generateForm(schema, data, path)
	 * Returns a DocumentFragment containing form fields for the given schema.
	 * Each leaf field carries data-path = "a.b.c" (or "a.0.b" for arrays).
	 */
	function generateForm(schema, data, path) {
		const frag = document.createDocumentFragment();
		const s = resolveSchema(schema);
		if (!s) return frag;

		if (s.type === "object" || s.properties) {
			const props = s.properties || {};
			Object.keys(props).forEach((key) => {
				const childPath = path ? path + "." + key : key;
				const childSchema = resolveSchema(props[key]);
				const childData =
					data && typeof data === "object" ? data[key] : undefined;
				frag.appendChild(renderField(key, childSchema, childData, childPath));
			});
			return frag;
		}
		// Top-level non-object — wrap in single field
		frag.appendChild(renderField(path || "value", s, data, path || "value"));
		return frag;
	}

	function renderField(key, schema, value, path) {
		const s = resolveSchema(schema);
		const label = humanize(key);

		// ----- image upload (uri-format strings or fields named *image*) -----
		if (
			s.type === "string" &&
			!Array.isArray(s.enum) &&
			(s.format === "uri" || /image/i.test(key))
		) {
			return createImageUploadField(
				key,
				path,
				typeof value === "string" ? value : "",
				s,
			);
		}

		// ----- nested object → collapsible group -----
		if (s.type === "object" && s.properties) {
			const group = el("div", { class: "form-group", "data-path": path });
			const isOpen = path.split(".").length <= 1; // top-level groups open
			const head = el(
				"div",
				{
					class: "form-group-header",
					onClick: (e) => {
						const body = group.querySelector(":scope > .form-group-body");
						const arrow = head.querySelector(".fg-arrow");
						if (!body) return;
						const open = body.classList.toggle("is-open");
						if (arrow) arrow.textContent = open ? "−" : "+";
					},
				},
				[
					el("span", { text: label }),
					el("span", { class: "fg-arrow", text: isOpen ? "−" : "+" }),
				],
			);
			group.appendChild(head);
			const body = el("div", {
				class: "form-group-body" + (isOpen ? " is-open" : ""),
				"data-path": path,
			});
			const childData = value && typeof value === "object" ? value : {};
			Object.keys(s.properties).forEach((k) => {
				const cp = path + "." + k;
				body.appendChild(renderField(k, s.properties[k], childData[k], cp));
			});
			group.appendChild(body);
			return group;
		}

		// ----- array -----
		if (s.type === "array") {
			return renderArrayField(key, s, value, path, label);
		}

		// ----- enum string -----
		if (s.type === "string" && Array.isArray(s.enum)) {
			const wrap = el("div", { class: "form-field" });
			wrap.appendChild(el("label", { text: label }));
			const sel = el("select", {
				"data-path": path,
				"data-type": "string",
			});
			// allow blank
			if (!s.enum.includes("") && value === undefined) {
				sel.appendChild(el("option", { value: "", text: "— select —" }));
			}
			s.enum.forEach((opt) => {
				const o = el("option", { value: opt, text: opt });
				if (value === opt) o.selected = true;
				sel.appendChild(o);
			});
			wrap.appendChild(sel);
			if (s.description)
				wrap.appendChild(el("p", { class: "field-hint", text: s.description }));
			return wrap;
		}

		// ----- boolean -----
		if (s.type === "boolean") {
			const wrap = el("div", { class: "form-field form-field-inline" });
			const id = "f_" + path.replace(/[^a-z0-9_]/gi, "_");
			const input = el("input", {
				type: "checkbox",
				id,
				"data-path": path,
				"data-type": "boolean",
			});
			if (value === true) input.checked = true;
			wrap.appendChild(input);
			wrap.appendChild(el("label", { for: id, text: label }));
			return wrap;
		}

		// ----- number / integer -----
		if (s.type === "number" || s.type === "integer") {
			const wrap = el("div", { class: "form-field" });
			wrap.appendChild(el("label", { text: label }));
			const input = el("input", {
				type: "number",
				"data-path": path,
				"data-type": s.type,
				step: s.type === "integer" ? "1" : "any",
			});
			if (typeof value === "number") input.value = String(value);
			wrap.appendChild(input);
			if (s.description)
				wrap.appendChild(el("p", { class: "field-hint", text: s.description }));
			return wrap;
		}

		// ----- string (text / textarea / uri) -----
		const wrap = el("div", { class: "form-field" });
		wrap.appendChild(el("label", { text: label }));
		const useTextarea =
			isMarkdown(s) ||
			(typeof value === "string" && (value.length > 80 || /\n/.test(value)));
		let input;
		if (useTextarea) {
			input = el("textarea", {
				"data-path": path,
				"data-type": "string",
				rows: "4",
			});
			if (typeof value === "string") {
				// Set textContent (default value) so the textarea's value survives
				// DOM serialization/reset. Unlike <input>, where assigning .value
				// also sets the value *content attribute* (default value), a
				// <textarea> has no value content attribute — its default value is
				// its text content. Without this, the textarea's default value is
				// empty, and any browser-level reset (insertion steps, reflow,
				// innerHTML round-trip) wipes the raw value, causing collectForm to
				// read an empty string and silently drop the field from the PUT.
				input.textContent = value;
				input.value = value;
			}
		} else {
			input = el("input", {
				type: s.format === "uri" ? "url" : "text",
				"data-path": path,
				"data-type": "string",
			});
			if (value !== undefined && value !== null) input.value = String(value);
		}
		wrap.appendChild(input);
		if (s.description)
			wrap.appendChild(el("p", { class: "field-hint", text: s.description }));
		return wrap;
	}

	function renderArrayField(key, schema, value, path, label) {
		const s = resolveSchema(schema);
		const itemSchema = resolveSchema(s.items || { type: "string" });
		const arr = Array.isArray(value) ? value.slice() : [];

		const wrap = el("div", {
			class: "form-field form-array",
			"data-path": path,
		});
		wrap.appendChild(el("label", { text: label }));

		// Array of primitive strings → tag/comma input
		if (itemSchema.type === "string" && !Array.isArray(itemSchema.enum)) {
			const input = el("input", {
				type: "text",
				"data-path": path,
				"data-type": "array-string",
				placeholder: "Comma-separated values",
			});
			input.value = arr.join(", ");
			wrap.appendChild(input);
			wrap.appendChild(
				el("p", { class: "field-hint", text: "Separate items with commas." }),
			);
			return wrap;
		}

		// Array of enum strings → multi-select via checkboxes
		if (itemSchema.type === "string" && Array.isArray(itemSchema.enum)) {
			const box = el("div", {
				class: "form-checks",
				"data-path": path,
				"data-type": "array-enum",
			});
			itemSchema.enum.forEach((opt) => {
				const id =
					"f_" +
					path.replace(/[^a-z0-9_]/gi, "_") +
					"_" +
					opt.replace(/[^a-z0-9_]/gi, "_");
				const cb = el("input", {
					type: "checkbox",
					id,
					value: opt,
					"data-array-enum": "1",
				});
				if (arr.includes(opt)) cb.checked = true;
				const row = el("label", { class: "check-row", for: id }, [
					cb,
					" " + opt,
				]);
				box.appendChild(row);
			});
			wrap.appendChild(box);
			return wrap;
		}

		// Array of objects → repeatable fieldsets
		const items = el("div", { class: "array-items", "data-array-items": path });

		function appendItem(itemValue, idx) {
			const itemPath = path + "." + idx;
			const item = el("div", {
				class: "array-item",
				"data-array-index": String(idx),
			});
			const remove = el("button", {
				type: "button",
				class: "remove-item",
				title: "Remove",
				text: "×",
				onClick: () => {
					item.remove();
					renumberArray(items, path);
				},
			});
			item.appendChild(remove);
			item.appendChild(generateForm(itemSchema, itemValue, itemPath));
			items.appendChild(item);
		}

		arr.forEach(appendItem);

		const addBtn = el("button", {
			type: "button",
			class: "add-array-item",
			text: "+ Add item",
			onClick: () => {
				const idx = items.querySelectorAll(":scope > .array-item").length;
				appendItem(defaultFor(itemSchema), idx);
			},
		});

		wrap.appendChild(items);
		wrap.appendChild(addBtn);
		return wrap;
	}

	// After removing an array item, rewrite all data-path attrs so indices are
	// contiguous (foo.0, foo.1, foo.2 …).
	function renumberArray(itemsEl, basePath) {
		const items = itemsEl.querySelectorAll(":scope > .array-item");
		items.forEach((item, newIdx) => {
			const oldIdx = item.getAttribute("data-array-index");
			if (oldIdx === String(newIdx)) return;
			item.setAttribute("data-array-index", String(newIdx));
			const oldPrefix = basePath + "." + oldIdx;
			const newPrefix = basePath + "." + newIdx;
			item.querySelectorAll("[data-path]").forEach((node) => {
				const p = node.getAttribute("data-path");
				if (p === oldPrefix || p.startsWith(oldPrefix + ".")) {
					node.setAttribute("data-path", newPrefix + p.slice(oldPrefix.length));
				}
			});
			item.querySelectorAll("[data-array-items]").forEach((node) => {
				const p = node.getAttribute("data-array-items");
				if (p === oldPrefix || p.startsWith(oldPrefix + ".")) {
					node.setAttribute(
						"data-array-items",
						newPrefix + p.slice(oldPrefix.length),
					);
				}
			});
		});
	}

	// ---------- image upload field ----------------------------------------
	/**
	 * createImageUploadField(key, path, currentValue, schema)
	 * Returns a .form-field containing a drag-and-drop upload zone bound to
	 * POST /api/upload. The hidden input carries the resolved relative path
	 * so the regular collectForm() walker still picks it up via data-path.
	 */
	function createImageUploadField(key, path, currentValue, schema) {
		const wrap = el("div", { class: "form-field" });
		wrap.appendChild(el("label", { text: humanize(key) }));

		const zone = el("div", { class: "upload-zone", "data-field": key });
		if (currentValue) {
			const img = el("img", {
				src: currentValue,
				class: "upload-preview",
				alt: "Current image",
			});
			zone.appendChild(img);
		}
		zone.appendChild(
			el("p", {
				html: 'Drag image here or <span class="upload-browse">click to browse</span>',
			}),
		);

		const fileInput = el("input", {
			type: "file",
			accept: "image/*",
			style: "display:none",
		});
		const hiddenInput = el("input", {
			type: "hidden",
			name: key,
			"data-path": path,
			"data-type": "string",
		});
		hiddenInput.value = currentValue || "";

		zone.appendChild(fileInput);
		zone.appendChild(hiddenInput);
		wrap.appendChild(zone);
		if (schema && schema.description) {
			wrap.appendChild(
				el("p", { class: "field-hint", text: schema.description }),
			);
		}

		zone.addEventListener("click", (e) => {
			// Don't re-trigger the picker if the click originated from the input.
			if (e.target === fileInput) return;
			fileInput.click();
		});
		zone.addEventListener("dragover", (e) => {
			e.preventDefault();
			zone.classList.add("is-dragover");
		});
		zone.addEventListener("dragleave", () =>
			zone.classList.remove("is-dragover"),
		);
		zone.addEventListener("drop", (e) => {
			e.preventDefault();
			zone.classList.remove("is-dragover");
			if (e.dataTransfer.files.length) uploadFile(e.dataTransfer.files[0]);
		});
		fileInput.addEventListener("change", (e) => {
			if (e.target.files.length) uploadFile(e.target.files[0]);
		});

		async function uploadFile(file) {
			const formData = new FormData();
			// NOTE: text fields must precede the file part so that multer's
			// diskStorage destination/filename callbacks see them in req.body.
			formData.append("category", currentEditCategory || "products");
			formData.append("slug", currentEditSlug || "general");
			formData.append(
				"spec",
				key.replace(/_image$/, "").replace(/^image$/, "hero"),
			);
			formData.append("file", file);

			try {
				const res = await fetch("/api/upload", {
					method: "POST",
					body: formData,
				});
				const data = await res.json();
				if (data && data.success) {
					hiddenInput.value = data.relativePath;
					let preview = zone.querySelector(".upload-preview");
					if (preview) {
						preview.src = data.relativePath;
					} else {
						preview = el("img", {
							src: data.relativePath,
							class: "upload-preview",
							alt: "Uploaded",
						});
						zone.insertBefore(preview, zone.firstChild);
					}
					toast("Image uploaded", "success");
				} else {
					toast((data && data.error) || "Upload failed", "error");
				}
			} catch (err) {
				toast("Upload failed: " + err.message, "error");
			}
		}

		return wrap;
	}

	// ---------- form data collection ---------------------------------------
	/**
	 * collectForm(formRoot) → JSON value matching the schema structure.
	 * Walks every [data-path] node, parses by data-type, and assigns into a
	 * nested object/array by splitting the path on "." (numeric segments map
	 * to array indices).
	 */
	function collectForm(formRoot, skipPrune) {
		const root = {};

		function setPath(obj, parts, value) {
			let cur = obj;
			for (let i = 0; i < parts.length - 1; i++) {
				const k = parts[i];
				const nextK = parts[i + 1];
				const wantArray = /^\d+$/.test(nextK);
				if (/^\d+$/.test(k)) {
					const idx = parseInt(k, 10);
					if (!Array.isArray(cur)) return; // shouldn't happen
					if (cur[idx] === undefined) cur[idx] = wantArray ? [] : {};
					cur = cur[idx];
				} else {
					if (cur[k] === undefined || cur[k] === null)
						cur[k] = wantArray ? [] : {};
					cur = cur[k];
				}
			}
			const last = parts[parts.length - 1];
			if (/^\d+$/.test(last)) cur[parseInt(last, 10)] = value;
			else cur[last] = value;
		}

		// First gather array-of-string and array-of-enum containers
		formRoot.querySelectorAll('[data-type="array-string"]').forEach((input) => {
			const p = input.getAttribute("data-path");
			const raw = input.value.trim();
			const arr = raw
				? raw
						.split(",")
						.map((s) => s.trim())
						.filter(Boolean)
				: [];
			setPath(root, p.split("."), arr);
		});
		formRoot.querySelectorAll('[data-type="array-enum"]').forEach((box) => {
			const p = box.getAttribute("data-path");
			const arr = $$('input[type="checkbox"][data-array-enum="1"]', box)
				.filter((cb) => cb.checked)
				.map((cb) => cb.value);
			setPath(root, p.split("."), arr);
		});

		// Then primitive scalar fields
		formRoot.querySelectorAll("[data-path][data-type]").forEach((node) => {
			const t = node.getAttribute("data-type");
			if (t === "array-string" || t === "array-enum") return;
			const p = node.getAttribute("data-path");
			let v;
			if (t === "boolean") v = node.checked === true;
			else if (t === "number" || t === "integer") {
				const raw = node.value.trim();
				if (raw === "") return; // omit empties
				const num = t === "integer" ? parseInt(raw, 10) : parseFloat(raw);
				if (!Number.isFinite(num)) return;
				v = num;
			} else {
				const raw = node.value;
				// When skipPrune is active (per-item edit), PRESERVE explicit empty
				// strings so the user can intentionally clear a field. Without this,
				// clearing a field would silently keep the old value.
				if (raw == null) return;
				if (raw === "" && !skipPrune) return; // full-form: omit blanks as before
				v = raw;
			}
			setPath(root, p.split("."), v);
		});

		// Drop empty objects/arrays so the API stays clean.
		// NOTE: pruning compacts sparse arrays (e.g. [,,,{x}] → [{x}]) which
		// DESTROYS array-index paths like tenets.3.anchor_phrase. Callers that
		// resolve a value by dot-path (performSave) must pass skipPrune=true so
		// the sparse structure is preserved for getValueAtPath.
		return skipPrune ? root : prune(root);
	}

	function prune(value) {
		if (Array.isArray(value)) {
			// Sparse-safe: preserve interior holes so array-index paths (e.g.
			// tenets.3.anchor_phrase) are not compacted away.  We prune each
			// element but keep ALL slots (including undefined), then drop only the
			// trailing run of undefined so contiguous callers see identical output.
			// NOTE: forEach/map skip holes — must use a manual for-loop to visit them.
			const out = [];
			for (let i = 0; i < value.length; i++) {
				out.push(prune(value[i]));
			}
			while (out.length && out[out.length - 1] === undefined) out.pop();
			return out;
		}
		if (value && typeof value === "object") {
			const out = {};
			Object.keys(value).forEach((k) => {
				const v = prune(value[k]);
				if (v === undefined) return;
				if (
					v &&
					typeof v === "object" &&
					!Array.isArray(v) &&
					Object.keys(v).length === 0
				)
					return;
				out[k] = v;
			});
			return out;
		}
		return value;
	}

	// ---------- per-item (field-scoped) editor -----------------------------

	// Tracks the currently-open per-item overlay so we can close it before
	// opening another (or when clicking elsewhere).
	let _currentItemOverlay = null;

	// Records the id of the section most recently left/right-clicked, so that
	// createSection() can spawn the new section directly below it.
	let _lastAnchorSectionId = null;

	function deepClone(obj) {
		return JSON.parse(JSON.stringify(obj));
	}

	// Read a value at a dot-path (numeric segments = array indices).
	function getValueAtPath(obj, parts) {
		let cur = obj;
		for (const p of parts) {
			if (cur == null) return undefined;
			cur = cur[p];
		}
		return cur;
	}

	// Deep-set a value at a dot-path in a target object (creates intermediates).
	function setPathDeep(target, parts, value) {
		let cur = target;
		for (let i = 0; i < parts.length - 1; i++) {
			const k = parts[i];
			const nextK = parts[i + 1];
			const wantArray = /^\d+$/.test(nextK);
			if (cur[k] == null) cur[k] = wantArray ? [] : {};
			cur = cur[k];
		}
		const last = parts[parts.length - 1];
		cur[last] = value;
	}

	// Navigate a JSON schema along a dot-path, returning the sub-schema node
	// at the destination. Numeric segments traverse into `.items`.
	function navigateSchema(schemaJson, parts) {
		let cur = resolveSchema(schemaJson);
		for (let i = 0; i < parts.length; i++) {
			const p = parts[i];
			if (/^\d+$/.test(p)) {
				cur = resolveSchema(cur.items || cur);
			} else {
				cur = resolveSchema((cur.properties || {})[p]);
			}
		}
		return cur || {};
	}

	function closeItemEdit() {
		if (_currentItemOverlay) {
			_currentItemOverlay.remove();
			_currentItemOverlay = null;
		}
		$$(".is-item-editing").forEach((node) => {
			node.classList.remove("is-item-editing");
		});
	}

	/**
	 * openItemEdit(fieldEl)
	 * Opens a compact, scoped edit form for the single data-field path carried
	 * by fieldEl. Resolves the host section or product, fetches schema + data,
	 * renders a single-field or single-card form, and wires Cancel / Save /
	 * Appendix controls that merge (not replace) into the full data object.
	 */
	async function openItemEdit(fieldEl) {
		closeItemEdit();

		const path = fieldEl.getAttribute("data-field");
		if (!path) return;
		const parts = path.split(".");
		const lastKey = parts[parts.length - 1];

		// --- Resolve host (product card or section) ---
		const card = fieldEl.closest(".product-card[data-product-slug]");
		const sec = fieldEl.closest("[data-section-id]");
		const isProduct = !!card;

		let schemaId, hostId, hostSlug;
		let fullData, schemaRec, sectionTitle;
		let productName, productCategory, productStatus;

		if (isProduct) {
			hostSlug = card.getAttribute("data-product-slug");
			schemaId = "product";
		} else if (sec) {
			hostId = sec.getAttribute("data-section-id");
			schemaId = sec.getAttribute("data-schema");
		} else {
			return; // no host — nothing to edit
		}

		try {
			schemaRec = await getSchema(schemaId);
			if (isProduct) {
				const product = await api("GET", API.products + "/" + hostSlug);
				fullData = product.data || {};
				productName = product.name;
				productCategory = product.category;
				productStatus = product.status;
			} else {
				let section = null;
				if (window.AGF && window.AGF.state && window.AGF.state.sections) {
					section = window.AGF.state.sections.find((s) => s.id === hostId);
				}
				if (!section || !section.data) {
					section = await api("GET", API.sections + "/" + hostId);
				}
				fullData = section.data || {};
				sectionTitle = section.title;
			}
		} catch (err) {
			toast("Load failed: " + err.message, "error");
			return;
		}

		// --- Navigate schema to target ---
		// name/category/status are top-level DB columns on the products table,
		// not entries inside product.data. When editing one of these as a
		// root-level (single-segment) path on a product, resolve the schema and
		// value directly from the product root instead of navigating data.*
		var isProductTopLevel =
			isProduct &&
			parts.length === 1 &&
			(parts[0] === "name" || parts[0] === "category" || parts[0] === "status");

		var targetSchema;
		if (isProductTopLevel) {
			var rootProps = (schemaRec.schema_json || {}).properties || {};
			targetSchema = rootProps[parts[0]] || {};
		} else {
			targetSchema = navigateSchema(schemaRec.schema_json || {}, parts);
		}
		if (!targetSchema || !targetSchema.type) {
			toast("Cannot edit this field (no schema at path).", "error");
			return;
		}

		var resolvedTarget = resolveSchema(targetSchema);
		var currentValue;
		if (isProductTopLevel) {
			currentValue =
				parts[0] === "name"
					? productName
					: parts[0] === "category"
						? productCategory
						: productStatus;
		} else {
			currentValue = getValueAtPath(fullData, parts);
		}
		var isArrayItem = /^\d+$/.test(lastKey);

		// Determine where the appendix should be stored.
		// Array items store appendix on themselves (<path>.appendix).
		// Everything else stores on the host's top-level data.appendix.
		var appendixPathParts = isArrayItem
			? parts.concat(["appendix"])
			: ["appendix"];

		// Mark editing state
		fieldEl.classList.add("is-item-editing");

		// --- Build overlay ---
		var overlay = el("div", {
			class: "edit-form-overlay edit-form-overlay--item",
		});
		_currentItemOverlay = overlay;

		overlay.appendChild(el("h3", { text: "Edit \u00b7 " + humanize(lastKey) }));

		var formBody = el("div", { class: "edit-form-body" });
		currentEditCategory = isProduct ? "products" : "sections";
		currentEditSlug = isProduct ? hostSlug || "general" : schemaId || "section";

		// Render the form for just this path's schema
		if (
			(resolvedTarget.type === "object" || resolvedTarget.properties) &&
			resolvedTarget.type !== "string"
		) {
			// Object or card — render all sub-fields
			formBody.appendChild(
				generateForm(resolvedTarget, currentValue || {}, path),
			);
		} else {
			// Leaf scalar or string array item
			formBody.appendChild(
				renderField(lastKey, resolvedTarget, currentValue, path),
			);
		}
		overlay.appendChild(formBody);

		// --- Appendix field (collapsed by default) ---
		var existingAppendix = getValueAtPath(fullData, appendixPathParts);
		var appendixWrap = el("div", {
			class: "appendix-field appendix-field--item",
		});
		var appendixContent = el("div", {
			class: "appendix-content",
			style: "display:none",
		});

		var appendixToggle = el("button", {
			type: "button",
			class: "appendix-toggle-btn",
			text: "Appendix \u25be",
			onClick: () => {
				var open = appendixContent.style.display === "none";
				appendixContent.style.display = open ? "block" : "none";
				appendixToggle.textContent = open
					? "Appendix \u25b4"
					: "Appendix \u25be";
			},
		});
		appendixWrap.appendChild(appendixToggle);

		var appendixTA = el("textarea", {
			placeholder:
				"Add notes, thoughts, supporting detail for the appendix\u2026",
		});
		appendixTA.value = existingAppendix || "";
		appendixContent.appendChild(appendixTA);

		var appendixActions = el("div", { class: "appendix-actions" });
		appendixActions.appendChild(
			el("button", {
				type: "button",
				class: "btn-apx-cancel",
				text: "Cancel",
				onClick: () => {
					appendixTA.value = "";
				},
			}),
		);
		appendixActions.appendChild(
			el("button", {
				type: "button",
				class: "btn-apx-publish",
				text: "Publish to Appendix",
				onClick: () => {
					performSave(true);
				},
			}),
		);
		appendixContent.appendChild(appendixActions);
		appendixWrap.appendChild(appendixContent);
		overlay.appendChild(appendixWrap);

		// --- Actions: Cancel + Save ---
		overlay.appendChild(
			buildActions(
				() => {
					performSave(false);
				},
				() => {
					closeItemEdit();
				},
			),
		);

		// Position the overlay near the clicked element
		var rect = fieldEl.getBoundingClientRect();
		overlay.style.position = "fixed";
		overlay.style.top = Math.max(8, rect.top - 8) + "px";
		overlay.style.left =
			Math.min(window.innerWidth - 440, rect.right + 12) + "px";

		document.body.appendChild(overlay);

		// Adjust if it goes off the bottom
		requestAnimationFrame(() => {
			var oRect = overlay.getBoundingClientRect();
			if (oRect.bottom > window.innerHeight) {
				overlay.style.top =
					Math.max(8, window.innerHeight - oRect.height - 8) + "px";
			}
			overlay.scrollIntoView({ behavior: "smooth", block: "center" });
		});

		// --- Core save logic (shared by Save and Publish-to-Appendix) ---
		async function performSave(withAppendix) {
			try {
				// skipPrune=true: preserve sparse array indices so getValueAtPath
				// resolves the edited element (e.g. tenets.3). Pruning would compact
				// [,,,{x}]→[{x}] and lose the index, silently skipping the merge.
				var collected = collectForm(formBody, true);
				var merged = deepClone(fullData);

				// Extract the collected value at the target path
				var collectedValue = getValueAtPath(collected, parts);

				if (isProductTopLevel) {
					// Route name/category/status to the top-level product columns,
					// never into data. data stays as a pristine deep-clone of product.data.
					if (collectedValue !== undefined && collectedValue !== "") {
						if (parts[0] === "name") productName = collectedValue;
						else if (parts[0] === "category") productCategory = collectedValue;
						else if (parts[0] === "status") productStatus = collectedValue;
					}
				} else {
					// Merge into the clone based on target type.
					// collectedValue may be '' (explicit clear) — only skip if truly undefined
					// (field was not in the form at all, e.g. hidden upload with no change).
					if (collectedValue !== undefined) {
						if (resolvedTarget.type === "object" || resolvedTarget.properties) {
							// Object/card — merge sparse collected into existing
							var existing = getValueAtPath(merged, parts) || {};
							setPathDeep(
								merged,
								parts,
								Object.assign({}, existing, collectedValue),
							);
						} else {
							// Leaf scalar (string, number, etc.)
							setPathDeep(merged, parts, collectedValue);
						}
					}
				}

				// Preserve convention fields on the host data
				if (!isProduct) {
					if (fullData._style_overrides)
						merged._style_overrides = fullData._style_overrides;
					if (fullData._background_image)
						merged._background_image = fullData._background_image;
					if (fullData._background_settings)
						merged._background_settings = fullData._background_settings;
				}

				// Convention arrays (_texts, _figures) are managed by dedicated UIs
				// (context-menu insert, drag/resize, inline edit). If the current edit
				// path does NOT target one of these arrays, delete the stale snapshot
				// from `merged` so reconcileConventionFields backfills the FRESH version
				// from the server — preventing a stale overwrite of width/position/etc.
				if (!isProduct) {
					if (parts[0] !== "_texts") delete merged._texts;
					if (parts[0] !== "_figures") delete merged._figures;
				}

				// Set appendix if requested
				if (withAppendix) {
					var apxText = appendixTA.value.trim();
					if (apxText) {
						setPathDeep(merged, appendixPathParts, apxText);
					}
				}

				// B1: FRESH-GET reconcile — guarantee persisted convention fields
				// survive even if fullData (captured at form-open) was stale. The DB
				// is ground truth; only fill fields that `merged` LACKS so the user's
				// current edit always wins. A failed reconcile GET must NOT silently
				// proceed (that would risk clobbering a persisted override).
				merged = await reconcileConventionFields(
					isProduct ? "product" : "section",
					isProduct ? hostSlug : hostId,
					merged,
				);

				// Send PUT
				if (isProduct) {
					await api("PUT", API.products + "/" + hostSlug, {
						name: productName,
						category: productCategory,
						status: productStatus,
						data: merged,
					});
					closeItemEdit();
					toast("Saved.", "success");
					if (window.AGF && window.AGF.refreshProducts) {
						await window.AGF.refreshProducts();
					}
				} else {
					await api("PUT", API.sections + "/" + hostId, {
						data: merged,
						title: sectionTitle,
					});
					closeItemEdit();
					toast("Saved.", "success");
					await refreshAfterEdit(hostId, schemaId);
				}
			} catch (err) {
				toast("Save failed: " + err.message, "error");
			}
		}
	}

	// ---------- click-to-edit -----------------------------------------------
	function shouldTriggerEdit(e) {
		return !e.target.closest(
			'button, a, input, select, textarea, [role="button"], ' +
				".product-expand-btn, .pdf-download-btn, .compare-toggle-btn, " +
				".cmp-card-check, .pspec-group-head, .appendix-ref, .btn, svg, canvas, [data-chart], " +
				".enhance-panel, .section-context-menu",
		);
	}

	function handleClickToEdit(e) {
		// Per-item edit: check for data-field FIRST (before section/product fallback).
		// Skip if the click is on an appendix-ref (those open the appendix popup
		// via app.js) or on excluded interactive elements.
		if (!e.target.closest(".appendix-ref") && shouldTriggerEdit(e)) {
			var fieldEl = e.target.closest("[data-field]");
			if (
				fieldEl &&
				!fieldEl.classList.contains("is-item-editing") &&
				!_currentItemOverlay
			) {
				var anchorSec = fieldEl.closest("[data-section-id]");
				if (anchorSec)
					_lastAnchorSectionId = anchorSec.getAttribute("data-section-id");
				openItemEdit(fieldEl);
				return;
			}
		}
		// Close any open item editor on clicks outside it
		if (_currentItemOverlay && !e.target.closest(".edit-form-overlay--item")) {
			closeItemEdit();
		}
		// Product card: left-click opens in-place edit
		const card = e.target.closest(".product-card");
		if (card) {
			if (!shouldTriggerEdit(e)) return;
			if (card.classList.contains("is-editing")) return;
			var cardSec = card.closest("[data-section-id]");
			if (cardSec)
				_lastAnchorSectionId = cardSec.getAttribute("data-section-id");
			const slug = card.getAttribute("data-product-slug");
			const productsSection = $("#products");
			if (slug && productsSection) openProductForm(slug, productsSection, card);
			return;
		}
		// Header / Footer inner containers
		const structural = e.target.closest(
			".nav-inner[data-section-id], .foot-inner[data-section-id]",
		);
		if (structural) {
			if (!shouldTriggerEdit(e)) return;
			if (structural.classList.contains("is-editing")) return;
			_lastAnchorSectionId = structural.getAttribute("data-section-id");
			toast(
				"Click a specific item to edit it — or right-click → ✏️ Edit all fields.",
				"info",
			);
			return;
		}
		// Section: left-click on empty chrome shows a hint instead of the full form
		const sec = e.target.closest("[data-section-id]");
		if (sec) {
			if (!shouldTriggerEdit(e)) return;
			if (sec.classList.contains("is-editing")) return;
			_lastAnchorSectionId = sec.getAttribute("data-section-id");
			toast(
				"Click a specific item to edit it — or right-click → ✏️ Edit all fields.",
				"info",
			);
		}
	}

	function bindClickToEdit() {
		const app = $("#app");
		if (!app) return;
		app.removeEventListener("click", handleClickToEdit);
		app.addEventListener("click", handleClickToEdit);
		// Also bind on header and footer containers for schema-driven editing
		const nav = $("header.nav");
		if (nav) {
			nav.removeEventListener("click", handleClickToEdit);
			nav.addEventListener("click", handleClickToEdit);
		}
		const foot = $("footer.foot");
		if (foot) {
			foot.removeEventListener("click", handleClickToEdit);
			foot.addEventListener("click", handleClickToEdit);
		}
	}

	// ---------- context menu (right-click) -----------------------------------
	function removeContextMenu() {
		const menu = document.querySelector(".section-context-menu");
		if (menu) menu.remove();
	}

	function menuBtn(text, onClick, extraClass) {
		return el("button", {
			type: "button",
			class: extraClass || null,
			text,
			onClick: (e) => {
				e.stopPropagation();
				onClick();
			},
		});
	}

	// Tracks the element that was right-clicked, for use by Text Enhance
	let _contextTarget = null;

	function handleContextMenu(e) {
		// FIGURE right-click (option B wave 3): if the click landed on a rendered
		// <figure data-figure-id>, show a figure-specific Adjust/Remove menu
		// INSTEAD of the section menu. Resolve the host section from the figure's
		// nearest [data-section-id] ancestor for the persist calls.
		const figureEl = e.target.closest("figure[data-figure-id]");
		if (figureEl) {
			const figureHost = figureEl.closest("[data-section-id]");
			if (figureHost) {
				e.preventDefault();
				removeContextMenu();
				_contextTarget = e.target;
				_lastAnchorSectionId = figureHost.getAttribute("data-section-id");
				var figureId = figureEl.getAttribute("data-figure-id");
				var fSectionId = figureHost.getAttribute("data-section-id");
				var fSchemaId = figureHost.getAttribute("data-schema") || "general";
				// Look up the live figure object from in-memory section state so the
				// Adjust popover can be pre-filled (placement/size/caption/src).
				// Also capture the full _figures array for the Move Earlier/Later
				// guards (count + index). In-memory state is sufficient for the UX
				// decision; the actual swap fresh-GETs for correctness.
				var existingFigure = null;
				var figArray = null;
				var figIndex = -1;
				if (window.AGF && window.AGF.state && window.AGF.state.sections) {
					var sec0 = window.AGF.state.sections.find((s) => s.id === fSectionId);
					var arr =
						sec0 && sec0.data && Array.isArray(sec0.data._figures)
							? sec0.data._figures
							: null;
					if (arr) {
						figArray = arr;
						figIndex = arr.findIndex((f) => f.id === figureId);
						if (figIndex >= 0) existingFigure = arr[figIndex];
					}
				}
				const fmenu = el("div", { class: "section-context-menu" });
				fmenu.appendChild(
					menuBtn("✏️ Adjust Figure", async () => {
						removeContextMenu();
						// If the live figure wasn't in in-memory state, fresh-GET the
						// section so the Adjust popover is pre-filled (never silently
						// degrade into insert mode).
						var fig = existingFigure;
						if (!fig) {
							try {
								var fresh = await api("GET", API.sections + "/" + fSectionId);
								var farr =
									fresh && fresh.data && Array.isArray(fresh.data._figures)
										? fresh.data._figures
										: null;
								if (farr) fig = farr.find((f) => f.id === figureId) || null;
							} catch (e2) {
								/* fall through; toast below */
							}
						}
						if (!fig) {
							toast(
								"Could not load the figure for editing (try refreshing the page).",
								"error",
							);
							return;
						}
						openFigurePanel(figureHost, fig);
					}),
				);
				// Move Earlier/Later (option B wave 4): visible only when the section
				// has 2+ figures. First figure can't move earlier, last can't move
				// later — those entries are omitted rather than greyed out.
				if (figArray && figArray.length >= 2) {
					if (figIndex > 0) {
						fmenu.appendChild(
							menuBtn("↑ Move Figure Earlier", () => {
								removeContextMenu();
								moveFigure(fSectionId, fSchemaId, figureId, -1);
							}),
						);
					}
					if (figIndex >= 0 && figIndex < figArray.length - 1) {
						fmenu.appendChild(
							menuBtn("↓ Move Figure Later", () => {
								removeContextMenu();
								moveFigure(fSectionId, fSchemaId, figureId, 1);
							}),
						);
					}
				}
				fmenu.appendChild(
					menuBtn(
						"🗑 Remove Figure",
						() => {
							removeContextMenu();
							confirmDialog(
								"Remove this figure?",
								"The image will be detached from the section and its file deleted.",
								"Remove",
								() => removeFigure(fSectionId, fSchemaId, figureId),
							);
						},
						"danger",
					),
				);
				// Nudge: available when right-click target is inside a [data-field]
				var _nudgeFieldEl = e.target.closest("[data-field]");
				if (_nudgeFieldEl) {
					fmenu.appendChild(
						menuBtn("📐 Nudge position", () => {
							removeContextMenu();
							openNudgePanel(_nudgeFieldEl, figureHost);
						}),
					);
				}
				positionMenu(fmenu, e);
				return;
			}
		}
		// Product card right-click: Edit + Insert Image + Text Enhance + Delete
		const card = e.target.closest(".product-card");
		if (card) {
			const slug = card.getAttribute("data-product-slug");
			if (slug) {
				e.preventDefault();
				removeContextMenu();
				_contextTarget = e.target;
				var cardAnchor = card.closest("[data-section-id]");
				if (cardAnchor)
					_lastAnchorSectionId = cardAnchor.getAttribute("data-section-id");
				const menu = el("div", { class: "section-context-menu" });
				menu.appendChild(
					menuBtn("✏️ Edit", () => {
						removeContextMenu();
						const ps = $("#products");
						if (ps) openProductForm(slug, ps, card);
					}),
				);
				menu.appendChild(
					menuBtn("🖼 Background Image…", () => {
						removeContextMenu();
						insertBackgroundImage(null, slug, card);
					}),
				);
				if (card.hasAttribute("data-bg-image")) {
					menu.appendChild(
						menuBtn("🎨 Adjust Background", () => {
							removeContextMenu();
							openBgSettingsPanel(card);
						}),
					);
				}
				menu.appendChild(
					menuBtn("✨ Text Enhance", () => {
						removeContextMenu();
						openEnhancePanel(_contextTarget, card);
					}),
				);
				// Nudge: available when right-click target is inside a [data-field]
				var _nudgeFieldProd = e.target.closest("[data-field]");
				if (_nudgeFieldProd) {
					menu.appendChild(
						menuBtn("📐 Nudge position", () => {
							removeContextMenu();
							openNudgePanel(_nudgeFieldProd, card);
						}),
					);
				}
				menu.appendChild(
					menuBtn(
						"🗑 Delete",
						() => {
							removeContextMenu();
							confirmDeleteProduct(slug);
						},
						"danger",
					),
				);
				positionMenu(menu, e);
				return;
			}
		}
		// Header / Footer right-click: Edit + Insert Image + Text Enhance
		const structural = e.target.closest(
			".nav-inner[data-section-id], .foot-inner[data-section-id]",
		);
		if (structural) {
			e.preventDefault();
			removeContextMenu();
			_contextTarget = e.target;
			_lastAnchorSectionId = structural.getAttribute("data-section-id");
			const menu = el("div", { class: "section-context-menu" });
			menu.appendChild(
				menuBtn("✏️ Edit", () => {
					removeContextMenu();
					openSectionEdit(structural);
				}),
			);
			menu.appendChild(
				menuBtn("🖼 Background Image…", () => {
					removeContextMenu();
					insertBackgroundImage(structural, null, null);
				}),
			);
			if (structural.hasAttribute("data-bg-image")) {
				menu.appendChild(
					menuBtn("🎨 Adjust Background", () => {
						removeContextMenu();
						openBgSettingsPanel(structural);
					}),
				);
			}
			menu.appendChild(
				menuBtn("✨ Text Enhance", () => {
					removeContextMenu();
					openEnhancePanel(_contextTarget, structural);
				}),
			);
			// Nudge: available when right-click target is inside a [data-field]
			var _nudgeFieldStruct = e.target.closest("[data-field]");
			if (_nudgeFieldStruct) {
				menu.appendChild(
					menuBtn("📐 Nudge position", () => {
						removeContextMenu();
						openNudgePanel(_nudgeFieldStruct, structural);
					}),
				);
			}
			positionMenu(menu, e);
			return;
		}
		// Prelude square right-click: offer Remove Image / Change Image when the
		// square has a background-image, or Add Image if it doesn't.
		const preludeSquare = e.target.closest(".prelude-square");
		if (preludeSquare) {
			const preludeSec = preludeSquare.closest("[data-section-id]");
			if (preludeSec) {
				e.preventDefault();
				removeContextMenu();
				_contextTarget = e.target;
				_lastAnchorSectionId = preludeSec.getAttribute("data-section-id");
				const squareField = preludeSquare.getAttribute("data-field") || "";
				const squareIdx = parseInt(squareField.replace("squares.", ""), 10);
				const hasImage =
					preludeSquare.style.backgroundImage &&
					preludeSquare.style.backgroundImage !== "none" &&
					preludeSquare.style.backgroundImage !== "";
				const pmenu = el("div", { class: "section-context-menu" });

				// Upload / change image
				pmenu.appendChild(
					menuBtn(
						hasImage ? "🖼 Change Square Image…" : "🖼 Add Square Image…",
						() => {
							removeContextMenu();
							const fileInput = document.createElement("input");
							fileInput.type = "file";
							fileInput.accept = "image/*";
							fileInput.style.display = "none";
							document.body.appendChild(fileInput);
							fileInput.addEventListener("change", async () => {
								const file = fileInput.files[0];
								if (!file) {
									fileInput.remove();
									return;
								}
								const formData = new FormData();
								formData.append("category", "sections");
								formData.append("slug", "prelude");
								formData.append("spec", "square-" + squareIdx);
								formData.append("file", file);
								try {
									const uploadRes = await fetch("/api/upload", {
										method: "POST",
										body: formData,
									});
									const uploadData = await uploadRes.json();
									if (!uploadRes.ok)
										throw new Error(uploadData.error || "Upload failed");
									const imgPath = uploadData.relativePath;
									// Update section data
									const sid = preludeSec.getAttribute("data-section-id");
									const schemaId =
										preludeSec.getAttribute("data-schema") || "prelude";
									const section = await api("GET", API.sections + "/" + sid);
									var sData = section.data ? deepClone(section.data) : {};
									if (!Array.isArray(sData.squares))
										sData.squares = [{}, {}, {}];
									while (sData.squares.length <= squareIdx)
										sData.squares.push({});
									sData.squares[squareIdx].image = imgPath;
									sData = await reconcileConventionFields(
										"section",
										sid,
										sData,
									);
									await api("PUT", API.sections + "/" + sid, {
										data: sData,
										title: section.title,
									});
									toast("Square image updated.", "success");
									await refreshAfterEdit(sid, schemaId);
								} catch (err) {
									toast("Square image upload failed: " + err.message, "error");
								}
								fileInput.remove();
							});
							fileInput.click();
						},
					),
				);

				// Adjust image settings (only when there IS an image)
				if (hasImage) {
					pmenu.appendChild(
						menuBtn("🖼️ Adjust Image", () => {
							removeContextMenu();
							openImageAdjustPanel(preludeSquare);
						}),
					);
				}

				// Remove image (only when there IS an image)
				if (hasImage) {
					pmenu.appendChild(
						menuBtn(
							"🗑 Remove Square Image",
							() => {
								removeContextMenu();
								confirmDialog(
									"Remove square image?",
									"The image will be removed from this prelude square.",
									"Remove",
									async () => {
										try {
											const sid = preludeSec.getAttribute("data-section-id");
											const schemaId =
												preludeSec.getAttribute("data-schema") || "prelude";
											const section = await api(
												"GET",
												API.sections + "/" + sid,
											);
											var sData = section.data ? deepClone(section.data) : {};
											if (
												Array.isArray(sData.squares) &&
												sData.squares[squareIdx]
											) {
												var oldSrc = sData.squares[squareIdx].image || null;
												sData.squares[squareIdx].image = "";
												sData = await reconcileConventionFields(
													"section",
													sid,
													sData,
												);
												await api("PUT", API.sections + "/" + sid, {
													data: sData,
													title: section.title,
												});
												toast("Square image removed.", "success");
												await refreshAfterEdit(sid, schemaId);
												if (oldSrc) await deleteUploadedAsset(oldSrc);
											}
										} catch (err) {
											toast("Remove failed: " + err.message, "error");
										}
									},
								);
							},
							"danger",
						),
					);
				}

				// Text Enhance on the square text
				pmenu.appendChild(
					menuBtn("✨ Text Enhance", () => {
						removeContextMenu();
						openEnhancePanel(_contextTarget, preludeSec);
					}),
				);
				// Nudge: available when right-click target is inside a [data-field]
				var _nudgeFieldPrelude = e.target.closest("[data-field]");
				if (_nudgeFieldPrelude) {
					pmenu.appendChild(
						menuBtn("📐 Nudge position", () => {
							removeContextMenu();
							openNudgePanel(_nudgeFieldPrelude, preludeSec);
						}),
					);
				}

				positionMenu(pmenu, e);
				return;
			}
		}
		// Section right-click: Edit, Insert Image, Text Enhance, Visibility, Reorder, Delete
		const sec = e.target.closest("[data-section-id]");
		if (!sec) return;
		e.preventDefault();
		removeContextMenu();
		_contextTarget = e.target;
		_lastAnchorSectionId = sec.getAttribute("data-section-id");

		const menu = el("div", { class: "section-context-menu" });
		menu.appendChild(
			menuBtn("✏️ Edit", () => {
				removeContextMenu();
				openSectionEdit(sec);
			}),
		);
		menu.appendChild(
			menuBtn("🖼 Background Image…", () => {
				removeContextMenu();
				insertBackgroundImage(sec, null, null);
			}),
		);
		menu.appendChild(
			menuBtn("🖼 Inline Figure…", () => {
				removeContextMenu();
				insertFigure(sec);
			}),
		);
		menu.appendChild(
			menuBtn("📝 Insert Text", () => {
				removeContextMenu();
				insertText(sec, e);
			}),
		);
		if (sec.hasAttribute("data-bg-image")) {
			menu.appendChild(
				menuBtn("🎨 Adjust Background", () => {
					removeContextMenu();
					openBgSettingsPanel(sec);
				}),
			);
		}
		// Show Remove Figure option if section has inline figures — more
		// discoverable than requiring a right-click directly on the figure.
		var _secFigures = null;
		var _secId = sec.getAttribute("data-section-id");
		if (window.AGF && window.AGF.state && window.AGF.state.sections) {
			var _secState = window.AGF.state.sections.find((s) => s.id === _secId);
			if (
				_secState &&
				_secState.data &&
				Array.isArray(_secState.data._figures) &&
				_secState.data._figures.length
			) {
				_secFigures = _secState.data._figures;
			}
		}
		if (_secFigures && _secFigures.length) {
			var _fSchemaId = sec.getAttribute("data-schema") || "general";
			_secFigures.forEach((fig, idx) => {
				var figLabel =
					fig.caption || fig.src.split("/").pop() || "Figure " + (idx + 1);
				menu.appendChild(
					menuBtn(
						"🗑 Remove: " + figLabel,
						() => {
							removeContextMenu();
							confirmDialog(
								"Remove this figure?",
								'The image "' +
									figLabel +
									'" will be detached and its file deleted.',
								"Remove",
								() => removeFigure(_secId, _fSchemaId, fig.id),
							);
						},
						"danger",
					),
				);
			});
		}
		menu.appendChild(
			menuBtn("✨ Text Enhance", () => {
				removeContextMenu();
				openEnhancePanel(_contextTarget, sec);
			}),
		);
		// Nudge: available when right-click target is inside a [data-field]
		var _nudgeFieldSec = e.target.closest("[data-field]");
		if (_nudgeFieldSec) {
			menu.appendChild(
				menuBtn("📐 Nudge position", () => {
					removeContextMenu();
					openNudgePanel(_nudgeFieldSec, sec);
				}),
			);
		}
		menu.appendChild(
			menuBtn("👁 Toggle Visibility", () => {
				removeContextMenu();
				toggleVisibility(sec);
			}),
		);
		// Move Up / Move Down — disabled at boundaries
		const _moveId = sec.getAttribute("data-section-id");
		const _moveSections =
			(window.AGF && window.AGF.state && window.AGF.state.sections) || [];
		const _moveSorted = _moveSections
			.slice()
			.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
		const _moveIdx = _moveSorted.findIndex((x) => x.id === _moveId);
		const _isFirst = _moveIdx <= 0;
		const _isLast = _moveIdx >= _moveSorted.length - 1;
		const moveUpBtn = menuBtn("⬆ Move Up", () => {
			removeContextMenu();
			reorderSection(sec, -1);
		});
		if (_isFirst) {
			moveUpBtn.disabled = true;
			moveUpBtn.style.opacity = "0.4";
			moveUpBtn.style.pointerEvents = "none";
		}
		menu.appendChild(moveUpBtn);
		const moveDownBtn = menuBtn("⬇ Move Down", () => {
			removeContextMenu();
			reorderSection(sec, 1);
		});
		if (_isLast) {
			moveDownBtn.disabled = true;
			moveDownBtn.style.opacity = "0.4";
			moveDownBtn.style.pointerEvents = "none";
		}
		menu.appendChild(moveDownBtn);
		menu.appendChild(
			menuBtn(
				"🗑 Delete",
				() => {
					removeContextMenu();
					confirmDeleteSection(sec);
				},
				"danger",
			),
		);
		positionMenu(menu, e);
	}

	function positionMenu(menu, e) {
		menu.style.left = e.clientX + "px";
		menu.style.top = e.clientY + "px";
		document.body.appendChild(menu);
		const rect = menu.getBoundingClientRect();
		if (rect.right > window.innerWidth)
			menu.style.left = window.innerWidth - rect.width - 8 + "px";
		if (rect.bottom > window.innerHeight)
			menu.style.top = window.innerHeight - rect.height - 8 + "px";
		// Close on any outside click
		setTimeout(() => {
			document.addEventListener("click", function onDocClick() {
				removeContextMenu();
				document.removeEventListener("click", onDocClick);
			});
		}, 0);
	}

	function bindContextMenu() {
		const app = $("#app");
		if (!app) return;
		app.removeEventListener("contextmenu", handleContextMenu);
		app.addEventListener("contextmenu", handleContextMenu);
		// Also bind on header and footer containers
		const nav = $("header.nav");
		if (nav) {
			nav.removeEventListener("contextmenu", handleContextMenu);
			nav.addEventListener("contextmenu", handleContextMenu);
		}
		const foot = $("footer.foot");
		if (foot) {
			foot.removeEventListener("contextmenu", handleContextMenu);
			foot.addEventListener("contextmenu", handleContextMenu);
		}
	}

	// ---------- nav add-section button ----------------------------------------
	function injectAddButton() {
		const nav =
			document.getElementById("navRight") ||
			document.querySelector(".nav-inner");
		if (!nav || nav.querySelector(".nav-add-btn")) return;
		const secBtn = el("button", {
			type: "button",
			class: "nav-add-btn",
			text: "+ Section",
			onClick: (e) => openSchemaPicker(e.currentTarget),
		});
		nav.appendChild(secBtn);
		const prodBtn = el("button", {
			type: "button",
			class: "nav-add-btn",
			text: "+ Product",
			onClick: () => {
				const ps = $("#products");
				if (ps) openProductForm(null, ps);
			},
		});
		nav.appendChild(prodBtn);
	}

	async function toggleVisibility(sec) {
		const id = sec.getAttribute("data-section-id");
		try {
			const r = await api("PATCH", API.sections + "/" + id + "/visibility");
			// sync window.AGF.state
			if (window.AGF && window.AGF.state) {
				const st = window.AGF.state.sections.find((x) => x.id === id);
				if (st) st.is_visible = r.is_visible;
			}
			toast(r.is_visible ? "Section visible." : "Section hidden.", "success");
			// Re-render so hidden sections are removed from / kept in the DOM
			if (window.AGF && window.AGF.refreshAll) {
				await window.AGF.refreshAll();
			}
		} catch (err) {
			toast("Visibility failed: " + err.message, "error");
		}
	}

	async function reorderSection(sec, dir) {
		const id = sec.getAttribute("data-section-id");
		const sections =
			(window.AGF && window.AGF.state && window.AGF.state.sections) || [];
		const me = sections.find((x) => x.id === id);
		if (!me) return;
		const sorted = sections
			.slice()
			.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
		const idx = sorted.findIndex((x) => x.id === id);
		const swap = sorted[idx + dir];
		if (!swap) return;

		try {
			// Fresh-GET both sections so we swap using ground-truth display_order
			// from the DB, not potentially-stale in-memory state.
			var [meFresh, swapFresh] = await Promise.all([
				api("GET", API.sections + "/" + me.id),
				api("GET", API.sections + "/" + swap.id),
			]);
			var myOrder =
				meFresh && typeof meFresh.display_order === "number"
					? meFresh.display_order
					: me.display_order || 0;
			var swapOrder =
				swapFresh && typeof swapFresh.display_order === "number"
					? swapFresh.display_order
					: swap.display_order || 0;

			await Promise.all([
				api("PATCH", API.sections + "/" + me.id + "/order", {
					display_order: swapOrder,
				}),
				api("PATCH", API.sections + "/" + swap.id + "/order", {
					display_order: myOrder,
				}),
			]);
			me.display_order = swapOrder;
			swap.display_order = myOrder;
			toast("Order updated.", "success");
			if (window.AGF && window.AGF.refreshAll) {
				await window.AGF.refreshAll();
			}
		} catch (err) {
			toast("Reorder failed: " + err.message, "error");
		}
	}

	function confirmDeleteSection(sec) {
		const id = sec.getAttribute("data-section-id");
		const schema = sec.getAttribute("data-schema") || "section";
		confirmDialog(
			"Delete this section?",
			"Schema: " + schema + ". This cannot be undone.",
			"Delete",
			async () => {
				try {
					await api("DELETE", API.sections + "/" + id);
					toast("Section deleted.", "success");
					if (window.AGF && window.AGF.refreshAll) {
						await window.AGF.refreshAll();
					}
				} catch (err) {
					toast("Delete failed: " + err.message, "error");
				}
			},
		);
	}

	// ---------- insert background image (context menu) -----------------------
	/**
	 * insertBackgroundImage(sectionEl, productSlug, productCard)
	 * Opens a file picker, uploads the chosen image, stores the path as
	 * _background_image in the section/product data, and applies it immediately
	 * as a CSS background on the target element.
	 */
	function insertBackgroundImage(sectionEl, productSlug, productCard) {
		const fileInput = document.createElement("input");
		fileInput.type = "file";
		fileInput.accept = "image/*";
		fileInput.style.display = "none";
		document.body.appendChild(fileInput);

		fileInput.addEventListener("change", async () => {
			const file = fileInput.files[0];
			fileInput.remove();
			if (!file) return;

			// Upload
			const formData = new FormData();
			const category = productSlug ? "products" : "sections";
			const slug =
				productSlug ||
				(sectionEl && sectionEl.getAttribute("data-schema")) ||
				"general";
			formData.append("category", category);
			formData.append("slug", slug);
			formData.append("spec", "background");
			formData.append("file", file);

			try {
				const res = await fetch("/api/upload", {
					method: "POST",
					body: formData,
				});
				const data = await res.json();
				if (!data || !data.success) {
					toast((data && data.error) || "Upload failed", "error");
					return;
				}
				const imagePath = data.relativePath;

				if (productSlug && productCard) {
					// Store on product data
					const product = await api("GET", API.products + "/" + productSlug);
					const productData =
						product && product.data ? { ...product.data } : {};
					productData._background_image = imagePath;
					await api("PUT", API.products + "/" + productSlug, {
						name: product.name,
						category: product.category,
						status: product.status,
						data: productData,
					});
					// Apply immediately on the card element
					applyBackgroundImage(productCard, imagePath);
					toast("Background image set.", "success");
				} else if (sectionEl) {
					// Store on section data
					const id = sectionEl.getAttribute("data-section-id");
					const section = await api("GET", API.sections + "/" + id);
					const sectionData =
						section && section.data ? { ...section.data } : {};
					sectionData._background_image = imagePath;
					await api("PUT", API.sections + "/" + id, {
						data: sectionData,
						title: section.title,
					});
					// Apply immediately on the section element
					applyBackgroundImage(sectionEl, imagePath);
					toast("Background image set.", "success");
				}
			} catch (err) {
				toast("Image insert failed: " + err.message, "error");
			}
		});

		fileInput.click();
	}

	// Apply a background image to a DOM element with the overlay pattern
	function applyBackgroundImage(el, imagePath) {
		if (!el) return;
		el.setAttribute("data-bg-image", imagePath);
		el.style.backgroundImage = `url('${imagePath}')`;
		el.style.backgroundSize = "cover";
		el.style.backgroundPosition = "center";
	}

	// ---------- insert / adjust / remove figures (option B wave 2+3) --------
	/**
	 * insertFigure(sectionEl)
	 * Thin wrapper: opens the shared figure panel in INSERT mode (no existing
	 * figure, file required). Kept as the context-menu entry point so the
	 * section-menu call site is unchanged from Wave 2.
	 */
	// --- Shared helpers used by the inline-figure + image-asset paths. ---
	// (These were originally inside the team-note canvas region; when that was
	//  removed they survived here because the figure/upload code still needs them.)
	function shortId() {
		return (
			"b_" +
			Date.now().toString(36) +
			"_" +
			Math.random().toString(36).slice(2, 6)
		);
	}

	/**
	 * Best-effort cleanup of an uploaded asset via the DELETE /api/upload endpoint
	 * (locked-down: path allowlist + containment check). Used on figure
	 * replace/remove and on save-failure so no orphaned files accumulate.
	 * Never throws — failures are warned and swallowed (cleanup is best-effort).
	 */
	async function deleteUploadedAsset(relativePath) {
		if (!relativePath) return;
		try {
			await api(
				"DELETE",
				"/api/upload?path=" + encodeURIComponent(relativePath),
			);
		} catch (e) {
			console.warn("[agf] failed to clean up orphaned upload", relativePath, e);
		}
	}

	function insertFigure(sectionEl) {
		openFigurePanel(sectionEl, null);
	}

	// ---------- insert text (context menu) -----------------------------------
	/**
	 * insertText(sectionEl)
	 * Prompts for text content, then persists it as an entry in section.data._texts.
	 * Each entry has a stable id, content string, and optional style overrides.
	 * The click-to-edit system picks it up via the data-field="_texts.N.content"
	 * attribute emitted by the renderer.
	 */
	function insertText(sectionEl, evt) {
		var text = prompt("Enter text to insert:");
		if (!text || !text.trim()) return;
		var sid = sectionEl.getAttribute("data-section-id");
		var schemaId = sectionEl.getAttribute("data-schema");
		if (!sid) {
			toast("Missing section ID.", "error");
			return;
		}
		// Calculate percentage-based position relative to the section container
		var position = null;
		if (evt && sectionEl.getBoundingClientRect) {
			var rect = sectionEl.getBoundingClientRect();
			var pctX = Math.max(
				0,
				Math.min(100, ((evt.clientX - rect.left) / rect.width) * 100),
			);
			var pctY = Math.max(
				0,
				Math.min(100, ((evt.clientY - rect.top) / rect.height) * 100),
			);
			position = {
				top: Math.round(pctY * 10) / 10,
				left: Math.round(pctX * 10) / 10,
			};
		}
		saveInsertedText(sid, schemaId, {
			id: "txt-" + Date.now(),
			content: text.trim(),
			position: position,
		});
	}

	/**
	 * saveInsertedText(sectionId, schemaId, textObj)
	 * Fresh-GETs the section, appends/upserts the text entry in data._texts,
	 * PUTs back, and refreshes.
	 */
	async function saveInsertedText(sectionId, schemaId, textObj) {
		var section = await api("GET", API.sections + "/" + sectionId);
		var sData = section.data ? deepClone(section.data) : {};
		var texts = Array.isArray(sData._texts) ? sData._texts.slice() : [];
		var idx = texts.findIndex((t) => t.id === textObj.id);
		if (idx >= 0) {
			texts[idx] = textObj;
		} else {
			texts.push(textObj);
		}
		sData._texts = texts;
		sData = await reconcileConventionFields("section", sectionId, sData);
		await api("PUT", API.sections + "/" + sectionId, {
			data: sData,
			title: section.title,
		});
		toast(idx >= 0 ? "Text updated." : "Text inserted.", "success");
		await refreshAfterEdit(sectionId, schemaId);
	}

	// ---------- drag-to-reposition inserted text ---------------------------------
	/**
	 * bindInsertedTextDrag()
	 * Makes .inserted-text elements draggable via mousedown/mousemove/mouseup.
	 * On drop, persists the new position (percentage-based) to the server.
	 */
	function bindInsertedTextDrag() {
		var app = document.getElementById("app");
		if (!app) return;
		app.removeEventListener("mousedown", _handleInsertedTextDragStart);
		app.addEventListener("mousedown", _handleInsertedTextDragStart);
	}

	var _itDrag = null; // active drag state

	function _handleInsertedTextDragStart(e) {
		// Skip if click is on the resize handle
		if (e.target.closest(".it-resize-handle")) return;
		var target = e.target.closest(".inserted-text");
		if (!target) return;
		// Only drag with left button
		if (e.button !== 0) return;
		// Suppress drag while inline-editing
		if (
			target.dataset.itDragDisabled ||
			target.getAttribute("contenteditable") === "true"
		)
			return;
		e.preventDefault();
		var section = target.closest("[data-section-id]");
		if (!section) return;
		var rect = section.getBoundingClientRect();
		_itDrag = {
			el: target,
			section: section,
			startX: e.clientX,
			startY: e.clientY,
			origTop: parseFloat(target.style.top) || 50,
			origLeft: parseFloat(target.style.left) || 50,
			sectionWidth: rect.width,
			sectionHeight: rect.height,
		};
		document.addEventListener("mousemove", _handleInsertedTextDragMove);
		document.addEventListener("mouseup", _handleInsertedTextDragEnd);
		target.style.cursor = "grabbing";
	}

	function _handleInsertedTextDragMove(e) {
		if (!_itDrag) return;
		var dx = e.clientX - _itDrag.startX;
		var dy = e.clientY - _itDrag.startY;
		var newTop = _itDrag.origTop + (dy / _itDrag.sectionHeight) * 100;
		var newLeft = _itDrag.origLeft + (dx / _itDrag.sectionWidth) * 100;
		newTop = Math.max(0, Math.min(100, newTop));
		newLeft = Math.max(0, Math.min(100, newLeft));
		_itDrag.el.style.top = newTop + "%";
		_itDrag.el.style.left = newLeft + "%";
	}

	function _handleInsertedTextDragEnd(e) {
		if (!_itDrag) return;
		document.removeEventListener("mousemove", _handleInsertedTextDragMove);
		document.removeEventListener("mouseup", _handleInsertedTextDragEnd);
		_itDrag.el.style.cursor = "grab";
		// Persist the new position
		var newTop = parseFloat(_itDrag.el.style.top) || 50;
		var newLeft = parseFloat(_itDrag.el.style.left) || 50;
		var textId = _itDrag.el.getAttribute("data-text-id");
		var sid = _itDrag.section.getAttribute("data-section-id");
		var schemaId = _itDrag.section.getAttribute("data-schema");
		_itDrag = null;
		if (textId && sid) {
			_persistTextPosition(sid, schemaId, textId, {
				top: Math.round(newTop * 10) / 10,
				left: Math.round(newLeft * 10) / 10,
			});
		}
	}

	async function _persistTextPosition(sectionId, schemaId, textId, position) {
		try {
			var section = await api("GET", API.sections + "/" + sectionId);
			var sData = section.data ? deepClone(section.data) : {};
			var texts = Array.isArray(sData._texts) ? sData._texts.slice() : [];
			var idx = texts.findIndex((t) => t.id === textId);
			if (idx < 0) return;
			texts[idx] = Object.assign({}, texts[idx], { position: position });
			sData._texts = texts;
			sData = await reconcileConventionFields("section", sectionId, sData);
			await api("PUT", API.sections + "/" + sectionId, {
				data: sData,
				title: section.title,
			});
		} catch (err) {
			toast("Failed to save position.", "error");
			return;
		}
		// Refresh in-memory state so subsequent saves use fresh _texts data.
		try {
			await refreshAfterEdit(sectionId, schemaId);
		} catch (e) {
			/* best-effort */
		}
	}

	// ---------- corner-drag resize for inserted text width -------------------------
	/**
	 * bindInsertedTextResize()
	 * Makes the .it-resize-handle inside .inserted-text elements trigger a
	 * horizontal-only resize. On mouseup, persists the new width to the server.
	 */
	function bindInsertedTextResize() {
		var app = document.getElementById("app");
		if (!app) return;
		app.removeEventListener("mousedown", _handleInsertedTextResizeStart);
		app.addEventListener("mousedown", _handleInsertedTextResizeStart);
	}

	var _itResize = null; // active resize state

	function _handleInsertedTextResizeStart(e) {
		var handle = e.target.closest(".it-resize-handle");
		if (!handle) return;
		var textEl = handle.closest(".inserted-text");
		if (!textEl) return;
		if (e.button !== 0) return;
		e.preventDefault();
		e.stopPropagation();
		var section = textEl.closest("[data-section-id]");
		if (!section) return;
		var currentWidth = textEl.offsetWidth;
		_itResize = {
			el: textEl,
			section: section,
			startX: e.clientX,
			origWidth: currentWidth,
		};
		document.addEventListener("mousemove", _handleInsertedTextResizeMove);
		document.addEventListener("mouseup", _handleInsertedTextResizeEnd);
		textEl.style.cursor = "ew-resize";
	}

	function _handleInsertedTextResizeMove(e) {
		if (!_itResize) return;
		var dx = e.clientX - _itResize.startX;
		// Since transform: translate(-50%, -50%), the right edge is at center + width/2.
		// Moving right edge by dx means width changes by dx * 2 to account for centering,
		// but it's more intuitive to just do width + dx.
		var newWidth = Math.max(80, _itResize.origWidth + dx);
		_itResize.el.style.width = newWidth + "px";
		_itResize.el.style.maxWidth = newWidth + "px";
	}

	function _handleInsertedTextResizeEnd(e) {
		if (!_itResize) return;
		document.removeEventListener("mousemove", _handleInsertedTextResizeMove);
		document.removeEventListener("mouseup", _handleInsertedTextResizeEnd);
		_itResize.el.style.cursor = "grab";
		var newWidth = Math.round(parseFloat(_itResize.el.style.width) || 300);
		var textId = _itResize.el.getAttribute("data-text-id");
		var sid = _itResize.section.getAttribute("data-section-id");
		var schemaId = _itResize.section.getAttribute("data-schema");
		_itResize = null;
		if (textId && sid) {
			_persistTextWidth(sid, schemaId, textId, newWidth);
		}
	}

	async function _persistTextWidth(sectionId, schemaId, textId, width) {
		try {
			var section = await api("GET", API.sections + "/" + sectionId);
			var sData = section.data ? deepClone(section.data) : {};
			var texts = Array.isArray(sData._texts) ? sData._texts.slice() : [];
			var idx = texts.findIndex((t) => t.id === textId);
			if (idx < 0) return;
			texts[idx] = Object.assign({}, texts[idx], { width: width });
			sData._texts = texts;
			sData = await reconcileConventionFields("section", sectionId, sData);
			await api("PUT", API.sections + "/" + sectionId, {
				data: sData,
				title: section.title,
			});
		} catch (err) {
			toast("Failed to save width.", "error");
			return;
		}
		// Refresh in-memory state so subsequent click-to-edit saves don't
		// overwrite the persisted width with stale data from the state cache.
		try {
			await refreshAfterEdit(sectionId, schemaId);
		} catch (e) {
			/* best-effort */
		}
	}

	// ---------- double-click to edit inserted text inline -------------------------
	/**
	 * bindInsertedTextEdit()
	 * On double-click, makes an .inserted-text element contentEditable so the user
	 * can change the text inline. On blur or Enter, persists the new content to the
	 * server and exits edit mode. Dragging is suppressed while editing.
	 */
	function bindInsertedTextEdit() {
		var app = document.getElementById("app");
		if (!app) return;
		app.removeEventListener("dblclick", _handleInsertedTextDblClick);
		app.addEventListener("dblclick", _handleInsertedTextDblClick);
	}

	var _itEditing = null; // element currently being edited

	function _handleInsertedTextDblClick(e) {
		if (e.target.closest(".it-resize-handle")) return;
		var target = e.target.closest(".inserted-text");
		if (!target) return;
		if (_itEditing === target) return; // already editing
		e.preventDefault();
		e.stopPropagation();
		_enterInsertedTextEditMode(target);
	}

	function _enterInsertedTextEditMode(el) {
		_itEditing = el;
		el.setAttribute("contenteditable", "true");
		el.style.cursor = "text";
		el.dataset.itDragDisabled = "1"; // flag to suppress drag
		el.focus();
		// Select all text for easy replacement
		var range = document.createRange();
		range.selectNodeContents(el);
		var sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
		// Listen for blur and keydown to commit
		el.addEventListener("blur", _commitInsertedTextEdit);
		el.addEventListener("keydown", _handleInsertedTextEditKey);
	}

	function _handleInsertedTextEditKey(e) {
		// Enter creates line breaks (contenteditable default); Shift+Enter commits
		if (e.key === "Enter" && e.shiftKey) {
			e.preventDefault();
			e.target.blur(); // triggers _commitInsertedTextEdit via blur
		}
		if (e.key === "Escape") {
			// Cancel: revert text (restore from server on next refresh) and exit
			e.target.blur();
		}
	}

	function _commitInsertedTextEdit(e) {
		var el = e.target;
		el.removeEventListener("blur", _commitInsertedTextEdit);
		el.removeEventListener("keydown", _handleInsertedTextEditKey);
		el.setAttribute("contenteditable", "false");
		el.style.cursor = "grab";
		delete el.dataset.itDragDisabled;
		_itEditing = null;

		var newContent = (el.innerHTML || "").trim();
		// Strip the resize handle span that the renderer injects as a child —
		// it must never be persisted as part of the content string.
		newContent = newContent
			.replace(/<span[^>]*class="it-resize-handle"[^>]*><\/span>/gi, "")
			.trim();
		// Strip empty wrappers that contenteditable may leave
		var stripped = newContent
			.replace(/<br\s*\/?>/gi, "")
			.replace(/<[^>]+>/g, "")
			.trim();
		if (!stripped) {
			toast("Text cannot be empty.", "error");
			return;
		}
		var textId = el.getAttribute("data-text-id");
		var section = el.closest("[data-section-id]");
		if (!section || !textId) return;
		var sectionId = section.getAttribute("data-section-id");
		var schemaId = section.getAttribute("data-schema");
		_persistTextContent(sectionId, schemaId, textId, newContent);
	}

	async function _persistTextContent(sectionId, schemaId, textId, content) {
		try {
			var section = await api("GET", API.sections + "/" + sectionId);
			var sData = section.data ? deepClone(section.data) : {};
			var texts = Array.isArray(sData._texts) ? sData._texts.slice() : [];
			var idx = texts.findIndex((t) => t.id === textId);
			if (idx < 0) {
				toast("Text entry not found.", "error");
				return;
			}
			texts[idx] = Object.assign({}, texts[idx], { content: content });
			sData._texts = texts;
			sData = await reconcileConventionFields("section", sectionId, sData);
			await api("PUT", API.sections + "/" + sectionId, {
				data: sData,
				title: section.title,
			});
			toast("Text updated.", "success");
		} catch (err) {
			toast("Failed to save text.", "error");
			return;
		}
		// Refresh in-memory state so subsequent saves use fresh _texts data.
		try {
			await refreshAfterEdit(sectionId, schemaId);
		} catch (e) {
			/* best-effort */
		}
	}

	/**
	 * openFigurePanel(sectionEl, existingFigure)
	 * Shared popover builder for BOTH insert (existingFigure === null) and
	 * adjust (existingFigure pre-fills placement/size/caption). In adjust mode
	 * the file picker is OPTIONAL — if a new file is chosen it replaces the
	 * figure's src (and the old src is reclaimed). On Apply the panel calls
	 * saveFigure(sectionId, schemaId, figureObj, oldSrc), which fresh-GETs,
	 * upserts by id, reconciles convention fields, PUTs, and refreshes.
	 * Mirrors openBgSettingsPanel positioning / close-on-outside-click.
	 */
	function openFigurePanel(sectionEl, existingFigure) {
		removeFigInsertPanel();

		var isAdjust = !!existingFigure;
		var sid = sectionEl.getAttribute("data-section-id");
		var schemaId = sectionEl.getAttribute("data-schema") || "general";

		// Internal state. Adjust mode pre-fills from the existing figure;
		// insert mode uses schema-renderer whitelist defaults (left/fit).
		var stPlacement = isAdjust ? existingFigure.placement || "left" : "left";
		var stSize = isAdjust ? existingFigure.size || "fit" : "fit";
		var stPosition = isAdjust ? existingFigure.position || "top" : "top";
		var chosenFile = null;

		var panel = el("div", { class: "fig-insert-panel" });

		// --- File picker ---
		// Insert: required (Insert disabled until a file is chosen).
		// Adjust: optional (a new file REPLACES the current src on Apply).
		panel.appendChild(
			el("div", { class: "enhance-field" }, [
				el("label", { text: isAdjust ? "Replace image (optional)" : "Image" }),
			]),
		);
		var fileInput = el("input", { type: "file", accept: "image/*" });
		fileInput.style.display = "none";
		var fileLabel = el("span", {
			class: "fig-file-name",
			text: isAdjust ? existingFigure.src || "No change" : "No file chosen",
		});
		var pickBtn = el("button", {
			type: "button",
			class: "fig-pick-btn",
			text: "Choose…",
			onClick: () => {
				fileInput.click();
			},
		});
		fileInput.addEventListener("change", () => {
			chosenFile = fileInput.files[0] || null;
			fileLabel.textContent = chosenFile
				? chosenFile.name
				: isAdjust
					? existingFigure.src || "No change"
					: "No file chosen";
			applyBtn.disabled = isAdjust ? false : !chosenFile;
		});
		var fileRow = el("div", { class: "fig-file-row" });
		fileRow.appendChild(pickBtn);
		fileRow.appendChild(fileLabel);
		fileRow.appendChild(fileInput);
		panel.appendChild(fileRow);

		// --- Placement: Left / Center / Right (reuse enh-align-group/btn) ---
		panel.appendChild(
			el("div", { class: "enhance-field" }, [
				el("label", { text: "Placement" }),
			]),
		);
		var placeGroup = el("div", { class: "enh-align-group" });
		[
			{ value: "left", label: "Left" },
			{ value: "center", label: "Center" },
			{ value: "right", label: "Right" },
		].forEach((opt) => {
			var btn = el("button", {
				type: "button",
				class:
					"enh-align-btn" + (stPlacement === opt.value ? " is-active" : ""),
				text: opt.label,
				onClick: () => {
					stPlacement = opt.value;
					placeGroup.querySelectorAll(".enh-align-btn").forEach((b) => {
						b.classList.remove("is-active");
					});
					btn.classList.add("is-active");
				},
			});
			placeGroup.appendChild(btn);
		});
		panel.appendChild(placeGroup);

		// --- Size: Original / Full Section / Fit ---
		panel.appendChild(
			el("div", { class: "enhance-field" }, [el("label", { text: "Size" })]),
		);
		var sizeGroup = el("div", { class: "enh-align-group" });
		[
			{ value: "original", label: "Original" },
			{ value: "full", label: "Full Section" },
			{ value: "fit", label: "Fit" },
		].forEach((opt) => {
			var btn = el("button", {
				type: "button",
				class: "enh-align-btn" + (stSize === opt.value ? " is-active" : ""),
				text: opt.label,
				onClick: () => {
					stSize = opt.value;
					sizeGroup.querySelectorAll(".enh-align-btn").forEach((b) => {
						b.classList.remove("is-active");
					});
					btn.classList.add("is-active");
				},
			});
			sizeGroup.appendChild(btn);
		});
		panel.appendChild(sizeGroup);

		// --- Position: Top / After-Heading / Bottom (option B wave 4) ---
		panel.appendChild(
			el("div", { class: "enhance-field" }, [
				el("label", { text: "Position" }),
			]),
		);
		var posGroup = el("div", { class: "enh-align-group" });
		[
			{ value: "top", label: "Top" },
			{ value: "after-head", label: "After Heading" },
			{ value: "bottom", label: "Bottom" },
		].forEach((opt) => {
			var btn = el("button", {
				type: "button",
				class: "enh-align-btn" + (stPosition === opt.value ? " is-active" : ""),
				text: opt.label,
				onClick: () => {
					stPosition = opt.value;
					posGroup.querySelectorAll(".enh-align-btn").forEach((b) => {
						b.classList.remove("is-active");
					});
					btn.classList.add("is-active");
				},
			});
			posGroup.appendChild(btn);
		});
		panel.appendChild(posGroup);

		// --- Caption (optional) ---
		var captionInput = el("input", {
			type: "text",
			class: "enh-input fig-caption-input",
			placeholder: "Caption (optional)",
			value: isAdjust ? existingFigure.caption || "" : "",
		});
		panel.appendChild(
			el("div", { class: "enhance-field" }, [
				el("label", { text: "Caption" }),
				captionInput,
			]),
		);

		// --- Actions ---
		var actions = el("div", { class: "fig-insert-actions" });
		actions.appendChild(
			el("button", {
				type: "button",
				class: "fig-cancel",
				text: "Cancel",
				onClick: () => {
					removeFigInsertPanel();
				},
			}),
		);
		var applyBtn = el("button", {
			type: "button",
			class: "fig-apply",
			text: isAdjust ? "Apply" : "Insert",
			disabled: !isAdjust, // insert requires a file; adjust is always enabled
			onClick: () => {
				applyBtn.disabled = true;
				if (isAdjust) {
					applyAdjust();
				} else {
					applyInsert();
				}
			},
		});
		actions.appendChild(applyBtn);
		panel.appendChild(actions);

		// Position near the section element (mirrors openBgSettingsPanel).
		var rect = sectionEl.getBoundingClientRect();
		panel.style.position = "fixed";
		panel.style.top = Math.max(8, rect.top - 8) + "px";
		panel.style.left =
			Math.min(window.innerWidth - 288, rect.right + 12) + "px";

		document.body.appendChild(panel);

		// Close on outside click (mirrors openBgSettingsPanel).
		setTimeout(() => {
			document.addEventListener("mousedown", function onDocClick(ev) {
				if (!panel.contains(ev.target) && !sectionEl.contains(ev.target)) {
					removeFigInsertPanel();
					document.removeEventListener("mousedown", onDocClick);
				}
			});
		}, 0);

		// --- INSERT path: file is required; upload then saveFigure (new id). ---
		async function applyInsert() {
			if (!chosenFile) {
				applyBtn.disabled = false;
				return;
			}
			var relativePath = await uploadFigureFile(sectionEl, chosenFile);
			if (!relativePath) {
				applyBtn.disabled = false;
				return;
			}
			var fig = {
				id: shortId(),
				src: relativePath,
				placement: stPlacement,
				size: stSize,
				position: stPosition,
				caption: captionInput.value || "",
			};
			try {
				await saveFigure(sid, schemaId, fig);
				removeFigInsertPanel();
			} catch (err) {
				// Orphan cleanup (Ticket #20 pattern): the upload landed but the
				// section PUT failed, so the file would be stranded. Best-effort.
				await deleteUploadedAsset(relativePath);
				toast("Figure save failed: " + err.message, "error");
				applyBtn.disabled = false;
			}
		}

		// --- ADJUST path: file is optional; upload-if-chosen then saveFigure
		//     (same id). If a new file was chosen, the OLD src is passed as
		//     oldSrc so saveFigure reclaims it after a successful PUT. ---
		async function applyAdjust() {
			var newSrc = existingFigure.src;
			var oldSrc = null;
			if (chosenFile) {
				var uploaded = await uploadFigureFile(sectionEl, chosenFile);
				if (!uploaded) {
					applyBtn.disabled = false;
					return;
				}
				oldSrc = existingFigure.src;
				newSrc = uploaded;
			}
			var fig = {
				id: existingFigure.id,
				src: newSrc,
				placement: stPlacement,
				size: stSize,
				position: stPosition,
				caption: captionInput.value || "",
			};
			try {
				await saveFigure(sid, schemaId, fig, oldSrc);
				removeFigInsertPanel();
			} catch (err) {
				// If we uploaded a replacement but the PUT failed, reclaim the
				// NEW file (the OLD src is still referenced by the live figure).
				if (chosenFile) await deleteUploadedAsset(newSrc);
				toast("Figure save failed: " + err.message, "error");
				applyBtn.disabled = false;
			}
		}
	}

	function removeFigInsertPanel() {
		var panel = document.querySelector(".fig-insert-panel");
		if (panel) panel.remove();
	}

	/**
	 * uploadFigureFile(sectionEl, file)
	 * POSTs the file to /api/upload (spec 'figure') and returns the relative
	 * path on success, or null on failure (after toasting). Shared by the
	 * insert and adjust paths.
	 */
	async function uploadFigureFile(sectionEl, file) {
		var schemaId = sectionEl.getAttribute("data-schema") || "general";
		var formData = new FormData();
		formData.append("category", "sections");
		formData.append("slug", schemaId);
		formData.append("spec", "figure");
		formData.append("file", file);
		try {
			var res = await fetch("/api/upload", { method: "POST", body: formData });
			var data = await res.json();
			if (!data || !data.success) {
				toast((data && data.error) || "Upload failed", "error");
				return null;
			}
			return data.relativePath;
		} catch (err) {
			toast("Figure upload failed: " + err.message, "error");
			return null;
		}
	}

	/**
	 * saveFigure(sectionId, schemaId, figureObj, oldSrc)
	 * Shared persist helper for BOTH insert and adjust. Fresh-GETs the section,
	 * UPSERTS the figure into data._figures BY STABLE ID (insert if new,
	 * replace if the id already exists), reconciles convention fields, PUTs,
	 * and refreshes. If oldSrc is provided and differs from the figure's new
	 * src (i.e. the image was replaced during adjust), the orphaned OLD file
	 * is reclaimed via deleteUploadedAsset after a successful PUT.
	 */
	async function saveFigure(sectionId, schemaId, figureObj, oldSrc) {
		var section = await api("GET", API.sections + "/" + sectionId);
		var sData = section.data ? deepClone(section.data) : {};
		var figs = Array.isArray(sData._figures) ? sData._figures.slice() : [];
		var idx = figs.findIndex((f) => f.id === figureObj.id);
		if (idx >= 0) {
			figs[idx] = figureObj;
		} else {
			figs.push(figureObj);
		}
		sData._figures = figs;
		sData = await reconcileConventionFields("section", sectionId, sData);
		await api("PUT", API.sections + "/" + sectionId, {
			data: sData,
			title: section.title,
		});
		toast(idx >= 0 ? "Figure updated." : "Figure inserted.", "success");
		// Reclaim the OLD image file only after the PUT succeeded AND only if the
		// src actually changed (replace-on-adjust). Best-effort, never blocks.
		if (oldSrc && oldSrc !== figureObj.src) {
			await deleteUploadedAsset(oldSrc);
		}
		await refreshAfterEdit(sectionId, schemaId);
	}

	/**
	 * removeFigure(sectionId, schemaId, figureId)
	 * Fresh-GETs the section, SPLICES the figure out of data._figures BY STABLE
	 * ID, PUTs, refreshes, then best-effort deletes the orphaned image file
	 * (the src captured before the splice). Never blocks on a failed delete.
	 */
	async function removeFigure(sectionId, schemaId, figureId) {
		var section = await api("GET", API.sections + "/" + sectionId);
		var sData = section.data ? deepClone(section.data) : {};
		var figs = Array.isArray(sData._figures) ? sData._figures.slice() : [];
		var idx = figs.findIndex((f) => f.id === figureId);
		if (idx < 0) {
			toast("Figure not found (it may have already been removed).", "error");
			return;
		}
		var removedSrc = figs[idx].src;
		figs.splice(idx, 1);
		sData._figures = figs;
		sData = await reconcileConventionFields("section", sectionId, sData);
		await api("PUT", API.sections + "/" + sectionId, {
			data: sData,
			title: section.title,
		});
		toast("Figure removed.", "success");
		await refreshAfterEdit(sectionId, schemaId);
		// Best-effort cleanup of the now-unreferenced image file.
		await deleteUploadedAsset(removedSrc);
	}

	/**
	 * moveFigure(sectionId, schemaId, figureId, direction)
	 * Reorders a figure within data._figures by swapping its array entry with
	 * the previous (direction -1) or next (direction +1) entry. Fresh-GETs
	 * the section, finds the figure BY STABLE ID, swaps, reconciles convention
	 * fields, PUTs, and refreshes. Guards: no-op if the figure is at the edge
	 * of the array or not found.
	 */
	async function moveFigure(sectionId, schemaId, figureId, direction) {
		var section = await api("GET", API.sections + "/" + sectionId);
		var sData = section.data ? deepClone(section.data) : {};
		var figs = Array.isArray(sData._figures) ? sData._figures.slice() : [];
		var idx = figs.findIndex((f) => f.id === figureId);
		if (idx < 0) {
			toast("Figure not found (it may have already been removed).", "error");
			return;
		}
		var swapWith = idx + direction;
		if (swapWith < 0 || swapWith >= figs.length) return;
		var tmp = figs[idx];
		figs[idx] = figs[swapWith];
		figs[swapWith] = tmp;
		sData._figures = figs;
		sData = await reconcileConventionFields("section", sectionId, sData);
		await api("PUT", API.sections + "/" + sectionId, {
			data: sData,
			title: section.title,
		});
		toast("Figure moved " + (direction < 0 ? "earlier." : "later."), "success");
		await refreshAfterEdit(sectionId, schemaId);
	}

	// ---------- background settings panel (size / position / opacity) ---------

	/**
	 * openBgSettingsPanel(hostEl)
	 * Opens a floating panel near the host element for adjusting background
	 * image size, position, and opacity. Reads current values from the
	 * element's data-bg-* attributes. Apply persists via persistBackgroundSettings;
	 * Reset clears _background_settings (reverts to defaults).
	 */
	function openBgSettingsPanel(hostEl) {
		removeBgSettingsPanel();

		var curSize = hostEl.getAttribute("data-bg-size") || "cover";
		var curPosition = hostEl.getAttribute("data-bg-position") || "center";
		var curOpacity = parseFloat(hostEl.getAttribute("data-bg-opacity"));
		if (isNaN(curOpacity)) curOpacity = 0.15;

		// Internal state for the panel
		var stSize = curSize;
		// Parse current position into X and Y state for the two-axis segment
		// groups. Legacy 1-word values (left/center/right) set Y to 'center'.
		var posParts = (curPosition || "center").trim().split(/\s+/);
		var stPosX = posParts[0] || "center";
		var stPosY = posParts.length >= 2 ? posParts[1] : "center";
		var stOpacity = curOpacity;

		var panel = el("div", { class: "bg-settings-panel" });

		// --- Size ---
		panel.appendChild(
			el("div", { class: "bg-settings-field" }, [
				el("label", { text: "Size" }),
			]),
		);
		var sizeGroup = el("div", { class: "bg-segment-group" });
		var sizeOptions = [
			{ value: "auto", label: "Original" },
			{ value: "cover", label: "Full Section" },
			{ value: "contain", label: "Fit" },
		];
		sizeOptions.forEach((opt) => {
			var isActive = stSize === opt.value;
			var btn = el("button", {
				type: "button",
				class: "bg-segment-btn" + (isActive ? " is-active" : ""),
				text: opt.label,
				onClick: () => {
					stSize = opt.value;
					sizeGroup.querySelectorAll(".bg-segment-btn").forEach((b) => {
						b.classList.remove("is-active");
					});
					btn.classList.add("is-active");
				},
			});
			sizeGroup.appendChild(btn);
		});
		panel.appendChild(sizeGroup);

		// --- Horizontal Position ---
		panel.appendChild(
			el("div", { class: "bg-settings-field" }, [
				el("label", { text: "Horizontal" }),
			]),
		);
		var posGroup = el("div", { class: "bg-segment-group" });
		var posXOptions = [
			{ value: "left", label: "Left" },
			{ value: "center", label: "Center" },
			{ value: "right", label: "Right" },
		];
		posXOptions.forEach((opt) => {
			var isActive = stPosX === opt.value;
			var btn = el("button", {
				type: "button",
				class: "bg-segment-btn" + (isActive ? " is-active" : ""),
				text: opt.label,
				onClick: () => {
					stPosX = opt.value;
					posGroup.querySelectorAll(".bg-segment-btn").forEach((b) => {
						b.classList.remove("is-active");
					});
					btn.classList.add("is-active");
				},
			});
			posGroup.appendChild(btn);
		});
		panel.appendChild(posGroup);

		// --- Vertical Position ---
		panel.appendChild(
			el("div", { class: "bg-settings-field" }, [
				el("label", { text: "Vertical" }),
			]),
		);
		var posVGroup = el("div", { class: "bg-segment-group" });
		var posYOptions = [
			{ value: "top", label: "Top" },
			{ value: "center", label: "Middle" },
			{ value: "bottom", label: "Bottom" },
		];
		posYOptions.forEach((opt) => {
			var isActive = stPosY === opt.value;
			var btn = el("button", {
				type: "button",
				class: "bg-segment-btn" + (isActive ? " is-active" : ""),
				text: opt.label,
				onClick: () => {
					stPosY = opt.value;
					posVGroup.querySelectorAll(".bg-segment-btn").forEach((b) => {
						b.classList.remove("is-active");
					});
					btn.classList.add("is-active");
				},
			});
			posVGroup.appendChild(btn);
		});
		panel.appendChild(posVGroup);

		// --- Opacity ---
		panel.appendChild(
			el("div", { class: "bg-settings-field" }, [
				el("label", { text: "Opacity" }),
			]),
		);
		var opacityRow = el("div", { class: "bg-opacity-row" });
		var opacitySlider = el("input", {
			type: "range",
			min: "0",
			max: "1",
			step: "0.05",
			value: String(stOpacity),
		});
		var opacityVal = el("span", {
			class: "bg-opacity-val",
			text: Math.round(stOpacity * 100) + "%",
		});
		opacitySlider.addEventListener("input", () => {
			stOpacity = parseFloat(opacitySlider.value);
			opacityVal.textContent = Math.round(stOpacity * 100) + "%";
		});
		opacityRow.appendChild(opacitySlider);
		opacityRow.appendChild(opacityVal);
		panel.appendChild(opacityRow);

		// --- Actions ---
		var actions = el("div", { class: "bg-settings-actions" });
		actions.appendChild(
			el("button", {
				type: "button",
				class: "bg-reset",
				text: "Reset",
				onClick: () => {
					stSize = "cover";
					stPosX = "center";
					stPosY = "center";
					stOpacity = 0.15;
					persistBackgroundSettings(hostEl, null).then(() => {
						removeBgSettingsPanel();
					});
				},
			}),
		);
		actions.appendChild(
			el("button", {
				type: "button",
				class: "bg-apply",
				text: "Apply",
				onClick: () => {
					// Compose position: default-Y (center) stores a single word so
					// existing sections keep their 1-word data shape (backward compat);
					// a non-default Y stores a 2-word string.
					persistBackgroundSettings(hostEl, {
						size: stSize,
						position: stPosY === "center" ? stPosX : stPosX + " " + stPosY,
						opacity: stOpacity,
					}).then(() => {
						removeBgSettingsPanel();
					});
				},
			}),
		);
		panel.appendChild(actions);

		// --- Remove Image (destructive) ---
		panel.appendChild(
			el("button", {
				type: "button",
				class: "bg-remove-image",
				text: "🗑 Remove Image",
				onClick: () => {
					confirmDialog(
						"Remove background image?",
						"The background image will be removed from this section and its file deleted.",
						"Remove",
						() => removeBackgroundImage(hostEl),
					);
					removeBgSettingsPanel();
				},
			}),
		);

		// Position near the host element
		var rect = hostEl.getBoundingClientRect();
		panel.style.position = "fixed";
		panel.style.top = Math.max(8, rect.top - 8) + "px";
		panel.style.left =
			Math.min(window.innerWidth - 288, rect.right + 12) + "px";

		document.body.appendChild(panel);

		// Close on outside click
		setTimeout(() => {
			document.addEventListener("mousedown", function onDocClick(ev) {
				if (!panel.contains(ev.target) && !hostEl.contains(ev.target)) {
					removeBgSettingsPanel();
					document.removeEventListener("mousedown", onDocClick);
				}
			});
		}, 0);
	}

	function removeBgSettingsPanel() {
		var panel = document.querySelector(".bg-settings-panel");
		if (panel) panel.remove();
	}

	// ---------- Nudge position panel -----------------------------------------
	function closeNudgePanel() {
		var panel = document.querySelector(".nudge-panel");
		if (panel) panel.remove();
	}

	/**
	 * openNudgePanel(fieldEl, hostEl)
	 * Opens a floating panel for nudging a [data-field] element via
	 * marginTop / marginLeft offsets. Mirrors openBgSettingsPanel positioning
	 * and close-on-outside-click pattern.
	 */
	function openNudgePanel(fieldEl, hostEl) {
		closeNudgePanel();

		var path = fieldEl.getAttribute("data-field");
		if (!path) {
			toast("No data-field on this element.", "error");
			return;
		}

		// Determine host: product card OR section/structural.
		var card = hostEl.closest(".product-card[data-product-slug]");
		var sec = hostEl.closest("[data-section-id]");
		var isProduct = !!card;
		var hostId, hostSlug;
		if (isProduct) {
			hostSlug = card.getAttribute("data-product-slug");
		} else if (sec) {
			hostId = sec.getAttribute("data-section-id");
		} else {
			return;
		}

		// Load current deltas from in-memory state.
		var currentNudges = {};
		var fullData = {};
		if (window.AGF && window.AGF.state) {
			var st = isProduct
				? (window.AGF.state.products || []).find((p) => p.slug === hostSlug)
				: window.AGF.state.sections.find((s) => s.id === hostId);
			if (st && st.data) {
				fullData = st.data;
				currentNudges = (st.data._nudges && st.data._nudges[path]) || {};
			}
		}

		// Internal mutable state.
		var deltas = {
			marginTop: currentNudges.marginTop || 0,
			marginLeft: currentNudges.marginLeft || 0,
		};
		var applied = false;

		// Build panel DOM.
		var panel = el("div", { class: "nudge-panel" });

		panel.appendChild(el("label", { text: "NUDGE POSITION" }));
		var pathDisplay = el("div", { class: "nudge-path", text: path });
		panel.appendChild(pathDisplay);

		// Snap selector.
		panel.appendChild(el("label", { text: "SNAP AMOUNT" }));
		var snapSelect = el("select", { class: "nudge-snap" });
		[4, 8, 16, 24, 32, 48, 64].forEach((v) => {
			var opt = el("option", { value: String(v), text: String(v) + "px" });
			if (v === 16) opt.selected = true;
			snapSelect.appendChild(opt);
		});
		panel.appendChild(snapSelect);
		function getSnap() {
			return parseInt(snapSelect.value, 10) || 16;
		}

		// Direction buttons.
		panel.appendChild(el("label", { text: "DIRECTION" }));
		var grid = el("div", { class: "nudge-grid" });
		var readout = el("div", { class: "nudge-current" });

		function updateReadout() {
			var up = deltas.marginTop < 0 ? Math.abs(deltas.marginTop) : 0;
			var down = deltas.marginTop > 0 ? deltas.marginTop : 0;
			var left = deltas.marginLeft < 0 ? Math.abs(deltas.marginLeft) : 0;
			var right = deltas.marginLeft > 0 ? deltas.marginLeft : 0;
			readout.textContent =
				"\u2191" +
				up +
				"  \u2193" +
				down +
				"  \u2190" +
				left +
				"  \u2192" +
				right;
		}
		updateReadout();

		function applyPreview() {
			fieldEl.style.marginTop = deltas.marginTop + "px";
			if (deltas.marginLeft) {
				fieldEl.style.marginLeft = deltas.marginLeft + "px";
			} else {
				fieldEl.style.marginLeft = "";
			}
		}

		function revertPreview() {
			if (currentNudges.marginTop != null && currentNudges.marginTop !== 0) {
				fieldEl.style.marginTop = currentNudges.marginTop + "px";
			} else {
				fieldEl.style.removeProperty("margin-top");
			}
			// Horizontal: use marginLeft (matches applyNudges load path; works for inline elements like the eyebrow span).
			if (currentNudges.marginLeft != null && currentNudges.marginLeft !== 0) {
				fieldEl.style.marginLeft = currentNudges.marginLeft + "px";
			} else {
				fieldEl.style.marginLeft = "";
			}
		}

		function dirBtn(label, onClick) {
			return el("button", {
				type: "button",
				class: "nudge-dir-btn",
				text: label,
				onClick: () => {
					onClick();
					updateReadout();
					applyPreview();
				},
			});
		}

		grid.appendChild(
			dirBtn("\u2191 Up", () => {
				deltas.marginTop -= getSnap();
			}),
		);
		grid.appendChild(
			dirBtn("\u2193 Down", () => {
				deltas.marginTop += getSnap();
			}),
		);
		grid.appendChild(
			dirBtn("\u2190 Left", () => {
				deltas.marginLeft -= getSnap();
			}),
		);
		grid.appendChild(
			dirBtn("\u2192 Right", () => {
				deltas.marginLeft += getSnap();
			}),
		);
		panel.appendChild(grid);

		// Free nudge inputs.
		panel.appendChild(el("label", { text: "FREE NUDGE (PX)" }));
		var freeRow = el("div", { class: "nudge-free" });
		var freeUp = el("input", { type: "number", placeholder: "Up", min: "0" });
		var freeDown = el("input", {
			type: "number",
			placeholder: "Down",
			min: "0",
		});
		var freeLeft = el("input", {
			type: "number",
			placeholder: "Left",
			min: "0",
		});
		var freeRight = el("input", {
			type: "number",
			placeholder: "Right",
			min: "0",
		});
		freeRow.appendChild(freeUp);
		freeRow.appendChild(freeDown);
		freeRow.appendChild(freeLeft);
		freeRow.appendChild(freeRight);
		panel.appendChild(freeRow);

		function syncFromFreeInputs() {
			var upVal = parseInt(freeUp.value, 10) || 0;
			var downVal = parseInt(freeDown.value, 10) || 0;
			var leftVal = parseInt(freeLeft.value, 10) || 0;
			var rightVal = parseInt(freeRight.value, 10) || 0;
			// Down wins over up; right wins over left.
			if (downVal > 0) {
				deltas.marginTop = downVal;
				freeUp.value = "";
			} else if (upVal > 0) {
				deltas.marginTop = -upVal;
			} else {
				deltas.marginTop = 0;
			}
			if (rightVal > 0) {
				deltas.marginLeft = rightVal;
				freeLeft.value = "";
			} else if (leftVal > 0) {
				deltas.marginLeft = -leftVal;
			} else {
				deltas.marginLeft = 0;
			}
			updateReadout();
			applyPreview();
		}

		freeUp.addEventListener("input", syncFromFreeInputs);
		freeDown.addEventListener("input", syncFromFreeInputs);
		freeLeft.addEventListener("input", syncFromFreeInputs);
		freeRight.addEventListener("input", syncFromFreeInputs);

		// Readout.
		panel.appendChild(readout);

		// Actions.
		var actions = el("div", { class: "nudge-actions" });
		actions.appendChild(
			el("button", {
				type: "button",
				class: "nudge-clear",
				text: "Clear",
				onClick: () => {
					deltas = { marginTop: 0, marginLeft: 0 };
					freeUp.value = "";
					freeDown.value = "";
					freeLeft.value = "";
					freeRight.value = "";
					updateReadout();
					applyPreview();
				},
			}),
		);
		actions.appendChild(
			el("button", {
				type: "button",
				class: "nudge-apply",
				text: "Apply",
				onClick: () => {
					doApplyNudge();
				},
			}),
		);
		panel.appendChild(actions);

		// Position near the field element.
		var rect = fieldEl.getBoundingClientRect();
		panel.style.position = "fixed";
		panel.style.top = Math.max(8, rect.top + 8) + "px";
		panel.style.left = Math.min(window.innerWidth - 288, rect.right + 8) + "px";

		document.body.appendChild(panel);

		// Close on outside click.
		setTimeout(() => {
			document.addEventListener("mousedown", function onDocClick(ev) {
				if (!panel.contains(ev.target)) {
					if (!applied) revertPreview();
					closeNudgePanel();
					document.removeEventListener("mousedown", onDocClick);
				}
			});
			document.addEventListener("keydown", function onEsc(ev) {
				if (ev.key === "Escape") {
					if (!applied) revertPreview();
					closeNudgePanel();
					document.removeEventListener("keydown", onEsc);
				}
			});
		}, 0);

		// Persist flow.
		async function doApplyNudge() {
			var endpoint;
			if (isProduct) endpoint = API.products + "/" + hostSlug;
			else endpoint = API.sections + "/" + hostId;

			var fresh;
			try {
				fresh = await api("GET", endpoint);
			} catch (e2) {
				toast("Could not load current data: " + e2.message, "error");
				return;
			}

			var data =
				fresh && fresh.data ? JSON.parse(JSON.stringify(fresh.data)) : {};
			if (!data._nudges || typeof data._nudges !== "object") data._nudges = {};

			var hasVertical = deltas.marginTop !== 0;
			var hasHorizontal = deltas.marginLeft !== 0;
			if (!hasVertical && !hasHorizontal) {
				delete data._nudges[path];
			} else {
				data._nudges[path] = {};
				if (hasVertical) data._nudges[path].marginTop = deltas.marginTop;
				if (hasHorizontal) data._nudges[path].marginLeft = deltas.marginLeft;
			}
			if (Object.keys(data._nudges).length === 0) delete data._nudges;

			try {
				await api("PUT", endpoint, { data: data });
			} catch (e2) {
				toast("Nudge save failed: " + e2.message, "error");
				return;
			}

			// Sync in-memory state.
			if (window.AGF && window.AGF.state) {
				var list = isProduct
					? window.AGF.state.products || []
					: window.AGF.state.sections;
				var st2 = isProduct
					? list.find((p) => p.slug === hostSlug)
					: list.find((s) => s.id === hostId);
				if (st2) {
					if (st2.data) {
						if (data._nudges) st2.data._nudges = data._nudges;
						else delete st2.data._nudges;
					}
				}
			}

			// Re-render.
			applied = true;
			if (
				!isProduct &&
				window.AGF &&
				typeof window.AGF.refreshSection === "function"
			) {
				await window.AGF.refreshSection(hostId);
			} else if (window.AGF && typeof window.AGF.refreshAll === "function") {
				await window.AGF.refreshAll();
			} else if (sec) {
				// Fallback: re-apply nudges directly to the live DOM.
				var nMap = data._nudges || {};
				var nEntry = nMap[path];
				if (nEntry) {
					fieldEl.style.marginTop = (nEntry.marginTop || 0) + "px";
					fieldEl.style.marginLeft = (nEntry.marginLeft || 0) + "px";
				} else {
					fieldEl.style.removeProperty("margin-top");
					fieldEl.style.removeProperty("margin-left");
				}
			}

			toast("Position saved.", "success");
			closeNudgePanel();
		}
	}

	/**
	 * persistBackgroundSettings(hostEl, settings)
	 * Fresh-GETs the host section/product data, sets or removes
	 * _background_settings, PUTs, and triggers a refresh so the renderer
	 * re-emits the data-bg-* attributes. Mirrors persistStyleOverrides.
	 * Pass settings=null to clear _background_settings (reset to defaults).
	 */
	async function persistBackgroundSettings(hostEl, settings) {
		var sectionEl =
			hostEl.closest("[data-section-id]") ||
			(hostEl.hasAttribute && hostEl.hasAttribute("data-section-id")
				? hostEl
				: null);
		var productCard = hostEl.closest(".product-card[data-product-slug]");

		try {
			if (productCard) {
				var slug = productCard.getAttribute("data-product-slug");
				var product = await api("GET", API.products + "/" + slug);
				var pData = product.data ? deepClone(product.data) : {};
				if (settings) {
					pData._background_settings = settings;
				} else {
					delete pData._background_settings;
				}
				await api("PUT", API.products + "/" + slug, {
					name: product.name,
					category: product.category,
					status: product.status,
					data: pData,
				});
				toast(
					settings
						? "Background settings saved."
						: "Background reset to defaults.",
					"success",
				);
				if (window.AGF && window.AGF.refreshProducts) {
					await window.AGF.refreshProducts();
				}
			} else if (sectionEl) {
				var sid = sectionEl.getAttribute("data-section-id");
				var schemaId = sectionEl.getAttribute("data-schema") || "";
				var section = await api("GET", API.sections + "/" + sid);
				var sData = section.data ? deepClone(section.data) : {};
				if (settings) {
					sData._background_settings = settings;
				} else {
					delete sData._background_settings;
				}
				await api("PUT", API.sections + "/" + sid, {
					data: sData,
					title: section.title,
				});
				toast(
					settings
						? "Background settings saved."
						: "Background reset to defaults.",
					"success",
				);
				await refreshAfterEdit(sid, schemaId);
			} else {
				toast("Could not find a section or product to save into.", "error");
			}
		} catch (err) {
			toast("Background settings save failed: " + err.message, "error");
		}
	}

	/**
	 * removeImageAdjustPanel()
	 * Removes any open image-adjust popover from the DOM.
	 */
	function removeImageAdjustPanel() {
		var panel = document.querySelector(".image-adjust-panel");
		if (panel) panel.remove();
	}

	/**
	 * openImageAdjustPanel(imgEl)
	 * Floating popover for adjusting image fit, position, scale, and rotation
	 * on prelude squares (background-image divs) and cut-sheet images (<img>).
	 * Reads current values from data-img-* attributes, applies changes live,
	 * and persists on "Done" via persistImageSettings. Reset restores defaults
	 * in-panel without writing. Closes on outside click.
	 */
	function openImageAdjustPanel(imgEl) {
		removeImageAdjustPanel();

		var imagePath = imgEl.getAttribute("data-image-path") || "";
		if (!imagePath) {
			toast("No image path found on this element.", "error");
			return;
		}

		var sectionEl = imgEl.closest("[data-section-id]");
		if (!sectionEl) {
			toast("Could not find the section for this image.", "error");
			return;
		}

		// Prelude squares render as background-image divs; cut-sheet renders an <img>.
		var isPrelude = imagePath.indexOf("squares.") === 0;
		var hostEl = sectionEl;

		// Read current settings from the renderer-emitted data-img-* attributes.
		var curFit = imgEl.getAttribute("data-img-fit") || "cover";
		var curPosX = parseFloat(imgEl.getAttribute("data-img-pos-x"));
		if (isNaN(curPosX)) curPosX = 50;
		var curPosY = parseFloat(imgEl.getAttribute("data-img-pos-y"));
		if (isNaN(curPosY)) curPosY = 50;
		var curScale = parseFloat(imgEl.getAttribute("data-img-scale"));
		if (isNaN(curScale) || curScale <= 0) curScale = 100;
		var curRotation = parseFloat(imgEl.getAttribute("data-img-rotation"));
		if (isNaN(curRotation)) curRotation = 0;

		// Mutable panel state — reassigned by handlers, so var (not const).
		var stFit = curFit;
		var stPosX = curPosX;
		var stPosY = curPosY;
		var stScale = curScale;
		var stRotation = curRotation;

		function applyLiveImagePreview() {
			var position = stPosX + "% " + stPosY + "%";
			if (isPrelude) {
				// Scale (≠100) wins as a zoom crop over fit; fill → 100% 100%.
				imgEl.style.backgroundSize =
					stScale !== 100
						? stScale + "%"
						: stFit === "fill"
							? "100% 100%"
							: stFit;
				imgEl.style.backgroundPosition = position;
				imgEl.style.transform = stRotation
					? "rotate(" + stRotation + "deg)"
					: "";
			} else {
				imgEl.style.objectFit = stFit === "fill" ? "fill" : stFit;
				imgEl.style.objectPosition = position;
				imgEl.style.transform =
					"scale(" + stScale + "%) rotate(" + stRotation + "deg)";
			}
		}

		var panel = el("div", { class: "image-adjust-panel" });

		// --- Fit ---
		panel.appendChild(
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
			fitGroup.appendChild(btn);
		});
		panel.appendChild(fitGroup);

		// Builds a labelled slider row reusing the bg-opacity-row CSS.
		function sliderRow(label, min, max, step, value, onInput) {
			panel.appendChild(
				el("div", { class: "bg-settings-field" }, [
					el("label", { text: label }),
				]),
			);
			var row = el("div", { class: "bg-opacity-row" });
			var slider = el("input", {
				type: "range",
				min: String(min),
				max: String(max),
				step: String(step),
				value: String(value),
			});
			var val = el("span", { class: "bg-opacity-val", text: value + "%" });
			slider.addEventListener("input", () => {
				var v = parseFloat(slider.value);
				if (isNaN(v)) return;
				val.textContent = Math.round(v) + "%";
				onInput(v);
			});
			row.appendChild(slider);
			row.appendChild(val);
			panel.appendChild(row);
			return { slider: slider, val: val };
		}

		var posXUI = sliderRow("Position X", 0, 100, 1, stPosX, (v) => {
			stPosX = v;
			applyLiveImagePreview();
		});
		var posYUI = sliderRow("Position Y", 0, 100, 1, stPosY, (v) => {
			stPosY = v;
			applyLiveImagePreview();
		});
		var scaleUI = sliderRow("Scale", 50, 300, 1, stScale, (v) => {
			stScale = v;
			applyLiveImagePreview();
		});

		// --- Rotation ---
		panel.appendChild(
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
			rotationGroup.appendChild(btn);
		});
		panel.appendChild(rotationGroup);

		// --- Actions ---
		var actions = el("div", { class: "bg-settings-actions" });
		actions.appendChild(
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
					// Sync the panel UI to the reset state.
					fitGroup.querySelectorAll(".bg-segment-btn").forEach((b) => {
						b.classList.toggle(
							"is-active",
							b.getAttribute("data-value") === stFit,
						);
					});
					posXUI.slider.value = String(stPosX);
					posXUI.val.textContent = stPosX + "%";
					posYUI.slider.value = String(stPosY);
					posYUI.val.textContent = stPosY + "%";
					scaleUI.slider.value = String(stScale);
					scaleUI.val.textContent = stScale + "%";
					rotationGroup.querySelectorAll(".bg-segment-btn").forEach((b) => {
						b.classList.toggle(
							"is-active",
							parseInt(b.getAttribute("data-value"), 10) === stRotation,
						);
					});
				},
			}),
		);
		actions.appendChild(
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
		panel.appendChild(actions);

		// Position near the host element.
		var rect = hostEl.getBoundingClientRect();
		panel.style.position = "fixed";
		panel.style.top = Math.max(8, rect.top - 8) + "px";
		panel.style.left =
			Math.min(window.innerWidth - 288, rect.right + 12) + "px";

		document.body.appendChild(panel);

		// Close on outside click (mirrors openBgSettingsPanel).
		setTimeout(() => {
			document.addEventListener("mousedown", function onDocClick(ev) {
				if (!panel.contains(ev.target) && !hostEl.contains(ev.target)) {
					removeImageAdjustPanel();
					document.removeEventListener("mousedown", onDocClick);
				}
			});
		}, 0);
	}

	/**
	 * persistImageSettings(imgEl, settings)
	 * Fresh-GETs the section, writes image_settings onto the correct square
	 * (prelude: squares.N.image_settings) or the section root (cut-sheet:
	 * image_settings), reconciles _-prefixed convention fields, PUTs, and
	 * re-renders. Uses var for sData because reconcileConventionFields
	 * reassigns it.
	 */
	async function persistImageSettings(imgEl, settings) {
		var imagePath = imgEl.getAttribute("data-image-path") || "";
		var sectionEl = imgEl.closest("[data-section-id]");
		if (!sectionEl) {
			toast("Could not find a section for this image.", "error");
			return;
		}
		var sid = sectionEl.getAttribute("data-section-id");
		var schemaId = sectionEl.getAttribute("data-schema") || "";

		try {
			var section = await api("GET", API.sections + "/" + sid);
			// var (NOT const): reconcileConventionFields reassigns sData.
			var sData = section.data ? deepClone(section.data) : {};

			if (imagePath.indexOf("squares.") === 0) {
				// Prelude square: parse the index out of "squares.N.image".
				var squareIdx = parseInt(
					imagePath.replace("squares.", "").split(".")[0],
					10,
				);
				if (isNaN(squareIdx)) {
					toast("Could not parse the square index.", "error");
					return;
				}
				if (!Array.isArray(sData.squares)) sData.squares = [{}, {}, {}];
				while (sData.squares.length <= squareIdx) sData.squares.push({});
				sData.squares[squareIdx].image_settings = settings;
			} else if (imagePath === "image") {
				// Cut-sheet root image.
				sData.image_settings = settings;
			} else {
				toast("Unknown image path: " + imagePath, "error");
				return;
			}

			// Reconcile _-prefixed convention fields before PUT (race-free).
			sData = await reconcileConventionFields("section", sid, sData);
			await api("PUT", API.sections + "/" + sid, {
				data: sData,
				title: section.title,
			});
			toast("Image settings saved.", "success");
			await refreshAfterEdit(sid, schemaId);
		} catch (err) {
			toast("Image settings save failed: " + err.message, "error");
		}
	}

	/**
	 * removeBackgroundImage(hostEl)
	 * Completely removes the background image from a section or product.
	 * Fresh-GETs the data, deletes _background_image and _background_settings,
	 * PUTs the cleaned data, best-effort deletes the orphaned image file, and
	 * triggers a refresh so the element loses its background visually.
	 */
	async function removeBackgroundImage(hostEl) {
		var sectionEl =
			hostEl.closest("[data-section-id]") ||
			(hostEl.hasAttribute && hostEl.hasAttribute("data-section-id")
				? hostEl
				: null);
		var productCard = hostEl.closest(".product-card[data-product-slug]");

		try {
			if (productCard) {
				var slug = productCard.getAttribute("data-product-slug");
				var product = await api("GET", API.products + "/" + slug);
				var pData = product.data ? deepClone(product.data) : {};
				var oldSrc = pData._background_image || null;
				delete pData._background_image;
				delete pData._background_settings;
				await api("PUT", API.products + "/" + slug, {
					name: product.name,
					category: product.category,
					status: product.status,
					data: pData,
				});
				toast("Background image removed.", "success");
				if (window.AGF && window.AGF.refreshProducts) {
					await window.AGF.refreshProducts();
				}
				await deleteUploadedAsset(oldSrc);
			} else if (sectionEl) {
				var sid = sectionEl.getAttribute("data-section-id");
				var schemaId = sectionEl.getAttribute("data-schema") || "";
				var section = await api("GET", API.sections + "/" + sid);
				var sData = section.data ? deepClone(section.data) : {};
				var oldSrc = sData._background_image || null;
				delete sData._background_image;
				delete sData._background_settings;
				await api("PUT", API.sections + "/" + sid, {
					data: sData,
					title: section.title,
				});
				toast("Background image removed.", "success");
				await refreshAfterEdit(sid, schemaId);
				await deleteUploadedAsset(oldSrc);
			} else {
				toast(
					"Could not find a section or product to remove background from.",
					"error",
				);
			}
		} catch (err) {
			toast("Background image removal failed: " + err.message, "error");
		}
	}

	// ---------- text enhance panel ------------------------------------------
	let _enhanceCounter = 0; // unique ID counter for enhanced elements

	/**
	 * openEnhancePanel(target, container)
	 * Opens a floating panel near the right-click target that allows adjusting
	 * font-size, font-weight, text-transform, letter-spacing, and line-height
	 * on the closest text-bearing element.
	 */
	function openEnhancePanel(target, container) {
		// Close any existing panel
		removeEnhancePanel();

		// Find the closest text-bearing element
		const textEl = target.closest(
			"h1, h2, h3, h4, h5, h6, p, span, li, dt, dd, em, strong, a, .section-title, .section-deck, .eyebrow, .tenet-body-text, .tech-tagline, .ptag, .m-kind",
		);
		if (!textEl) {
			toast("No text element found at this position.", "error");
			return;
		}

		const computed = window.getComputedStyle(textEl);
		const currentSize = parseFloat(computed.fontSize) || 16;
		const currentWeight = parseInt(computed.fontWeight, 10) || 400;
		const currentTransform = computed.textTransform || "none";
		const currentSpacing = parseFloat(computed.letterSpacing) || 0;
		const currentLineHeight =
			parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.5;
		const currentColor = computed.color || "#000000";

		// Assign a unique enh-id if not already present
		if (!textEl.hasAttribute("data-enh-id")) {
			textEl.setAttribute("data-enh-id", "enh-" + ++_enhanceCounter);
		}
		textEl.setAttribute("data-enhanced", "1");

		// Resolve a stable override key for this element via the shared helper.
		// Clear any stale key attrs first so a stale data-enh-selector doesn't
		// mask a now-available data-field ancestor.
		textEl.removeAttribute("data-enh-field");
		textEl.removeAttribute("data-enh-selector");
		resolveEnhanceKey(textEl, container);

		const panel = el("div", { class: "enhance-panel" });

		// Size
		panel.appendChild(
			el("div", { class: "enhance-field" }, [
				el("label", { text: "Size (px)" }),
				el("input", {
					type: "number",
					class: "enh-input",
					id: "enh-size",
					value: String(Math.round(currentSize)),
					min: "8",
					max: "120",
					step: "1",
					onInput: () => applyEnhance(textEl),
				}),
			]),
		);

		// Weight
		panel.appendChild(
			el("div", { class: "enhance-field" }, [
				el("label", { text: "Weight" }),
				el("input", {
					type: "range",
					class: "enhance-range",
					id: "enh-weight",
					value: String(currentWeight),
					min: "100",
					max: "900",
					step: "100",
					onInput: () => applyEnhance(textEl),
				}),
				el("span", {
					class: "enhance-range-val",
					id: "enh-weight-val",
					text: String(currentWeight),
				}),
			]),
		);

		// Structure (text-transform)
		panel.appendChild(
			el("div", { class: "enhance-field" }, [
				el("label", { text: "Structure" }),
				el(
					"select",
					{
						class: "enh-select",
						id: "enh-transform",
						onChange: () => applyEnhance(textEl),
					},
					[
						el("option", {
							value: "none",
							text: "None",
							...(currentTransform === "none" && { selected: "" }),
						}),
						el("option", {
							value: "uppercase",
							text: "UPPERCASE",
							...(currentTransform === "uppercase" && { selected: "" }),
						}),
						el("option", {
							value: "lowercase",
							text: "lowercase",
							...(currentTransform === "lowercase" && { selected: "" }),
						}),
						el("option", {
							value: "capitalize",
							text: "Capitalize",
							...(currentTransform === "capitalize" && { selected: "" }),
						}),
					],
				),
			]),
		);

		// Letter spacing
		panel.appendChild(
			el("div", { class: "enhance-field" }, [
				el("label", { text: "Letter spacing (em)" }),
				el("input", {
					type: "number",
					class: "enh-input",
					id: "enh-spacing",
					value: String((currentSpacing / currentSize).toFixed(3)),
					min: "-0.1",
					max: "1",
					step: "0.01",
					onInput: () => applyEnhance(textEl),
				}),
			]),
		);

		// Line height
		panel.appendChild(
			el("div", { class: "enhance-field" }, [
				el("label", { text: "Line height" }),
				el("input", {
					type: "number",
					class: "enh-input",
					id: "enh-lineheight",
					value: String((currentLineHeight / currentSize).toFixed(2)),
					min: "0.8",
					max: "3",
					step: "0.05",
					onInput: () => applyEnhance(textEl),
				}),
			]),
		);

		// Color
		// Convert rgb(r, g, b) to hex for native color input
		var colorHex = "#000000";
		if (currentColor.indexOf("rgb") === 0) {
			var parts = currentColor.match(/\d+/g);
			if (parts && parts.length >= 3) {
				colorHex =
					"#" +
					parts
						.slice(0, 3)
						.map((v) => ("0" + parseInt(v, 10).toString(16)).slice(-2))
						.join("");
			}
		} else if (currentColor.indexOf("#") === 0) {
			colorHex = currentColor;
		}
		panel.appendChild(
			el("div", { class: "enhance-field" }, [
				el("label", { text: "Color" }),
				el("input", {
					type: "color",
					class: "enh-input enh-color",
					id: "enh-color",
					value: colorHex,
					onInput: () => applyEnhance(textEl),
				}),
			]),
		);

		// --- Paragraph section ---
		var currentAlign = computed.textAlign || "left";
		// Some browsers return 'start' or 'end'; normalise to left/right/center/none.
		if (currentAlign === "start") currentAlign = "left";
		else if (currentAlign === "end") currentAlign = "right";
		if (["left", "center", "right"].indexOf(currentAlign) === -1)
			currentAlign = "left";
		var currentMarginBottom = parseFloat(computed.marginBottom) || 0;
		var currentMarginEm = (currentMarginBottom / currentSize).toFixed(2);

		panel.appendChild(
			el("div", { class: "enhance-group-title", text: "Paragraph" }),
		);

		// Alignment segmented control: Default / Left / Center / Right
		var alignGroup = el("div", { class: "enh-align-group" });
		var alignOptions = [
			{ value: "", label: "Default", icon: "⟷" },
			{ value: "left", label: "Left", icon: "⟸" },
			{ value: "center", label: "Center", icon: "↔" },
			{ value: "right", label: "Right", icon: "⟹" },
		];
		alignOptions.forEach((opt) => {
			var isActive =
				(opt.value === "" &&
					(currentAlign === "left" || !textEl.style.textAlign)) ||
				opt.value === currentAlign;
			// If textEl has no explicit inline text-align, "Default" is active.
			if (textEl.style.textAlign) {
				isActive = textEl.style.textAlign === opt.value;
			}
			var btn = el("button", {
				type: "button",
				class: "enh-align-btn" + (isActive ? " is-active" : ""),
				title: opt.label,
				text: opt.icon,
				onClick: () => {
					// Clear all active states in this group
					alignGroup.querySelectorAll(".enh-align-btn").forEach((b) => {
						b.classList.remove("is-active");
					});
					btn.classList.add("is-active");
					// Set or clear text-align
					if (opt.value === "") {
						textEl.style.textAlign = "";
					} else {
						textEl.style.textAlign = opt.value;
					}
					applyEnhance(textEl);
				},
			});
			alignGroup.appendChild(btn);
		});
		panel.appendChild(alignGroup);

		// --- Placement: Left / Center / Right of the section column ---
		// Margin-based block placement (DISTINCT from text-align above which is
		// glyph justification). Moves the text BOX within its parent column.
		panel.appendChild(
			el("div", { class: "enhance-group-title", text: "Placement" }),
		);
		var placeGroup = el("div", { class: "enh-align-group" });
		var placeOptions = [
			{ value: "", label: "Default", icon: "⋯" },
			{ value: "left", label: "Left", icon: "⇤" },
			{ value: "center", label: "Center", icon: "↔" },
			{ value: "right", label: "Right", icon: "⇥" },
		];
		// Detect current placement from INLINE styles only (so default stylesheet
		// centering like .team-note-body { margin: 0 auto } doesn't falsely
		// pre-activate a button — only explicit overrides show as active).
		var stMarginLeft = textEl.style.marginLeft;
		var stMarginRight = textEl.style.marginRight;
		var stPlacement = "";
		if (stMarginLeft === "0px" && stMarginRight === "auto")
			stPlacement = "left";
		else if (stMarginLeft === "auto" && stMarginRight === "0px")
			stPlacement = "right";
		else if (stMarginLeft === "auto" && stMarginRight === "auto")
			stPlacement = "center";
		placeOptions.forEach((opt) => {
			var isActive = opt.value === stPlacement;
			var btn = el("button", {
				type: "button",
				class: "enh-align-btn" + (isActive ? " is-active" : ""),
				title: opt.label,
				text: opt.icon,
				onClick: () => {
					placeGroup.querySelectorAll(".enh-align-btn").forEach((b) => {
						b.classList.remove("is-active");
					});
					btn.classList.add("is-active");
					if (opt.value === "") {
						textEl.style.marginLeft = "";
						textEl.style.marginRight = "";
						textEl.style.textAlign = "";
						textEl.style.display = "";
						textEl.style.width = "";
					} else {
						var disp = window.getComputedStyle(textEl).display;
						if (disp === "inline" || disp === "inline-block") {
							// Inline elements can't be positioned by auto margins, and using
							// margins would collide with the Nudge feature's margin-left
							// (the off-screen bug). Promote to a full-width block and
							// position the text via text-align instead — no margin conflict.
							textEl.style.display = "block";
							textEl.style.width = "";
							textEl.style.marginLeft = "";
							textEl.style.marginRight = "";
							textEl.style.textAlign = opt.value;
						} else {
							textEl.style.textAlign = "";
							if (opt.value === "left") {
								textEl.style.marginLeft = "0px";
								textEl.style.marginRight = "auto";
							} else if (opt.value === "center") {
								textEl.style.marginLeft = "auto";
								textEl.style.marginRight = "auto";
							} else if (opt.value === "right") {
								textEl.style.marginLeft = "auto";
								textEl.style.marginRight = "0px";
							}
						}
					}
					applyEnhance(textEl);
				},
			});
			placeGroup.appendChild(btn);
		});
		panel.appendChild(placeGroup);

		// --- Width: Auto / Margin-to-Margin (full-width override) ---
		// Overrides the element's max-width constraint so the block spans its
		// parent column edge-to-edge. Works on .section-deck, .lede,
		// .team-note-body, etc. (constraint lives directly on the element).
		panel.appendChild(
			el("div", { class: "enhance-group-title", text: "Width" }),
		);
		var widthGroup = el("div", { class: "enh-align-group" });
		var widthOptions = [
			{ value: "auto", label: "Auto", icon: "▭" },
			{ value: "full", label: "Margin-to-Margin", icon: "⬌" },
		];
		// Detect current width mode from INLINE styles only.
		var stMaxWidth = textEl.style.maxWidth;
		var stWidthMode = stMaxWidth === "none" ? "full" : "auto";
		widthOptions.forEach((opt) => {
			var isActive = opt.value === stWidthMode;
			var btn = el("button", {
				type: "button",
				class: "enh-align-btn is-wide" + (isActive ? " is-active" : ""),
				title: opt.label,
				text: opt.label,
				onClick: () => {
					widthGroup.querySelectorAll(".enh-align-btn").forEach((b) => {
						b.classList.remove("is-active");
					});
					btn.classList.add("is-active");
					if (opt.value === "auto") {
						textEl.style.maxWidth = "";
						textEl.style.width = "";
						textEl.style.marginLeft = "";
						textEl.style.marginRight = "";
					} else {
						textEl.style.maxWidth = "none";
						// For elements inside .hero-stage, span the full stage/inner width
						var heroStage = textEl.closest(".hero-stage");
						if (heroStage) {
							var heroInner = heroStage.parentElement;
							var fullWidth = heroInner
								? heroInner.offsetWidth
								: heroStage.offsetWidth;
							var elRect = textEl.getBoundingClientRect();
							var stageRect = (heroInner || heroStage).getBoundingClientRect();
							var offsetLeft = elRect.left - stageRect.left;
							textEl.style.width = fullWidth + "px";
							textEl.style.marginLeft = -offsetLeft + "px";
							textEl.style.marginRight = "0px";
						} else {
							textEl.style.width = "100%";
							textEl.style.marginLeft = "0px";
							textEl.style.marginRight = "0px";
						}
					}
					applyEnhance(textEl);
				},
			});
			widthGroup.appendChild(btn);
		});
		panel.appendChild(widthGroup);

		// Space after (margin-bottom in em)
		panel.appendChild(
			el("div", { class: "enhance-field" }, [
				el("label", { text: "Space after (em)" }),
				el("input", {
					type: "number",
					class: "enh-input",
					id: "enh-margin-bottom",
					value: String(currentMarginEm),
					min: "0",
					max: "10",
					step: "0.1",
					onInput: () => applyEnhance(textEl),
				}),
			]),
		);

		// Hint: how to force a new paragraph
		panel.appendChild(
			el("p", {
				class: "enh-hint",
				text: "↵ For a new paragraph, edit the text field directly and add a blank line.",
			}),
		);

		// Actions
		const actions = el("div", { class: "enhance-actions" });
		actions.appendChild(
			el("button", {
				type: "button",
				class: "enhance-btn enhance-reset",
				text: "Reset",
				onClick: () => {
					// Clear live inline styles
					textEl.removeAttribute("data-enhanced");
					textEl.removeAttribute("data-enh-id");
					var resetKey =
						textEl.getAttribute("data-enh-field") ||
						textEl.getAttribute("data-enh-selector");
					textEl.removeAttribute("data-enh-field");
					textEl.removeAttribute("data-enh-selector");
					textEl.style.cssText = textEl.style.cssText
						.replace(/font-size:[^;]+;?/g, "")
						.replace(/font-weight:[^;]+;?/g, "")
						.replace(/text-transform:[^;]+;?/g, "")
						.replace(/letter-spacing:[^;]+;?/g, "")
						.replace(/line-height:[^;]+;?/g, "")
						.replace(/color:[^;]+;?/g, "")
						.replace(/text-align:[^;]+;?/g, "")
						.replace(/margin-bottom:[^;]+;?/g, "")
						.replace(/margin-left:[^;]+;?/g, "")
						.replace(/margin-right:[^;]+;?/g, "")
						.replace(/max-width:[^;]+;?/g, "")
						.replace(/width:[^;]+;?/g, "");
					removeEnhancePanel();
					// Persist the removal so the override doesn't re-appear on next render.
					if (resetKey) {
						persistStyleOverrides(container, {}, resetKey);
					} else {
						toast("Style reset.", "info");
					}
				},
			}),
		);
		actions.appendChild(
			el("button", {
				type: "button",
				class: "enhance-btn enhance-apply",
				text: "Apply",
				onClick: () => {
					removeEnhancePanel();
					// Gather all enhanced overrides from the host container (so other
					// elements' styles are preserved), then PUT to persist.
					var overrides = collectStyleOverrides(container);
					if (overrides) {
						persistStyleOverrides(container, overrides, null);
					} else {
						toast("No style changes to save.", "info");
					}
				},
			}),
		);
		panel.appendChild(actions);

		// --- Remove Text (destructive) ---
		// Only show if the text element is within a [data-field] that maps to a
		// section data key — otherwise we can't know which field to null out.
		var removeFieldEl = textEl.closest("[data-field]");
		if (removeFieldEl) {
			panel.appendChild(
				el("button", {
					type: "button",
					class: "enh-remove-text",
					text: "🗑 Remove Text",
					onClick: () => {
						confirmDialog(
							"Remove this text?",
							"The text content will be permanently deleted from this section.",
							"Remove",
							() => {
								removeEnhancePanel();
								return removeTextField(
									container,
									removeFieldEl.getAttribute("data-field"),
								);
							},
						);
					},
				}),
			);
		}

		// Position near the target element
		const rect = textEl.getBoundingClientRect();
		panel.style.position = "fixed";
		panel.style.top = Math.max(8, rect.top - 10) + "px";
		panel.style.left =
			Math.min(window.innerWidth - 710, rect.right + 12) + "px";

		document.body.appendChild(panel);

		// Close on outside click
		setTimeout(() => {
			document.addEventListener("mousedown", function onDocClick(ev) {
				if (!panel.contains(ev.target) && ev.target !== textEl) {
					removeEnhancePanel();
					document.removeEventListener("mousedown", onDocClick);
				}
			});
		}, 0);
	}

	function applyEnhance(textEl) {
		const sizeInput = document.getElementById("enh-size");
		const weightInput = document.getElementById("enh-weight");
		const transformSelect = document.getElementById("enh-transform");
		const spacingInput = document.getElementById("enh-spacing");
		const lineHeightInput = document.getElementById("enh-lineheight");
		const marginBottomInput = document.getElementById("enh-margin-bottom");
		const colorInput = document.getElementById("enh-color");
		const weightVal = document.getElementById("enh-weight-val");

		if (!sizeInput || !weightInput) return;

		const size = sizeInput.value;
		const weight = weightInput.value;
		const transform = transformSelect ? transformSelect.value : "none";
		const spacing = spacingInput ? spacingInput.value : "0";
		const lineHeight = lineHeightInput ? lineHeightInput.value : "1.5";
		const marginBottom = marginBottomInput ? marginBottomInput.value : "0";
		const color = colorInput ? colorInput.value : "";

		textEl.style.fontSize = size + "px";
		textEl.style.fontWeight = weight;
		textEl.style.textTransform = transform;
		textEl.style.letterSpacing = spacing + "em";
		textEl.style.lineHeight = lineHeight;
		if (color) textEl.style.color = color;
		// Paragraph controls — margin-bottom (em). text-align is set directly by
		// the alignment button handler (so it can clear it for "Default"), but
		// we still apply margin-bottom here on every live update.
		if (marginBottom !== "" && parseFloat(marginBottom) !== 0) {
			textEl.style.marginBottom = marginBottom + "em";
		} else {
			textEl.style.marginBottom = "";
		}

		if (weightVal) weightVal.textContent = weight;
	}

	function removeEnhancePanel() {
		const panel = document.querySelector(".enhance-panel");
		if (panel) panel.remove();
	}

	/**
	 * removeTextField(container, fieldPath)
	 * Removes a text field from the section data by setting it to null/empty.
	 * Supports dotted paths (e.g. "strapline" or "headline"). Fresh-GETs the
	 * section, nulls the field, PUTs, and refreshes.
	 */
	async function removeTextField(container, fieldPath) {
		var sectionEl =
			container.closest("[data-section-id]") ||
			(container.hasAttribute && container.hasAttribute("data-section-id")
				? container
				: null);
		var productCard = container.closest(".product-card[data-product-slug]");

		if (!fieldPath) {
			toast("Cannot determine which text field to remove.", "error");
			return;
		}

		try {
			if (productCard) {
				var slug = productCard.getAttribute("data-product-slug");
				var product = await api("GET", API.products + "/" + slug);
				var pData = product.data ? deepClone(product.data) : {};
				setNestedField(pData, fieldPath, null);
				await api("PUT", API.products + "/" + slug, {
					name: product.name,
					category: product.category,
					status: product.status,
					data: pData,
				});
				toast("Text removed.", "success");
				if (window.AGF && window.AGF.refreshProducts) {
					await window.AGF.refreshProducts();
				}
			} else if (sectionEl) {
				var sid = sectionEl.getAttribute("data-section-id");
				var schemaId = sectionEl.getAttribute("data-schema") || "";
				var section = await api("GET", API.sections + "/" + sid);
				var sData = section.data ? deepClone(section.data) : {};
				setNestedField(sData, fieldPath, null);
				// Also remove any style overrides keyed to this field
				if (sData._style_overrides) {
					Object.keys(sData._style_overrides).forEach((key) => {
						if (key === fieldPath || key.startsWith(fieldPath + " > ")) {
							delete sData._style_overrides[key];
						}
					});
					if (Object.keys(sData._style_overrides).length === 0) {
						delete sData._style_overrides;
					}
				}
				await api("PUT", API.sections + "/" + sid, {
					data: sData,
					title: section.title,
				});
				toast("Text removed.", "success");
				await refreshAfterEdit(sid, schemaId);
			} else {
				toast("Could not find a section or product to save into.", "error");
			}
		} catch (err) {
			toast("Text removal failed: " + err.message, "error");
		}
	}

	/**
	 * setNestedField(obj, path, value)
	 * Sets a (possibly dotted) field path on obj to the given value.
	 * E.g. setNestedField(data, 'specs.weight', null) → data.specs.weight = null
	 */
	function setNestedField(obj, path, value) {
		var parts = path.split(".");
		var cur = obj;
		for (var i = 0; i < parts.length - 1; i++) {
			if (cur[parts[i]] === undefined || cur[parts[i]] === null) return;
			cur = cur[parts[i]];
		}
		var lastKey = parts[parts.length - 1];
		if (value === null) {
			delete cur[lastKey];
		} else {
			cur[lastKey] = value;
		}
	}

	/**
	 * resolveEnhanceKey(el, container)
	 * Derives a stable override key for the given enhanced element, mirroring
	 * the key logic used by openEnhancePanel. Sets data-enh-field (or
	 * data-enh-selector) on the element as a side effect so subsequent calls —
	 * including after a re-render — are O(1) and the stable key survives.
	 *
	 * Returns the derived key string (empty string if none could be derived).
	 * Produces IDENTICAL keys to the original openEnhancePanel logic.
	 */
	function resolveEnhanceKey(el, container) {
		// Fast path: attr already present (set by openEnhancePanel or restored
		// by applyStyleOverrides after a re-render).
		var existing =
			el.getAttribute("data-enh-field") || el.getAttribute("data-enh-selector");
		if (existing) return existing;
		// Re-derive from the closest [data-field] ancestor.
		var fieldEl = el.closest("[data-field]");
		if (fieldEl) {
			var fieldPath = fieldEl.getAttribute("data-field");
			var key;
			if (el === fieldEl) {
				// The element itself carries the data-field — key is the path.
				key = fieldPath;
			} else {
				// The element is a descendant of the data-field element.
				// Disambiguate by appending a relative selector within the card.
				var relSel = buildElementSelector(el, fieldEl);
				key = relSel ? fieldPath + " > " + relSel : fieldPath;
			}
			el.setAttribute("data-enh-field", key);
			return key;
		}
		// No data-field ancestor — legacy nth-of-type selector relative to container.
		var legacySel = buildElementSelector(el, container);
		if (legacySel) el.setAttribute("data-enh-selector", legacySel);
		return legacySel || "";
	}

	/**
	 * collectStyleOverrides(container)
	 * Walks the container for [data-enhanced] elements and builds a
	 * _style_overrides map keyed by a stable data-field path (or legacy
	 * CSS selector). Re-derives missing keys via resolveEnhanceKey so keys
	 * never silently degrade to fragile selectors after a re-render.
	 */
	function collectStyleOverrides(container) {
		const overrides = {};
		const enhanced = container.querySelectorAll("[data-enhanced]");
		enhanced.forEach((el) => {
			const styles = {};
			if (el.style.fontSize) styles["font-size"] = el.style.fontSize;
			if (el.style.fontWeight) styles["font-weight"] = el.style.fontWeight;
			if (el.style.textTransform && el.style.textTransform !== "none")
				styles["text-transform"] = el.style.textTransform;
			if (el.style.letterSpacing)
				styles["letter-spacing"] = el.style.letterSpacing;
			if (el.style.lineHeight) styles["line-height"] = el.style.lineHeight;
			if (el.style.color) styles["color"] = el.style.color;
			if (el.style.textAlign) styles["text-align"] = el.style.textAlign;
			if (el.style.marginBottom)
				styles["margin-bottom"] = el.style.marginBottom;
			if (el.style.marginLeft) styles["margin-left"] = el.style.marginLeft;
			if (el.style.marginRight) styles["margin-right"] = el.style.marginRight;
			if (el.style.maxWidth) styles["max-width"] = el.style.maxWidth;
			if (el.style.width) styles["width"] = el.style.width;
			if (el.style.display) styles["display"] = el.style.display;
			if (Object.keys(styles).length === 0) return;
			// Key by stable data-field path. resolveEnhanceKey re-derives the key
			// (and restores data-enh-field) when the attr is missing post-render.
			var key = resolveEnhanceKey(el, container);
			if (key) overrides[key] = styles;
		});
		return Object.keys(overrides).length > 0 ? overrides : undefined;
	}

	/**
	 * persistStyleOverrides(hostContainer, newOverrides, removeKey)
	 * Fetches the host section/product data, merges the new _style_overrides
	 * (or removes a single key if removeKey is set), PUTs to the API, and
	 * triggers a refresh so persisted styles re-apply cleanly.
	 *
	 * hostContainer = the section/product element clicked on.
	 * newOverrides  = freshly collected overrides (from collectStyleOverrides).
	 * removeKey     = if non-null, delete this key from existing overrides.
	 */
	async function persistStyleOverrides(hostContainer, newOverrides, removeKey) {
		// Resolve host section or product
		var sectionEl =
			hostContainer.closest("[data-section-id]") ||
			(hostContainer.hasAttribute &&
			hostContainer.hasAttribute("data-section-id")
				? hostContainer
				: null);
		var productCard = hostContainer.closest(".product-card[data-product-slug]");

		try {
			if (productCard) {
				// --- Product ---
				var slug = productCard.getAttribute("data-product-slug");
				var product = await api("GET", API.products + "/" + slug);
				var pData = product.data ? deepClone(product.data) : {};
				var existing = pData._style_overrides
					? deepClone(pData._style_overrides)
					: {};
				if (removeKey) {
					delete existing[removeKey];
				} else {
					Object.assign(existing, newOverrides);
				}
				// Only keep _style_overrides if non-empty
				if (Object.keys(existing).length > 0) pData._style_overrides = existing;
				else delete pData._style_overrides;
				await api("PUT", API.products + "/" + slug, {
					name: product.name,
					category: product.category,
					status: product.status,
					data: pData,
				});
				toast(removeKey ? "Style reset & saved." : "Style saved.", "success");
				if (window.AGF && window.AGF.refreshProducts) {
					await window.AGF.refreshProducts();
				}
			} else if (sectionEl) {
				// --- Section ---
				var sid = sectionEl.getAttribute("data-section-id");
				var schemaId = sectionEl.getAttribute("data-schema") || "";
				// ALWAYS fresh-GET the section (never the stale state.sections
				// snapshot) so the PUT's sData doesn't clobber a concurrent edit.
				var section = await api("GET", API.sections + "/" + sid);
				var sData = section.data ? deepClone(section.data) : {};
				var existingSec = sData._style_overrides
					? deepClone(sData._style_overrides)
					: {};
				if (removeKey) {
					delete existingSec[removeKey];
				} else {
					Object.assign(existingSec, newOverrides);
				}
				if (Object.keys(existingSec).length > 0)
					sData._style_overrides = existingSec;
				else delete sData._style_overrides;
				await api("PUT", API.sections + "/" + sid, {
					data: sData,
					title: section.title,
				});
				toast(removeKey ? "Style reset & saved." : "Style saved.", "success");
				await refreshAfterEdit(sid, schemaId);
			} else {
				toast("Could not find a section or product to save into.", "error");
			}
		} catch (err) {
			toast("Style save failed: " + err.message, "error");
		}
	}

	/**
	 * buildElementSelector(el, root)
	 * Builds a CSS selector path from root to el using tag names and
	 * nth-of-type for disambiguation. Used to re-apply styles after re-render.
	 */
	function buildElementSelector(el, root) {
		if (!el || el === root) return "";
		const parts = [];
		let cur = el;
		while (cur && cur !== root) {
			let selector = cur.tagName.toLowerCase();
			// Disambiguate with nth-of-type among same-tag siblings
			const parent = cur.parentElement;
			if (parent) {
				const siblings = Array.from(parent.children).filter(
					(s) => s.tagName === cur.tagName,
				);
				if (siblings.length > 1) {
					const idx = siblings.indexOf(cur) + 1;
					selector += ":nth-of-type(" + idx + ")";
				}
			}
			// Add class if it's a distinguishing class
			if (cur.className && typeof cur.className === "string") {
				const cls = cur.className
					.split(/\s+/)
					.filter(
						(c) =>
							c &&
							c !== "is-in" &&
							c !== "is-editing" &&
							c !== "is-dragover" &&
							c !== "is-enhanced",
					)[0];
				if (cls) selector += "." + cls;
			}
			parts.unshift(selector);
			cur = cur.parentElement;
		}
		return parts.join(" > ");
	}

	// ---------- schema picker (Add Section via nav button) -------------------
	async function openSchemaPicker(anchor) {
		$$(".schema-picker").forEach((n) => n.remove());

		let schemas;
		try {
			schemas = await getSchemaList();
		} catch (err) {
			toast("Could not load schemas: " + err.message, "error");
			return;
		}

		const picker = el("div", { class: "schema-picker" });
		schemas
			.filter((sch) => sch.id !== "product")
			.forEach((sch) => {
				const row = el(
					"div",
					{
						class: "schema-picker-item",
						onClick: async () => {
							picker.remove();
							await createSection(sch.id);
						},
					},
					[
						el("span", { class: "schema-picker-icon", text: sch.icon || "◆" }),
						el("div", { class: "schema-picker-meta" }, [
							el("strong", { text: sch.name || sch.id }),
							sch.description ? el("p", { text: sch.description }) : null,
						]),
					],
				);
				picker.appendChild(row);
			});

		// ── Export Website: bundle the rendered presentation site (no editor) ──
		const exportRow = el(
			"div",
			{
				class: "schema-picker-item schema-picker-export",
				onClick: () => {
					picker.remove();
					toast("Packaging website for download…", "info");
					window.location.href = "/api/export/website";
				},
			},
			[
				el("span", { class: "schema-picker-icon", text: "📦" }),
				el("div", { class: "schema-picker-meta" }, [
					el("strong", { text: "Export Website" }),
					el("p", { text: "Download the rendered site as a .zip" }),
				]),
			],
		);
		picker.appendChild(exportRow);

		anchor.style.position = "relative";
		anchor.appendChild(picker);

		// Click-outside to close
		setTimeout(() => {
			document.addEventListener("click", function onDocClick(e) {
				if (!picker.contains(e.target) && e.target !== anchor) {
					picker.remove();
					document.removeEventListener("click", onDocClick);
				}
			});
		}, 0);
	}

	async function createSection(schemaId) {
		try {
			const sch = await getSchema(schemaId);
			// Prefer structural defaults (empty strings/arrays/booleans) derived
			// from the schema itself, so the user always opens a clean form they
			// can fill in themselves. Fall back to sch.default_data (or {}) if
			// for some reason the schema_json isn't available.
			let defaultData = {};
			if (sch.schema_json && typeof sch.schema_json === "object") {
				try {
					defaultData = defaultFor(sch.schema_json);
				} catch (_) {
					defaultData =
						sch.default_data && typeof sch.default_data === "object"
							? sch.default_data
							: {};
				}
			} else if (sch.default_data && typeof sch.default_data === "object") {
				defaultData = sch.default_data;
			}
			const stateSecs =
				(window.AGF && window.AGF.state && window.AGF.state.sections) || [];
			const nextOrder = await computeInsertOrder(stateSecs);

			const created = await api("POST", API.sections, {
				schema_id: schemaId,
				title: sch.name || schemaId,
				data: defaultData,
				display_order: nextOrder,
				is_visible: true,
			});
			toast("Section added.", "success");
			if (window.AGF && window.AGF.refreshAll) {
				await window.AGF.refreshAll();
			}
			// Scroll the freshly created section into view so it lands where the
			// user expected (directly below the last-clicked anchor).
			var newId = created && created.id != null ? String(created.id) : null;
			if (newId) {
				requestAnimationFrame(() => {
					var node = document.querySelector(
						'[data-section-id="' + cssAttrEscape(newId) + '"]',
					);
					if (node)
						node.scrollIntoView({ behavior: "smooth", block: "center" });
				});
			}
		} catch (err) {
			toast("Add failed: " + err.message, "error");
		}
	}

	// Escape a string for safe interpolation into a CSS attribute selector.
	function cssAttrEscape(str) {
		return String(str).replace(/(["\\])/g, "\\$1");
	}

	// Determine the display_order for a newly inserted section: place it just
	// below the last-clicked anchor when possible (midpoint between the anchor
	// and the next section), otherwise append at the bottom (max + 1). Includes
	// a precision guard that re-spreads integer orders if the midpoint gap
	// collapses below 0.0001.
	async function computeInsertOrder(stateSecs) {
		var sorted = stateSecs
			.slice()
			.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
		function appendMax() {
			return sorted.reduce((m, s) => Math.max(m, s.display_order || 0), 0) + 1;
		}
		if (!_lastAnchorSectionId) return appendMax();
		var anchorIdx = sorted.findIndex(
			(s) => String(s.id) === String(_lastAnchorSectionId),
		);
		if (anchorIdx === -1) return appendMax();
		var anchorOrder = sorted[anchorIdx].display_order || 0;
		// Anchor is the last section → just append after it.
		if (anchorIdx >= sorted.length - 1) return anchorOrder + 1;
		var nextOrder = sorted[anchorIdx + 1].display_order || 0;
		if (Math.abs(nextOrder - anchorOrder) < 0.0001) {
			// Precision guard: re-spread integer orders so there is room.
			await renumberSpread(sorted, anchorIdx);
			return anchorOrder + 1;
		}
		return (anchorOrder + nextOrder) / 2;
	}

	// Reassign contiguous integer display_order values to the anchor and all
	// sections below it, leaving a one-unit gap right after the anchor for the
	// incoming section. Sends parallel PATCH /api/sections/:id/order requests
	// and keeps window.AGF.state in sync.
	async function renumberSpread(sorted, anchorIdx) {
		var base = Math.floor(sorted[anchorIdx].display_order || 0);
		var patches = [];
		for (var i = anchorIdx; i < sorted.length; i++) {
			var newOrd = base + (i - anchorIdx) + (i > anchorIdx ? 1 : 0);
			patches.push({ id: sorted[i].id, order: newOrd });
			sorted[i].display_order = newOrd;
		}
		await Promise.all(
			patches.map((p) =>
				api("PATCH", API.sections + "/" + encodeURIComponent(p.id) + "/order", {
					display_order: p.order,
				}),
			),
		);
	}

	// Helper: refresh the correct container after editing a section.
	// Header/footer sections need renderHeaderFooter(); others use refreshSection.
	async function refreshAfterEdit(id, schemaId) {
		if (schemaId === "header" || schemaId === "footer") {
			if (window.AGF && window.AGF.refreshAll) {
				await window.AGF.refreshAll();
			}
		} else {
			if (window.AGF && window.AGF.refreshSection) {
				await window.AGF.refreshSection(id);
			}
		}
	}

	// ---------- inline section edit form -----------------------------------
	async function openSectionEdit(sec) {
		const id = sec.getAttribute("data-section-id");
		const schemaId = sec.getAttribute("data-schema");
		if (!id || !schemaId) {
			toast("Missing section metadata.", "error");
			return;
		}
		// Already editing?
		if (sec.classList.contains("is-editing")) return;
		const existing = sec.querySelector(":scope > .edit-form-overlay");
		if (existing) {
			existing.remove();
			sec.classList.remove("is-editing");
			return;
		}

		let schema, section;
		try {
			[schema, section] = await Promise.all([
				getSchema(schemaId),
				api("GET", API.sections + "/" + id),
			]);
		} catch (err) {
			toast("Load failed: " + err.message, "error");
			return;
		}

		sec.classList.add("is-editing");

		const overlay = el("div", { class: "edit-form-overlay" });
		overlay.appendChild(
			el("h3", { text: "Edit · " + (schema.name || schemaId) }),
		);

		const titleWrap = el("div", { class: "form-field" }, [
			el("label", { text: "Nav label (side-nav only — not shown on page)" }),
			el("input", {
				type: "text",
				"data-meta": "title",
				value: section.title || "",
			}),
			el("p", {
				class: "field-hint",
				text: "To edit the visible heading, click it directly on the page.",
			}),
		]);
		overlay.appendChild(titleWrap);

		const formBody = el("div", { class: "edit-form-body" });
		currentEditCategory = "sections";
		currentEditSlug = (schemaId || section.schema_id || "section").toString();
		formBody.appendChild(
			generateForm(schema.schema_json || {}, section.data || {}, ""),
		);
		overlay.appendChild(formBody);

		// Appendix textarea + Cancel/Publish buttons
		const appendixWrap = el("div", { class: "appendix-field" });
		appendixWrap.appendChild(el("label", { text: "Appendix" }));
		const appendixTA = el("textarea", {
			placeholder:
				"Add notes, thoughts, supporting detail for the appendix\u2026",
			text: section.data && section.data.appendix ? section.data.appendix : "",
		});
		appendixWrap.appendChild(appendixTA);
		const appendixActions = el("div", { class: "appendix-actions" });
		appendixActions.appendChild(
			el("button", {
				type: "button",
				class: "btn-apx-cancel",
				text: "Cancel",
				onClick: () => {
					appendixTA.value = "";
				},
			}),
		);
		appendixActions.appendChild(
			el("button", {
				type: "button",
				class: "btn-apx-publish",
				text: "Publish to Appendix",
				onClick: async () => {
					const data = collectForm(formBody, true);
					const titleInput = overlay.querySelector('input[data-meta="title"]');
					const title = titleInput ? titleInput.value.trim() : section.title;
					data.appendix = appendixTA.value.trim();
					// Merge style overrides (don't replace/drop persisted ones)
					const styleOverrides = collectStyleOverrides(sec);
					const mergedApxOverrides = Object.assign(
						{},
						(section.data && section.data._style_overrides) || {},
						styleOverrides || {},
					);
					if (Object.keys(mergedApxOverrides).length)
						data._style_overrides = mergedApxOverrides;
					if (section.data && section.data._background_image)
						data._background_image = section.data._background_image;
					if (section.data && section.data._background_settings)
						data._background_settings = section.data._background_settings;
					if (
						section.data &&
						Array.isArray(section.data._figures) &&
						section.data._figures.length
					)
						data._figures = section.data._figures;
					if (
						section.data &&
						Array.isArray(section.data._texts) &&
						section.data._texts.length
					)
						data._texts = section.data._texts;
					try {
						await reconcileConventionFields("section", id, data);
						await api("PUT", API.sections + "/" + id, {
							data,
							title,
							replace: true,
						});
						sec.classList.remove("is-editing");
						overlay.remove();
						toast("Appendix published.", "success");
						await refreshAfterEdit(id, schemaId);
					} catch (err) {
						toast("Publish failed: " + err.message, "error");
					}
				},
			}),
		);
		appendixWrap.appendChild(appendixActions);
		overlay.appendChild(appendixWrap);

		overlay.appendChild(
			buildActions(
				async () => {
					const data = collectForm(formBody, true);
					const titleInput = overlay.querySelector('input[data-meta="title"]');
					const title = titleInput ? titleInput.value.trim() : section.title;
					// Preserve existing appendix when saving section content
					data.appendix =
						section.data && section.data.appendix ? section.data.appendix : "";
					// Collect text-enhance style overrides and MERGE with existing
					// persisted overrides so a section-edit save never replaces or
					// drops overrides the user can't see on screen.
					const styleOverrides = collectStyleOverrides(sec);
					const mergedOverrides = Object.assign(
						{},
						(section.data && section.data._style_overrides) || {},
						styleOverrides || {},
					);
					data._style_overrides = Object.keys(mergedOverrides).length
						? mergedOverrides
						: undefined;
					// Preserve _background_image if set
					if (section.data && section.data._background_image)
						data._background_image = section.data._background_image;
					if (section.data && section.data._background_settings)
						data._background_settings = section.data._background_settings;
					// Preserve _figures and _texts (convention fields NOT covered by
					// reconcileConventionFields in the race-free window between
					// form-open GET and save PUT).
					if (
						section.data &&
						Array.isArray(section.data._figures) &&
						section.data._figures.length
					)
						data._figures = section.data._figures;
					if (
						section.data &&
						Array.isArray(section.data._texts) &&
						section.data._texts.length
					)
						data._texts = section.data._texts;
					try {
						await reconcileConventionFields("section", id, data);
						await api("PUT", API.sections + "/" + id, {
							data,
							title,
							replace: true,
						});
						sec.classList.remove("is-editing");
						overlay.remove();
						await refreshAfterEdit(id, schemaId);
					} catch (err) {
						toast("Save failed: " + err.message, "error");
					}
				},
				() => {
					sec.classList.remove("is-editing");
					overlay.remove();
				},
			),
		);

		sec.appendChild(overlay);
		overlay.scrollIntoView({ behavior: "smooth", block: "center" });
	}

	function buildActions(onSave, onCancel) {
		return el("div", { class: "form-actions" }, [
			el("button", {
				type: "button",
				class: "btn-save",
				text: "Save",
				onClick: onSave,
			}),
			el("button", {
				type: "button",
				class: "btn-cancel",
				text: "Cancel",
				onClick: onCancel,
			}),
		]);
	}

	// ---------- product CRUD -----------------------------------------------
	async function openProductForm(slug, productsSection, targetCard) {
		let schema,
			product = null;
		try {
			schema = await getSchema("product");
			if (slug) product = await api("GET", API.products + "/" + slug);
		} catch (err) {
			toast("Load failed: " + err.message, "error");
			return;
		}

		// --- Editing an existing product card in-place ---
		if (targetCard) {
			if (targetCard.classList.contains("is-editing")) return;
			targetCard.classList.add("is-editing");

			const overlay = el("div", { class: "edit-form-overlay" });
			overlay.appendChild(el("h3", { text: "Edit product" }));

			const formBody = el("div", { class: "edit-form-body" });
			const data = product ? product.data || {} : {};
			currentEditCategory = "products";
			currentEditSlug =
				slug ||
				(data.name
					? String(data.name)
							.toLowerCase()
							.replace(/[^a-z0-9]+/g, "-")
							.replace(/^-|-$/g, "")
					: "general");
			formBody.appendChild(generateForm(schema.schema_json || {}, data, ""));
			overlay.appendChild(formBody);

			overlay.appendChild(
				buildActions(
					async () => {
						const collected = collectForm(formBody);
						const name = collected.name || (product && product.name);
						const category =
							collected.category || (product && product.category);
						const status =
							collected.status || (product && product.status) || "concept";
						if (!name) {
							toast("Name is required.", "error");
							return;
						}
						if (!category) {
							toast("Category is required.", "error");
							return;
						}
						// Preserve convention fields
						if (product && product.data && product.data._background_image)
							collected._background_image = product.data._background_image;
						if (product && product.data && product.data._background_settings)
							collected._background_settings =
								product.data._background_settings;
						if (product && product.data && product.data._style_overrides)
							collected._style_overrides = product.data._style_overrides;
						try {
							await reconcileConventionFields("product", slug, collected);
							await api("PUT", API.products + "/" + slug, {
								name,
								category,
								status,
								data: collected,
							});
							targetCard.classList.remove("is-editing");
							overlay.remove();
							if (window.AGF && window.AGF.refreshProducts) {
								await window.AGF.refreshProducts();
							}
						} catch (err) {
							toast("Save failed: " + err.message, "error");
						}
					},
					() => {
						targetCard.classList.remove("is-editing");
						overlay.remove();
					},
				),
			);

			targetCard.appendChild(overlay);
			overlay.scrollIntoView({ behavior: "smooth", block: "center" });
			return;
		}

		// --- Adding a new product: mount form above the grid ---
		const grid = productsSection.querySelector(".products");
		if (!grid) return;

		const prior = productsSection.querySelector(":scope > .edit-form-overlay");
		if (prior) prior.remove();

		const overlay = el("div", { class: "edit-form-overlay" });
		overlay.appendChild(el("h3", { text: "Add product" }));

		const formBody = el("div", { class: "edit-form-body" });
		currentEditCategory = "products";
		currentEditSlug = "general";
		formBody.appendChild(generateForm(schema.schema_json || {}, {}, ""));
		overlay.appendChild(formBody);

		overlay.appendChild(
			buildActions(
				async () => {
					const collected = collectForm(formBody);
					const name = collected.name;
					const category = collected.category;
					const status = collected.status || "concept";
					if (!name) {
						toast("Name is required.", "error");
						return;
					}
					if (!category) {
						toast("Category is required.", "error");
						return;
					}
					try {
						await api("POST", API.products, {
							name,
							category,
							status,
							data: collected,
						});
						overlay.remove();
						if (window.AGF && window.AGF.refreshProducts) {
							await window.AGF.refreshProducts();
						}
					} catch (err) {
						toast("Save failed: " + err.message, "error");
					}
				},
				() => overlay.remove(),
			),
		);

		grid.parentNode.insertBefore(overlay, grid);
		overlay.scrollIntoView({ behavior: "smooth", block: "center" });
	}

	function confirmDeleteProduct(slug) {
		confirmDialog(
			"Delete this product?",
			"Slug: " + slug + ". This cannot be undone.",
			"Delete",
			async () => {
				try {
					await api("DELETE", API.products + "/" + slug);
					toast("Product deleted.", "success");
					if (window.AGF && window.AGF.refreshProducts) {
						await window.AGF.refreshProducts();
					}
				} catch (err) {
					toast("Delete failed: " + err.message, "error");
				}
			},
		);
	}

	// ---------- confirmation dialog ----------------------------------------
	function confirmDialog(title, message, confirmLabel, onConfirm) {
		const overlay = el("div", { class: "confirm-overlay" });
		const dialog = el("div", { class: "confirm-dialog" });
		dialog.appendChild(el("h3", { text: title }));
		dialog.appendChild(el("p", { text: message }));
		const actions = el("div", {
			class: "form-actions",
			style: "justify-content:center;border-top:none;padding-top:0",
		});
		actions.appendChild(
			el("button", {
				type: "button",
				class: "btn-cancel",
				text: "Cancel",
				onClick: () => overlay.remove(),
			}),
		);
		actions.appendChild(
			el("button", {
				type: "button",
				class: "btn-danger",
				text: confirmLabel || "Confirm",
				onClick: async () => {
					overlay.remove();
					await onConfirm();
				},
			}),
		);
		dialog.appendChild(actions);
		overlay.appendChild(dialog);
		overlay.addEventListener("click", (e) => {
			if (e.target === overlay) overlay.remove();
		});
		document.body.appendChild(overlay);
	}

	// ---------- drag-drop image handling ------------------------------------
	function bindDragDrop() {
		const targets = [
			document.getElementById("app"),
			document.querySelector("header.nav"),
			document.querySelector("footer.foot"),
		].filter(Boolean);

		targets.forEach((target) => {
			// Remove previous listeners by replacing the element's event is idempotent
			// due to the drag-state guard.
			target.addEventListener("dragover", onDragOver);
			target.addEventListener("dragleave", onDragLeave);
			target.addEventListener("drop", onDrop);
		});
	}

	let _dragCounter = 0; // track enter/leave nesting

	function onDragOver(e) {
		if (!e.dataTransfer || !e.dataTransfer.types.includes("Files")) return;
		e.preventDefault();
		e.dataTransfer.dropEffect = "copy";
		// Highlight the closest section/card
		const section = e.target.closest("[data-section-id]");
		const card = e.target.closest(".product-card");
		const structural = e.target.closest(
			".nav-inner[data-section-id], .foot-inner[data-section-id]",
		);
		const highlight = structural || section || card;
		if (highlight) highlight.classList.add("is-dragover");
		_dragCounter++;
	}

	function onDragLeave(e) {
		_dragCounter--;
		if (_dragCounter <= 0) {
			_dragCounter = 0;
			// Remove all dragover highlights
			$$(".is-dragover").forEach((el) => el.classList.remove("is-dragover"));
		}
	}

	async function onDrop(e) {
		e.preventDefault();
		_dragCounter = 0;
		$$(".is-dragover").forEach((el) => el.classList.remove("is-dragover"));

		if (!e.dataTransfer || !e.dataTransfer.files.length) return;
		const file = e.dataTransfer.files[0];
		if (!file.type.startsWith("image/")) {
			toast("Only image files can be dropped.", "error");
			return;
		}

		// Find the closest target: product card > section > structural container
		const card = e.target.closest(".product-card");
		const section = e.target.closest("[data-section-id]");
		const structural = e.target.closest(
			".nav-inner[data-section-id], .foot-inner[data-section-id]",
		);
		const target = structural || section || card;
		if (!target) {
			toast("Drop target not found.", "error");
			return;
		}

		const productSlug = card ? card.getAttribute("data-product-slug") : null;
		const sectionId = target.getAttribute("data-section-id");

		// Upload
		const formData = new FormData();
		const category = productSlug ? "products" : "sections";
		const slug = productSlug || target.getAttribute("data-schema") || "general";
		formData.append("category", category);
		formData.append("slug", slug);
		formData.append("spec", "background");
		formData.append("file", file);

		try {
			const res = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});
			const data = await res.json();
			if (!data || !data.success) {
				toast((data && data.error) || "Upload failed", "error");
				return;
			}
			const imagePath = data.relativePath;

			if (productSlug && card) {
				const product = await api("GET", API.products + "/" + productSlug);
				const productData = product && product.data ? { ...product.data } : {};
				productData._background_image = imagePath;
				await api("PUT", API.products + "/" + productSlug, {
					name: product.name,
					category: product.category,
					status: product.status,
					data: productData,
				});
				applyBackgroundImage(card, imagePath);
				toast("Background image set.", "success");
			} else if (sectionId) {
				const section = await api("GET", API.sections + "/" + sectionId);
				const sectionData = section && section.data ? { ...section.data } : {};
				sectionData._background_image = imagePath;
				await api("PUT", API.sections + "/" + sectionId, {
					data: sectionData,
					title: section.title,
				});
				applyBackgroundImage(target, imagePath);
				toast("Background image set.", "success");
			}
		} catch (err) {
			toast("Drop upload failed: " + err.message, "error");
		}
	}

	// ---------- boot --------------------------------------------------------
	function waitForAppMount(cb) {
		const app = $("#app");
		if (!app) {
			setTimeout(() => waitForAppMount(cb), 100);
			return;
		}
		if (app.getAttribute("aria-busy") === "false" && app.children.length > 0) {
			cb();
			return;
		}
		const obs = new MutationObserver(() => {
			if (
				app.getAttribute("aria-busy") === "false" &&
				app.children.length > 0
			) {
				obs.disconnect();
				cb();
			}
		});
		obs.observe(app, {
			attributes: true,
			childList: true,
			subtree: false,
			attributeFilter: ["aria-busy"],
		});
		// failsafe
		setTimeout(() => {
			obs.disconnect();
			cb();
		}, 6000);
	}

	function boot() {
		waitForAppMount(() => {
			injectAddButton();
			bindClickToEdit();
			bindContextMenu();
			bindDragDrop();
			bindInsertedTextDrag();
			bindInsertedTextEdit();
			bindInsertedTextResize();
		});
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", boot);
	} else {
		boot();
	}

	// Expose rebind for app.js refresh hooks.
	function rebind() {
		injectAddButton();
		bindClickToEdit();
		bindContextMenu();
		bindDragDrop();
		bindInsertedTextDrag();
		bindInsertedTextEdit();
		bindInsertedTextResize();
	}

	window.AGFEditor = {
		rebind,
		generateForm,
		collectForm,
	};
})();
