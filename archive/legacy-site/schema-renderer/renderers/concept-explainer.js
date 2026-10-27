/*
 * renderers/concept-explainer.js — Renderer: concept-explainer.
 * Flexible explanatory section with typed modules (reason_list, subsection,
 * overview_block, text_image) sorted by display_order.
 */
((AGF) => {
	const TAG = "agf:concept-explainer";
	try {
		// ── Generated bridge: pull shared helpers into local scope ──
		// (the verbatim source below references these as bare names)
		const H = AGF.helpers || {};
		const esc = H.esc,
			md = H.md,
			toRoman = H.toRoman,
			appendixRef = H.appendixRef,
			fmtUSD = H.fmtUSD,
			fmtRange = H.fmtRange,
			splitHeadline = H.splitHeadline,
			groupIndependents = H.groupIndependents;
		const HG = AGF.heading || {};
		const head = HG.head,
			sanitizeHeadingTitle = HG.sanitizeHeadingTitle;

		// Format an item's optional monetary value or numeric range for inline
		// display. Shared across reason_list / subsection / overview_block.
		const itemValueHTML = (item) => {
			if (typeof item.value === "number") {
				return ` <span class="item-value">${fmtUSD(item.value)}</span>`;
			}
			if (item.value_range) {
				return ` <span class="item-range">${fmtRange(item.value_range)}</span>`;
			}
			return "";
		};

		// ───── Module-type renderers ─────

		/**
		 * Render a reason_list module: headline, optional body (hidden if
		 * hide_blurb), items, optional image.
		 */
		function renderReasonList(mod, idx) {
			const id = mod.id || "module-" + idx;
			const headline = mod.headline || "";
			const body = mod.body || "";
			const hideBlurb = mod.hide_blurb === true;
			const rawItems = Array.isArray(mod.items) ? mod.items : [];
			const image = mod.image || "";
			const hlParts = headline ? splitHeadline(headline) : null;

			const itemGroups = groupIndependents(rawItems);
			const itemsHTML = itemGroups
				.map(
					(g) =>
						(g.key !== "Other"
							? `<h4 class="ce-group-label">${esc(g.key)}</h4>`
							: "") +
						g.items
							.map((item) => {
								const ii = item._origIdx;
								const valueHTML = itemValueHTML(item);
								return `
      <li data-field="modules.${idx}.items.${ii}" data-reveal>
        ${md(item.text || item)}${valueHTML}
      </li>`;
							})
							.join(""),
				)
				.join("");

			const imageHTML = image
				? `
      <div class="ce-image" data-field="modules.${idx}.image" data-reveal>
        <img src="${esc(image)}" alt="${esc(headline)}" loading="lazy" />
      </div>`
				: "";

			return `
      <div class="ce-module ce-reason-list" data-module-id="${esc(id)}" data-module-type="reason_list" data-field="modules.${idx}" data-reveal>
        <div class="ce-module-content">
          <h3 data-field="modules.${idx}.headline">${hlParts ? `${esc(hlParts.a)} <em>${sanitizeHeadingTitle(hlParts.b)}</em>` : sanitizeHeadingTitle(headline)}</h3>
          ${!hideBlurb && body ? `<div class="ce-body" data-field="modules.${idx}.body">${md(body)}</div>` : ""}
          ${itemsHTML ? `<ul class="ce-list">${itemsHTML}</ul>` : ""}
        </div>
        ${imageHTML}
      </div>`;
		}

		/**
		 * Render a subsection module: headline, subhead, body, image (left/right),
		 * items.
		 */
		function renderSubsection(mod, idx) {
			const id = mod.id || "module-" + idx;
			const headline = mod.headline || "";
			const subhead = mod.subhead || "";
			const body = mod.body || "";
			const image = mod.image || "";
			const imagePosition = mod.image_position || "right";
			const rawItems = Array.isArray(mod.items) ? mod.items : [];
			const hlParts = headline ? splitHeadline(headline) : null;

			const itemGroups = groupIndependents(rawItems);
			const itemsHTML = itemGroups
				.map(
					(g) =>
						(g.key !== "Other"
							? `<h4 class="ce-group-label">${esc(g.key)}</h4>`
							: "") +
						g.items
							.map((item) => {
								const ii = item._origIdx;
								const valueHTML = itemValueHTML(item);
								return `
      <li data-field="modules.${idx}.items.${ii}" data-reveal>
        ${md(item.text || item)}${valueHTML}
      </li>`;
							})
							.join(""),
				)
				.join("");

			const imageHTML = image
				? `
      <div class="ce-image" data-field="modules.${idx}.image" data-reveal>
        <img src="${esc(image)}" alt="${esc(headline)}" loading="lazy" />
      </div>`
				: "";

			const imgFirst = imagePosition === "left";
			const imgPos = esc(imagePosition);

			return `
      <div class="ce-module ce-subsection ce-subsection-${imgPos}" data-module-id="${esc(id)}" data-module-type="subsection" data-field="modules.${idx}" data-reveal>
        ${imgFirst ? imageHTML : ""}
        <div class="ce-module-content">
          <h3 data-field="modules.${idx}.headline">${hlParts ? `${esc(hlParts.a)} <em>${sanitizeHeadingTitle(hlParts.b)}</em>` : sanitizeHeadingTitle(headline)}</h3>
          ${subhead ? `<p class="ce-subhead" data-field="modules.${idx}.subhead">${esc(subhead)}</p>` : ""}
          ${body ? `<div class="ce-body" data-field="modules.${idx}.body">${md(body)}</div>` : ""}
          ${itemsHTML ? `<ul class="ce-list">${itemsHTML}</ul>` : ""}
        </div>
        ${!imgFirst ? imageHTML : ""}
      </div>`;
		}

		/**
		 * Render an overview_block module: headline, body, items.
		 */
		function renderOverviewBlock(mod, idx) {
			const id = mod.id || "module-" + idx;
			const headline = mod.headline || "";
			const body = mod.body || "";
			const rawItems = Array.isArray(mod.items) ? mod.items : [];
			const hlParts = headline ? splitHeadline(headline) : null;

			const itemGroups = groupIndependents(rawItems);
			const itemsHTML = itemGroups
				.map(
					(g) =>
						(g.key !== "Other"
							? `<h4 class="ce-group-label">${esc(g.key)}</h4>`
							: "") +
						g.items
							.map((item) => {
								const ii = item._origIdx;
								const valueHTML = itemValueHTML(item);
								return `
      <li data-field="modules.${idx}.items.${ii}" data-reveal>
        ${md(item.text || item)}${valueHTML}
      </li>`;
							})
							.join(""),
				)
				.join("");

			return `
      <div class="ce-module ce-overview-block" data-module-id="${esc(id)}" data-module-type="overview_block" data-field="modules.${idx}" data-reveal>
        <div class="ce-module-content">
          <h3 data-field="modules.${idx}.headline">${hlParts ? `${esc(hlParts.a)} <em>${sanitizeHeadingTitle(hlParts.b)}</em>` : sanitizeHeadingTitle(headline)}</h3>
          ${body ? `<div class="ce-body" data-field="modules.${idx}.body">${md(body)}</div>` : ""}
          ${itemsHTML ? `<ul class="ce-list">${itemsHTML}</ul>` : ""}
        </div>
      </div>`;
		}

		/**
		 * Render a text_image module: headline, body, image, text_position
		 * left/right.
		 */
		function renderTextImage(mod, idx) {
			const id = mod.id || "module-" + idx;
			const headline = mod.headline || "";
			const body = mod.body || "";
			const image = mod.image || "";
			const textPosition = mod.text_position || "right";
			const hlParts = headline ? splitHeadline(headline) : null;

			const imageHTML = image
				? `
      <div class="ce-image" data-field="modules.${idx}.image" data-reveal>
        <img src="${esc(image)}" alt="${esc(headline)}" loading="lazy" />
      </div>`
				: "";

			const textFirst = textPosition === "left";
			const txtPos = esc(textPosition);
			const headlineHTML = hlParts
				? `${esc(hlParts.a)} <em>${sanitizeHeadingTitle(hlParts.b)}</em>`
				: sanitizeHeadingTitle(headline);
			const contentHTML = `
        <div class="ce-module-content">
          <h3 data-field="modules.${idx}.headline">${headlineHTML}</h3>
          ${body ? `<div class="ce-body" data-field="modules.${idx}.body">${md(body)}</div>` : ""}
        </div>`;

			return `
      <div class="ce-module ce-text-image ce-text-${txtPos}" data-module-id="${esc(id)}" data-module-type="text_image" data-field="modules.${idx}" data-reveal>
        ${textFirst ? contentHTML : imageHTML}
        ${textFirst ? imageHTML : contentHTML}
      </div>`;
		}

		// ───── Main render entry ─────

		function renderConceptExplainer(data) {
			const d = data || {};
			const modules = Array.isArray(d.modules) ? d.modules : [];

			// Sort modules by display_order, then render each by type
			const sorted = modules.slice().sort((a, b) => {
				const ao = typeof a.display_order === "number" ? a.display_order : 999;
				const bo = typeof b.display_order === "number" ? b.display_order : 999;
				return ao - bo;
			});

			const modulesHTML = sorted
				.map((mod, sortedIdx) => {
					// Find original index for data-field keys
					const origIdx = modules.indexOf(mod);
					const type = mod.type || "overview_block";

					let html;
					switch (type) {
						case "reason_list":
							html = renderReasonList(mod, origIdx);
							break;
						case "subsection":
							html = renderSubsection(mod, origIdx);
							break;
						case "overview_block":
							html = renderOverviewBlock(mod, origIdx);
							break;
						case "text_image":
							html = renderTextImage(mod, origIdx);
							break;
						default:
							// Fall back to overview_block for unknown types
							html = renderOverviewBlock(mod, origIdx);
							break;
					}
					// Wire sortedIdx as a display-order attribute.
					// The `m` flag is required: each module's HTML template begins with a
					// newline, so without multiline mode `^` only anchors at string start
					// (before that leading \n) and the injection silently no-ops.
					// Wire appendixRef if the module has appendix data.
					return (
						html.replace(
							/^([ \t]*<div[^>]*)>/m,
							'$1 data-sort-order="' + sortedIdx + '">',
						) + (mod.appendix ? appendixRef("modules." + origIdx) : "")
					);
				})
				.join("");

			return `
      <section class="section" id="concept-explainer" data-schema="concept-explainer">
        ${head({
					num: d.section_number !== null ? toRoman(d.section_number) : "",
					numPath: "section_number",
					label: d.section_label || "",
					labelPath: "section_label",
					title: d.section_title || "How It Works",
					titlePath: "section_title",
					deck: d.intro_text || "",
					deckPath: "intro_text",
					marginToMargin: d._margin_to_margin,
					data: d,
				})}
        ${modulesHTML ? `<div class="ce-modules" data-layout="${esc(d.layout || "grid")}">${modulesHTML}</div>` : ""}
        ${d.footnote ? `<p class="ce-footnote" data-field="footnote" data-reveal>${md(d.footnote)}</p>` : ""}
      </section>`;
		}

		AGF.renderers = AGF.renderers || {};
		AGF.renderers["concept-explainer"] = renderConceptExplainer;
	} catch (e) {
		console.error("[" + TAG + "] load failed:", e);
		if (window !== undefined) {
			var _a = (window.AGF = window.AGF || {});
			_a._errors = _a._errors || [];
			_a._errors.push({
				ts: Date.now(),
				scope: "concept-explainer",
				stage: "load",
				message: (e && e.message) || String(e),
				error: e,
			});
		}
	}
})((window.AGF = window.AGF || {}));
