import re

path = "/Users/soorajsudhakaran/Desktop/Personal/sooraj-portfolio/journey.html"
with open(path, "r", encoding="utf-8") as f:
    html = f.read()

html = re.sub(r'<canvas[^>]*id="bg-canvas"[^>]*></canvas>', '', html)
html = re.sub(r'<script[^>]*src="app.js"[^>]*></script>', '', html)

with open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("Canvas scrubbed!")
