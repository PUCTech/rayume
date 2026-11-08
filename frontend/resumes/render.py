# Renders page 1 of each compiled resume to PNG for the landing page, plus a vector SVG of
# the hero resume (the lens magnifies it 2x, which any raster would blur).
# Usage: uv run --with pymupdf python render.py
import sys, pymupdf
out = "../public/resumes"
for name, width in [("classic", 2000), ("modern", 1000), ("elegant", 1000), ("academic", 1000)]:
    doc = pymupdf.open(f"{out}/{name}.pdf")
    assert doc.page_count == 1, f"{name} spills onto {doc.page_count} pages"
    page = doc[0]
    if name == "classic":
        open(f"{out}/{name}.svg", "w").write(page.get_svg_image(text_as_path=True))
    page.get_pixmap(matrix=pymupdf.Matrix(width / page.rect.width, width / page.rect.width)).save(f"{out}/{name}.png")
    if "-v" in sys.argv:
        h = page.rect.height
        print(name, {s: round(page.search_for(s)[0].y0 / h, 3) for s in ["Experience", "Projects", "Education", "Technical Skills"]})
