#!/bin/sh
# Rebuilds the landing page resumes: compiles each template with Tectonic, then renders PNGs.
# Needs `tectonic` (brew install tectonic) and `uv`.
set -e
cd "$(dirname "$0")"
for t in classic modern jake awesome moderncv altacv; do
  tectonic -X compile --outdir ../public/resumes "$t.tex"
done
uv run -q --no-project --with pymupdf python -I render.py "$@"
