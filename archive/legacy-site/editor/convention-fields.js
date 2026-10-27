/* ========================================================================
 * site/editor/convention-fields.js
 * Purpose: Shared helper to PRESERVE convention fields during full-PUT saves,
 *          killing the "stale fullData clobbers server-side convention arrays"
 *          bug class (see A-editor.md §4: "Shared helper to extract").
 * Module tag: [agf:convention-fields]
 *
 * STATUS: NEW FILE (Phase-2 polish deliverable). NOT yet wired into the save
 *         handlers — that is a logic change beyond polish scope and is flagged
 *         as a follow-up (see A-editor.md §6 Phase-2 checklist, and chunk-8 #2
 *         / chunk-9 #1). The 4 save handlers that should adopt it:
 *           - item-editor.js   performSave()        (~editor.js :995)
 *           - section-form.js  openSectionEdit()    (~editor.js :3890, :3935)
 *           - product-form.js  openProductForm()    (~editor.js :4002)
 *           - bg-settings.js   persistBackgroundSettings()/removeBackgroundImage()
 *         Rewiring them is Ben's reviewed cutover step.
 *
 * WHAT IT DOES
 * ------------
 * Several save handlers currently hand-build a chain like:
 *     if (fullData._style_overrides) merged._style_overrides = fullData._style_overrides;
 *     if (fullData._background_image) merged._background_image = ...;
 *     ... etc ...
 * duplicated across 4+ handlers, AND each one omits/drops different fields.
 * This helper centralizes that logic and logs every field it merges so a
 * clobber (or a successful preserve) leaves a breadcrumb.
 *
 * NOTE on FRESH-GET: preserveConventionFields merges from a `source` snapshot
 * (the data captured at form-open). For fields that may have changed server-side
 * since open (e.g. _texts/_figures via drag/resize), the caller should FIRST run
 * reconcileConventionFields() (section-form.js) to backfill `target` from the
 * server, THEN call this. This helper never OVERWRITES a key already present in
 * `target` — it only fills MISSING convention fields — so the user's in-flight
 * edit always wins. See A-editor.md §4 / item-editor B1 comment.
 *
 * USAGE (intended, post-cutover):
 *     merged = preserveConventionFields(fullData, merged);
 *     // or, after a fresh-GET reconcile:
 *     merged = await reconcileConventionFields(hostType, hostId, merged);
 *     merged = preserveConventionFields(fullData, merged); // belt-and-suspenders
 *
 * Extracted/created by the Phase-2 polish pass. Self-contained (no imports).
 * ======================================================================== */

// === TAG SCAFFOLD (activated in Phase-2 polish pass) =========================
// NOTE: these are module-local consts valid under ES-module wiring (Strategy A).
// For Strategy-B concatenation, strip this block (see LOAD_ORDER.md).
const TAG = "[agf:convention-fields]";
const log = (...a) => console.log(TAG, ...a);
const warn = (...a) => console.warn(TAG, ...a);
const err = (...a) => console.error(TAG, ...a);

/**
 * STANDARD_CONVENTION_FIELDS
 * The underscore-prefixed ("convention") keys that the editor UI manages
 * out-of-band and that must survive a full-data PUT. Mirrors the field list
 * referenced across item-editor / section-form / product-form / bg-settings.
 */
const STANDARD_CONVENTION_FIELDS = [
	"_style_overrides",
	"_background_image",
	"_background_settings",
	"_figures",
	"_texts",
	"_margin_to_margin",
];

/**
 * preserveConventionFields(source, target)
 *
 * Copies every STANDARD_CONVENTION_FIELDS key present on `source` into
 * `target`, but ONLY when `target` does not already define that key. This
 * makes it a safe "fill missing" merge: the caller's explicit intent (e.g.
 * deleting merged._texts so reconcileConventionFields backfills the fresh
 * server copy) is respected.
 *
 * @param {object|null|undefined} source  the stale-in-memory snapshot to read from.
 * @param {object}                target  the merged payload about to be PUT (mutated).
 * @returns {object} the same `target` reference, for chaining.
 */
function preserveConventionFields(source, target) {
	if (!source || typeof source !== "object") return target;
	if (!target || typeof target !== "object") return target;
	var preserved = [];
	for (var i = 0; i < STANDARD_CONVENTION_FIELDS.length; i++) {
		var key = STANDARD_CONVENTION_FIELDS[i];
		// Only fill if missing on target — never overwrite the caller's intent.
		if (target[key] === undefined && source[key] !== undefined) {
			target[key] = source[key];
			preserved.push(key);
		}
	}
	if (preserved.length) {
		log("preserveConventionFields merged", { preserved });
	}
	return target;
}
