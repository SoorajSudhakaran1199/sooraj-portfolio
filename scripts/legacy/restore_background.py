import re

PORTFOLIO = "/Users/soorajsudhakaran/Desktop/Personal/sooraj-portfolio"

# Add canvas to index and journey
for file in ['index.html', 'journey.html']:
    with open(f'{PORTFOLIO}/{file}', 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Avoid duplicate injection
    if '<canvas id="bg-canvas"' not in html:
        # Inject right after <body>
        html = re.sub(r'(<body[^>]*>)', r'\1\n  <canvas id="bg-canvas"></canvas>', html)
        
    if '<script src="app.js"' not in html:
        # Inject before </body>
        html = re.sub(r'(</body>)', r'  <script src="app.js"></script>\n\1', html)
        
    with open(f'{PORTFOLIO}/{file}', 'w', encoding='utf-8') as f:
        f.write(html)

# Add CSS for bg-canvas
with open(f'{PORTFOLIO}/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

if '#bg-canvas' not in css:
    canvas_css = """\n
/* --- ROBOTICS BACKGROUND CANVAS --- */
#bg-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -10;
    pointer-events: none;
    opacity: 0.6;
    transition: opacity 0.5s ease;
}
[data-theme="light"] #bg-canvas {
    opacity: 0.2;
}
"""
    css += canvas_css
    with open(f'{PORTFOLIO}/style.css', 'w', encoding='utf-8') as f:
        f.write(css)

print("Background canvas and scripts successfully remounted.")
