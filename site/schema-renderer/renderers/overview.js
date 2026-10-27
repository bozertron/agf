/*
 * renderers/overview.js — Renderer: overview.
 * High-level orienting section with headline, summary, metrics, and highlights.
 * Supports mode="text" (body text) and mode="image" (image alongside text).
 */
((AGF) => {
	const TAG = "agf:overview";
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

		// ───── VERBATIM source ─────
		function renderOverview(data) {
			const d = data || {};
			const mode = d.mode || "text";
			const headline = d.headline || "";
			let hlParts = null;
			if (headline) hlParts = splitHeadline(headline);
			const summary = d.summary || "";
			const image = d.image || "";
			const imagePosition = d.image_position || "right";
			const metrics = Array.isArray(d.metrics) ? d.metrics : [];
			const rawHighlights = Array.isArray(d.highlights) ? d.highlights : [];
			const highlightGroups = groupIndependents(rawHighlights);

			// Render a metric value: USD figure, numeric range, or raw text.
			const metricValueHTML = (m) => {
				if (typeof m.value === "number") return fmtUSD(m.value);
				if (m.value_range) return fmtRange(m.value_range);
				return esc(m.value || "");
			};

			// Metrics grid
			const metricsHTML = metrics
				.map((m, mi) => {
					return `
        <div class="ov-metric" data-field="metrics.${mi}" data-reveal>
          <span class="ov-metric-value" data-field="metrics.${mi}.value">${metricValueHTML(m)}</span>
          <span class="ov-metric-label" data-field="metrics.${mi}.label">${esc(m.label || "")}</span>
          ${m.context ? `<span class="ov-metric-context" data-field="metrics.${mi}.context">${esc(m.context)}</span>` : ""}
                </div>${m.appendix ? appendixRef("metrics." + mi) : ""}`;
				})
				.join("");

			// Highlights list
			const highlightsHTML = highlightGroups
				.map((g) =>
					g.items
						.map((h) => {
							const origIdx = h._origIdx;
							return `
        <li class="ov-highlight" data-field="highlights.${origIdx}" data-reveal>
          ${h.icon ? `<span class="ov-highlight-icon" data-field="highlights.${origIdx}.icon">${esc(h.icon)}</span>` : ""}
          <div class="ov-highlight-content">
            <strong data-field="highlights.${origIdx}.title">${esc(h.title || "")}</strong>
            ${h.description ? `<span data-field="highlights.${origIdx}.description">${esc(h.description)}</span>` : ""}
          </div>
                </li>${h.appendix ? appendixRef("highlights." + origIdx) : ""}`;
						})
						.join(""),
				)
				.join("");

			// Image element (only for image mode)
			let imageHTML = "";
			if (image) {
				imageHTML = `
      <div class="ov-image" data-field="image" data-reveal>
        <img src="${esc(image)}" alt="${esc(headline || "Overview")}" loading="lazy" />
      </div>`;
			}

			// Body content — headline + summary text. Precompute the headline
			// markup so the body template stays a flat interpolation.
			let headlineHTML = "";
			if (hlParts) {
				headlineHTML = `<p class="ov-headline" data-field="headline">${esc(hlParts.a)} <em>${sanitizeHeadingTitle(hlParts.b)}</em></p>`;
			} else if (headline) {
				headlineHTML = `<p class="ov-headline" data-field="headline">${md(headline)}</p>`;
			}
			const bodyHTML = `
      <div class="ov-body" data-reveal>
        ${headlineHTML}
        ${summary ? `<div class="ov-summary" data-field="summary">${md(summary)}</div>` : ""}
      </div>`;

			// Metrics + highlights (shared between modes)
			let extrasHTML = "";
			if (metricsHTML || highlightsHTML) {
				const metricsBlock = metricsHTML
					? `<div class="ov-metrics">${metricsHTML}</div>`
					: "";
				const highlightsBlock = highlightsHTML
					? `<ul class="ov-highlights">${highlightsHTML}</ul>`
					: "";
				extrasHTML = `
      <div class="ov-extras" data-reveal>
        ${metricsBlock}
        ${highlightsBlock}
      </div>`;
			}

			// Content layout — text mode vs image mode
			let contentHTML;
			if (mode === "image" && image) {
				const imgPos = esc(imagePosition);
				const imgFirst = imagePosition === "left";
				let leadingHTML = "";
				let trailingHTML = "";
				let textInner = "";
				if (imgFirst) {
					leadingHTML = imageHTML;
					textInner = extrasHTML;
				} else {
					leadingHTML = bodyHTML;
					textInner = bodyHTML;
					trailingHTML = imageHTML;
				}
				contentHTML = `
        <div class="ov-content ov-content-image ov-content-${imgPos}" data-reveal>
          ${leadingHTML}
          <div class="ov-text">
            ${textInner}
            ${extrasHTML}
          </div>
          ${trailingHTML}
        </div>`;
			} else {
				contentHTML = `
        <div class="ov-content" data-reveal>
          ${bodyHTML}
          ${extrasHTML}
        </div>`;
			}

			return `
      <section class="section" id="overview" data-schema="overview">
        ${head({
					num: d.section_number !== null ? toRoman(d.section_number) : "",
					numPath: "section_number",
					label: d.section_label || "",
					labelPath: "section_label",
					title: sanitizeHeadingTitle(d.section_title || "Overview"),
					titlePath: "section_title",
					deck: d.intro_text || "",
					deckPath: "intro_text",
					marginToMargin: d._margin_to_margin,
					data: d,
				})}
        ${contentHTML}
      </section>`;
		}

		AGF.renderers = AGF.renderers || {};
		AGF.renderers["overview"] = renderOverview;
	} catch (e) {
		console.error("[" + TAG + "] load failed:", e);
		if (window !== undefined) {
			var _a = (window.AGF = window.AGF || {});
			_a._errors = _a._errors || [];
			_a._errors.push({
				ts: Date.now(),
				scope: "overview",
				stage: "load",
				message: (e && e.message) || String(e),
				error: e,
			});
		}
	}
})((window.AGF = window.AGF || {}));
