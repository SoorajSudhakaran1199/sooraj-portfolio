import os

PORTFOLIO_DIR = '/Users/soorajsudhakaran/Desktop/Personal/sooraj-portfolio'

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. FIX THE CSS THEME MAPPING
style_css = read_file(f'{PORTFOLIO_DIR}/style.css')
# Swap the root & dark markers
# Current:
# :root { light mode variables }
# [data-theme="dark"] { dark mode variables }

# Let's replace the whole THEME DEFINITIONS block
THEME_BLOCK = """/* --- THEME DEFINITIONS --- */
:root {
  --bg-color-1: #050812;
  --bg-color-2: #080d1e;
  --bg-color-3: #0a1126;
  --bg-radial-1: rgba(121, 168, 255, 0.16);
  --bg-radial-2: rgba(142, 240, 208, 0.14);
  --text-primary: #f0f4ff;
  --text-muted: #a3b3d4;
  --theme-accent: #5c93ff;
  --theme-accent-2: #65f0c4;
  --theme-success: #20f25e;
  --theme-line: rgba(255, 255, 255, 0.06);
  --theme-line-strong: rgba(255, 255, 255, 0.12);

  --card-bg: rgba(255, 255, 255, 0.03);
  --card-bg-hover: rgba(255, 255, 255, 0.06);
  --card-border: rgba(255, 255, 255, 0.08);
  --card-border-hover: rgba(142, 240, 208, 0.3);
  --card-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  --card-shadow-hover: 0 24px 48px rgba(0, 0, 0, 0.6), 0 0 35px rgba(121, 168, 255, 0.12);

  --nav-bg: rgba(8, 12, 22, 0.65);
  --nav-border: rgba(255, 255, 255, 0.06);

  --btn-bg: rgba(255, 255, 255, 0.04);
  --btn-border: rgba(255, 255, 255, 0.1);
  --btn-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  --btn-hover-shadow: 0 16px 32px rgba(0, 0, 0, 0.4), 0 0 24px rgba(121, 168, 255, 0.3);

  --hero-title-gradient: linear-gradient(135deg, #ffffff 0%, #d4e0ff 100%);
  
  --milestone-dot: #65f0c4;
  --milestone-dot-glow: rgba(142, 240, 208, 0.6);
}

[data-theme="light"] {
  --bg-color-1: #f8fafc;
  --bg-color-2: #f1f5f9;
  --bg-color-3: #e2e8f0;
  --bg-radial-1: rgba(37, 99, 235, 0.06);
  --bg-radial-2: rgba(5, 150, 105, 0.04);
  --text-primary: #0f172a;
  --text-muted: #475569;
  --theme-accent: #2563eb;
  --theme-accent-2: #059669;
  --theme-success: #16a34a;
  --theme-line: rgba(0, 0, 0, 0.08);
  --theme-line-strong: rgba(0, 0, 0, 0.14);
  
  --card-bg: rgba(255, 255, 255, 0.65);
  --card-bg-hover: rgba(255, 255, 255, 0.9);
  --card-border: rgba(255, 255, 255, 0.6);
  --card-border-hover: rgba(37, 99, 235, 0.3);
  --card-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
  --card-shadow-hover: 0 24px 48px rgba(0, 0, 0, 0.1), 0 0 35px rgba(37, 99, 235, 0.08);
  
  --nav-bg: rgba(255, 255, 255, 0.85);
  --nav-border: rgba(0, 0, 0, 0.06);

  --btn-bg: rgba(255, 255, 255, 0.9);
  --btn-border: rgba(0, 0, 0, 0.12);
  --btn-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
  --btn-hover-shadow: 0 16px 32px rgba(0,0,0,0.12), 0 0 24px rgba(37, 99, 235, 0.2);

  --hero-title-gradient: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  
  --milestone-dot: #059669;
  --milestone-dot-glow: rgba(5, 150, 105, 0.4);
}"""

if "/* --- THEME DEFINITIONS --- */" in style_css:
    _parts = style_css.split("/* --- THEME DEFINITIONS --- */")
    after_theme_split = _parts[1].split(".theme-toggle {", 1)  # split at where theme block ends
    rem = ".theme-toggle {" + after_theme_split[1]
    style_css = THEME_BLOCK + "\n\n" + rem

write_file(f'{PORTFOLIO_DIR}/style.css', style_css)

# 2. MODIFY HTML FILES
def update_html(path):
    html = read_file(path)
    # Default to dark instead of light
    html = html.replace("localStorage.getItem('theme') || 'light'", "localStorage.getItem('theme') || 'dark'")
    
    # Inject canvas into body and load app.js
    if '<canvas id="bg-canvas"' not in html:
        html = html.replace('<body>', '<body>\n  <canvas id="bg-canvas" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1; pointer-events: none;"></canvas>')
    
    if '<script src="app.js" defer></script>' not in html:
        html = html.replace('</body>', '  <script src="app.js" defer></script>\n</body>')
        
    write_file(path, html)

update_html(f'{PORTFOLIO_DIR}/index.html')
update_html(f'{PORTFOLIO_DIR}/journey.html')

print("Applied Theme updates & Canvas setup successfully!")
