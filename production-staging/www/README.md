# www — one app per page

Each page of the site is a folder with an `index.html` that is a complete application: its copy and settings sit inline in a `<script type="application/json" id="db">` block, its own styles and behaviour can sit inline too, and it links the shared chrome with relative paths. Open any `index.html` straight from disk and it works; copy the whole `www/` folder to any static host and it works there too. No build, no server, no router.

## The glue, in five rules

1. **A page is a folder.** `www/index.html` is Home; `www/globl-radio/index.html` is Globl Radio; `www/globl-radio/artists/index.html` is its Artists page. Navigation is plain relative links, so the folder tree is the site map.
2. **A page's data is inline.** The `#db` JSON block holds everything that page needs (media lists, copy, the email-capture target). Browsers refuse `fetch()` from `file://`, so nothing is fetched; inline JSON is what makes a page open from disk. `shared/www.js` parses it into `window.DB`.
3. **Shared things live in `shared/` and are linked relatively.** `agf.css` (the design system, fonts embedded), `www.css` (header, panels, pages, capture form) and `www.js` (header, footer, media cycling, email capture, the home strapline reveal). Stylesheets and scripts load fine from `file://`. Each page tells the script where the root is with `<body data-root="../">`, so the header's links and the logo paths resolve from any depth.
4. **Change the chrome once.** Because the header and footer are drawn by `www.js`, a change to them reaches every page without touching the pages. Page content is the page's own business.
5. **Media sits beside the page or in `www/media/`.** A panel declares `data-media="sound"` and the page's `DB.media.sound` lists the images or videos to cycle. Drop in a video (`{"type":"video","src":"media/globl.mp4"}`) and the panel switches to it on its own; the Globl Radio panel fades its green plate out and moves the white logo to the corner at 55% when its media list is non-empty.

## Email capture

`DB.capture` on a page sets `list` (what the address is for) and either `endpoint` (an HTTPS URL that accepts a JSON POST of `{email, list, page}`, for example a form service or a small function) or `mailto` (the address a prepared mail is opened for). With no endpoint set, submitting opens the visitor's mail app with the request written. `hello@agf.brand` is a placeholder from the old document; replace it.

## What is here now

| Page | Status |
|---|---|
| Home (`index.html`) | Built to the spec: header with the strapline reveal and the power-tech layer, Globl Radio and Sound Systems panels at two thirds of the stage, Broadcast, Software, Business and Blog beneath. Interim media cycles existing renders; the Globl Radio video, the Sound Systems loop and the Software screenshots are slots waiting for files. |
| Globl Radio (`globl-radio/`) | Built to the spec, with Apply for early access, Artists, Venues and Opportunities, each with its own capture list. |
| Power-tech pages (`power/*`) | The four panels' content, as asked, until the stories are written. |
| Concierge, Sound Systems, Broadcast, Software, Business, Blog | Link targets with a title only; their specs are still to come. |

## Adding a page

Copy any inner page, change `<title>`, the `#db` block and the copy inside `<main>`, keep `data-root` pointing back at `www/`, and link to it from a panel. That is the whole process.
