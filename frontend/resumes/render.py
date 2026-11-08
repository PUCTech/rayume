# Renders page 1 of each compiled resume to PNG for the landing page, plus a vector SVG of
# the hero resume (the lens magnifies it 2x, which any raster would blur) and its text layer
# (positions of every text run, laid invisibly over the SVG so the resume can be selected).
# Usage: uv run --with pymupdf python render.py
import json, sys, pymupdf
out = "../public/resumes"
for name, width in [("classic", 2000), ("modern", 1000), ("jake", 1000), ("awesome", 1000), ("moderncv", 1000), ("altacv", 1000)]:
    doc = pymupdf.open(f"{out}/{name}.pdf")
    assert doc.page_count == 1, f"{name} spills onto {doc.page_count} pages"
    page = doc[0]
    if name == "classic":
        open(f"{out}/{name}.svg", "w").write(page.get_svg_image(text_as_path=True))
        # [x, baseline y, font size, width, text] in PDF points (page is 612 x 792)
        runs = [
            [round(s["origin"][0], 1), round(s["origin"][1], 1), round(s["size"], 2), round(s["bbox"][2] - s["bbox"][0], 1), s["text"]]
            for b in page.get_text("dict")["blocks"] if b["type"] == 0
            for l in b["lines"] for s in l["spans"] if s["text"].strip()
        ]
        json.dump(runs, open(f"{name}-text.json", "w"), ensure_ascii=False)
    page.get_pixmap(matrix=pymupdf.Matrix(width / page.rect.width, width / page.rect.width)).save(f"{out}/{name}.png")
    if "-v" in sys.argv:
        h = page.rect.height
        print(name, {s: round(r[0].y0 / h, 3) for s in ["Experience", "Projects", "Education", "Technical Skills"] if (r := page.search_for(s))})
