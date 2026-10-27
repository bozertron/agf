#!/usr/bin/env sh
# Serve production-staging locally (site + assets). Browsers refuse to fetch
# JSON over file://, so open http://localhost:8787/site/ after running this.
# Needs only python3.
cd "$(dirname "$0")/.." && echo "Open http://localhost:8787/site/" && python3 -m http.server 8787
